import { prisma } from "@/lib/prisma";
import { corefyClient } from "@/lib/corefy";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/pdf/InvoicePDF";
import type { Order, User } from "@prisma/client";
import React from "react";

export type SettlementState = "APPROVED" | "DECLINED" | "PROCESSING" | "REFUNDED" | "REVIEW";

export type SettlementResult = {
  state: SettlementState;
  alreadyApproved?: boolean;
  tokensAdded?: number;
  newBalance?: number;
  invoiceCreated?: boolean;
  invoiceSent?: boolean;
};

// Orders in these states may still turn out paid (e.g. a retry after a failed attempt).
const SETTLEABLE_STATUSES = ["PROCESSING", "DECLINED", "EXPIRED"];
const FAILED_INVOICE_STATUSES = ["process_failed", "authorize_failed"];

function sameAmount(a: unknown, b: number) {
  const n = Number(a);
  return Number.isFinite(n) && Math.abs(n - b) < 0.005;
}

/**
 * Settles an order against the invoice as Corefy reports it through its API.
 * Webhook bodies and redirect parameters are never trusted on their own: the
 * order is credited only when Corefy says the invoice is processed and its
 * amount, currency and reference match the order. Crediting is atomic, so a
 * webhook and the status poll racing each other credit the order once.
 */
export async function settleOrder(order: Order): Promise<SettlementResult> {
  if (order.status === "APPROVED") {
    return { state: "APPROVED", alreadyApproved: true, tokensAdded: order.tokens ?? 0 };
  }
  if (order.status === "REFUNDED") return { state: "REFUNDED" };
  if (order.status === "REVIEW") return { state: "REVIEW" };
  if (!order.orderSystemId) return { state: "PROCESSING" };

  const invoice = await corefyClient.getInvoice(order.orderSystemId);
  const attributes = invoice?.data?.attributes || {};
  const invoiceStatus = attributes.status;

  if (invoiceStatus === "processed") {
    const referenceMatches = !attributes.reference_id || attributes.reference_id === order.orderMerchantId;
    const currencyMatches = String(attributes.currency || "").toUpperCase() === order.currency;
    const testAllowed = attributes.test_mode !== true || corefyClient.isTestMode;

    if (!referenceMatches || !currencyMatches || !sameAmount(attributes.amount, order.amount) || !testAllowed) {
      console.error(
        `❌ Corefy invoice ${order.orderSystemId} does not match order ${order.orderMerchantId}; holding for review.`,
        JSON.stringify({ attributes, order: { amount: order.amount, currency: order.currency } })
      );
      await prisma.order.updateMany({
        where: { id: order.id, status: { in: SETTLEABLE_STATUSES } },
        data: {
          status: "REVIEW",
          response: { corefyDetails: invoice, timestamp: new Date().toISOString() },
        },
      });
      return { state: "REVIEW" };
    }

    return approveAndCreditOrder(order, invoice);
  }

  if (FAILED_INVOICE_STATUSES.includes(invoiceStatus) || invoiceStatus === "expired") {
    await prisma.order.updateMany({
      where: { id: order.id, status: "PROCESSING" },
      data: {
        status: invoiceStatus === "expired" ? "EXPIRED" : "DECLINED",
        response: { corefyDetails: invoice, timestamp: new Date().toISOString() },
      },
    });
    return { state: "DECLINED" };
  }

  if (invoiceStatus === "refunded") {
    console.warn(`↩️ Corefy invoice refunded for order ${order.orderMerchantId}; tokens are not reversed automatically.`);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "REFUNDED",
        response: { corefyDetails: invoice, timestamp: new Date().toISOString() },
      },
    });
    return { state: "REFUNDED" };
  }

  return { state: "PROCESSING" };
}

/**
 * Marks a verified order as APPROVED, credits the user's token balance and
 * writes the ledger entry in one transaction, then generates/sends the invoice.
 */
async function approveAndCreditOrder(order: Order, corefyDetails: unknown): Promise<SettlementResult> {
  const orderMerchantId = order.orderMerchantId!;
  const tokensToAdd = order.tokens ?? 0;

  let userId = order.userId;
  if (!userId && order.userEmail) {
    // Orders created before orders were linked to users
    const legacyUser = await prisma.user.findUnique({ where: { email: order.userEmail } });
    userId = legacyUser?.id ?? null;
  }
  if (!userId) {
    throw new Error(`No user found for order ${orderMerchantId}.`);
  }

  const user = await prisma.$transaction(async (tx) => {
    // Only the request that flips the status gets to credit tokens
    const { count } = await tx.order.updateMany({
      where: { id: order.id, status: { in: SETTLEABLE_STATUSES } },
      data: {
        status: "APPROVED",
        userId,
        response: { corefyDetails: corefyDetails as any, timestamp: new Date().toISOString() },
      },
    });
    if (count === 0) return null;

    const credited = await tx.user.update({
      where: { id: userId! },
      data: { tokenBalance: { increment: tokensToAdd } },
    });

    await tx.ledgerEntry.create({
      data: {
        userId: credited.id,
        type: "Top-up",
        delta: tokensToAdd,
        balanceAfter: credited.tokenBalance,
        currency: order.currency,
        amount: Math.round(order.amount * 100),
        receiptUrl: `order:${orderMerchantId}`,
      },
    });

    return credited;
  });

  if (!user) {
    console.log(`ℹ️ Order ${orderMerchantId} was already approved. Skipping credit logic.`);
    return { state: "APPROVED", alreadyApproved: true, tokensAdded: tokensToAdd };
  }

  console.log(`✅ Credited +${tokensToAdd} tokens to ${user.email} for order ${orderMerchantId}.`);

  const invoice = await sendPurchaseInvoice(order, user, tokensToAdd, user.tokenBalance);

  return {
    state: "APPROVED",
    alreadyApproved: false,
    tokensAdded: tokensToAdd,
    newBalance: user.tokenBalance,
    ...invoice,
  };
}

/** Creates the invoice document and emails it with a PDF attached. Failures are logged, not thrown. */
async function sendPurchaseInvoice(order: Order, user: User, tokensToAdd: number, newBalance: number) {
  const orderMerchantId = order.orderMerchantId!;
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
    invoiceCreated: invoiceDocumentId !== null,
    invoiceSent,
  };
}
