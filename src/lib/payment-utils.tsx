import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/pdf/InvoicePDF";
import React from "react";

/**
 * Safely marks an order as APPROVED, credits the user's token balance,
 * creates a ledger entry, and generates/sends the invoice via Resend.
 * Incorporates double-crediting protection.
 */
export async function approveAndCreditOrder(
  orderMerchantId: string,
  transactionId: string | number,
  pionPayDetails: any
) {
  // 1. Fetch the order
  const order = await prisma.order.findUnique({
    where: { orderMerchantId },
  });

  if (!order) {
    throw new Error(`Order ${orderMerchantId} not found in database.`);
  }

  // 2. Double-crediting protection check
  if (order.status === "APPROVED") {
    console.log(`ℹ️ Order ${orderMerchantId} was already approved. Skipping credit logic.`);
    return {
      success: true,
      alreadyApproved: true,
      tokensAdded: order.tokens,
    };
  }

  // 3. Find the associated user
  const user = await prisma.user.findUnique({
    where: { email: order.userEmail || "" },
  });

  if (!user) {
    throw new Error(`User with email ${order.userEmail} not found.`);
  }

  const tokensToAdd = order.tokens ?? 0;
  const newBalance = (user.tokenBalance ?? 0) + tokensToAdd;

  console.log(`💳 Approving payment for order ${orderMerchantId}. Crediting +${tokensToAdd} tokens to ${user.email}.`);

  // 4. Update the user's token balance
  await prisma.user.update({
    where: { id: user.id },
    data: { tokenBalance: newBalance },
  });

  // 5. Update order details and change status to APPROVED
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "APPROVED",
      orderSystemId: String(transactionId),
      response: {
        pionPayDetails,
        timestamp: new Date().toISOString(),
      },
    },
  });

  // 6. Record the transaction in the ledger
  await prisma.ledgerEntry.create({
    data: {
      userId: user.id,
      type: "Top-up",
      delta: tokensToAdd,
      balanceAfter: newBalance,
      currency: order.currency,
      amount: Math.round(order.amount * 100),
      receiptUrl: `order:${orderMerchantId}`,
    },
  });

  console.log(`✅ Ledger entry created for user: ${user.email}`);

  // 7. Render PDF Invoice and send email
  let invoiceDocumentId: string | null = null;
  let invoiceSent = false;

  try {
    const company = await prisma.company.findUnique({
      where: { userId: user.id },
    });

    const invoiceDate = new Date().toISOString().split('T')[0];
    const invoiceNumber = `INV-${orderMerchantId}`;
    const subtotal = Number(order.amount || 0);

    // Create Document record in database
    const invoiceDoc = await prisma.document.create({
      data: {
        userId: user.id,
        title: "Invoice",
        docType: "invoice",
        status: "Ready",
        format: "pdf",
        data: {
          documentNo: invoiceNumber,
          documentDate: invoiceDate,
          sender: {
            company: company?.name || 'CV Makers',
            vat: company?.vat || '',
            address: company?.address1 || '',
            city: company?.city || '',
            country: company?.country || '',
            iban: company?.iban || '',
            bankName: company?.bankName || undefined,
            bic: company?.bic || undefined,
            logoUrl: company?.logoUrl || undefined,
          },
          recipient: {
            name: user.name || user.email?.split('@')[0] || "Customer",
            email: user.email || "",
          },
          content: [
            {
              heading: "Payment Summary",
              text: `Order ID: ${orderMerchantId}\n\nDescription: ${order.description || "Payment"}\n\nTokens: ${tokensToAdd.toLocaleString()}\nTotal: ${order.currency} ${subtotal.toFixed(2)}`,
            },
          ],
          notes: `Thank you for your purchase. Your account has been credited with ${tokensToAdd.toLocaleString()} tokens.`,
        },
      },
    });

    invoiceDocumentId = invoiceDoc.id;

    if (process.env.RESEND_API_KEY && process.env.SMTP_USER) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        let pdfBuffer: Buffer | null = null;

        // Render invoice template to a PDF binary buffer
        try {
          const pdfDoc = (
            <InvoicePDF
              invoiceNumber={invoiceNumber}
              invoiceDate={invoiceDate}
              orderMerchantId={orderMerchantId}
              description={order.description || "Payment"}
              sender={{
                company: company?.name || 'CV Makers',
                vat: company?.vat || '',
                address: company?.address1 || '',
                city: company?.city || '',
                country: company?.country || '',
                iban: company?.iban || '',
                bankName: company?.bankName || undefined,
                bic: company?.bic || undefined,
              }}
              recipient={{
                name: user.name || user.email?.split('@')[0] || "Customer",
                email: user.email || "",
              }}
              payment={{
                tokens: tokensToAdd,
                subtotal,
                vat: 0,
                total: subtotal,
                currency: order.currency,
                newBalance,
              }}
              notes={`Thank you for your purchase. Your account has been credited with ${tokensToAdd.toLocaleString()} tokens.`}
            />
          );

          pdfBuffer = await renderToBuffer(pdfDoc);
        } catch (pdfError) {
          console.error("❌ Failed to render PDF:", pdfError);
        }

        const emailText = `Invoice ${invoiceNumber} - CV Makers\n\nThank you for your purchase!\n\nYour payment has been successfully processed and your account has been credited.\n\nORDER DETAILS\nOrder ID: ${orderMerchantId}\nInvoice Number: ${invoiceNumber}\nDate: ${invoiceDate}\nDescription: ${order.description || "Payment"}\n\nPAYMENT SUMMARY\nTokens credited: ${tokensToAdd.toLocaleString()}\nTotal paid: ${order.currency} ${subtotal.toFixed(2)}\nNew balance: ${newBalance.toLocaleString()} tokens\n\nIf you have any questions, please contact us at info@cv-makers.co.uk`;

        const emailHtml = `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; padding: 20px;"><h2>Invoice ${invoiceNumber}</h2><p>Thank you for your purchase! Your payment has been successfully processed and your account has been credited.</p><table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; margin-top: 15px;"><tr><td>Order ID</td><td>${orderMerchantId}</td></tr><tr><td>Tokens Credited</td><td>${tokensToAdd.toLocaleString()}</td></tr><tr><td>Total Paid</td><td><strong>${order.currency} ${subtotal.toFixed(2)}</strong></td></tr><tr><td>New Balance</td><td>${newBalance.toLocaleString()} tokens</td></tr></table><p>You can now use your tokens to create CVs and resumes.</p></body></html>`;

        const attachments = pdfBuffer ? [
          {
            filename: `Invoice-${invoiceNumber}.pdf`,
            content: pdfBuffer,
          },
        ] : undefined;

        await resend.emails.send({
          from: `CV Makers <${process.env.SMTP_USER}>`,
          to: user.email || "",
          replyTo: 'info@cv-makers.co.uk',
          subject: `Invoice ${invoiceNumber} - CV Makers`,
          text: emailText,
          html: emailHtml,
          ...(attachments && { attachments }),
        });

        invoiceSent = true;
      } catch (emailError) {
        console.error("❌ Failed to send invoice email:", emailError);
      }
    }
  } catch (invoiceError) {
    console.error("❌ Invoice document generation error:", invoiceError);
  }

  return {
    success: true,
    alreadyApproved: false,
    tokensAdded: tokensToAdd,
    newBalance,
    invoiceCreated: invoiceDocumentId !== null,
    invoiceSent,
  };
}
