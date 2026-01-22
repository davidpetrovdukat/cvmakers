import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/pdf/InvoicePDF";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Валидация обязательных полей
    if (!body.email || !body.amount || !body.currency || !body.tokens) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Создаем orderMerchantId
    const orderMerchantId = `order_${Date.now()}`;

    console.log("💳 Processing payment:", orderMerchantId);

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Создаем заказ со статусом APPROVED
    const order = await prisma.order.create({
      data: {
        userEmail: body.email,
        amount: body.amount,
        currency: body.currency,
        description: body.description || `Top-up: ${body.planId || "Payment"}`,
        tokens: body.tokens ?? 0,
        orderMerchantId,
        status: "APPROVED",
        response: {
          processed: true,
          method: "temporary_auto_approve",
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Зачисляем токены пользователю
    const tokensToAdd = body.tokens ?? 0;
    const newBalance = (user.tokenBalance ?? 0) + tokensToAdd;

    await prisma.user.update({
      where: { id: user.id },
      data: { tokenBalance: newBalance },
    });

    // Создаем запись в Ledger
    await prisma.ledgerEntry.create({
      data: {
        userId: user.id,
        type: "Top-up",
        delta: tokensToAdd,
        balanceAfter: newBalance,
        currency: body.currency,
        amount: Math.round(body.amount * 100),
        receiptUrl: `order:${orderMerchantId}`,
      },
    });

    console.log(`✅ Payment approved: ${orderMerchantId}, +${tokensToAdd} tokens to ${user.email}`);

    // Создаем Document (инвойс) для отправки по email
    let invoiceDocumentId: string | null = null;
    let invoiceSent = false;
    
    console.log(`📧 Starting invoice creation and sending process...`);
    console.log(`📧 RESEND_API_KEY exists: ${!!process.env.RESEND_API_KEY}`);
    console.log(`📧 SMTP_USER: ${process.env.SMTP_USER || 'not set'}`);
    
    try {
      // Получаем данные компании пользователя
      const company = await prisma.company.findUnique({
        where: { userId: user.id },
      });
      console.log(`📧 Company data loaded: ${company ? 'exists' : 'not found'}`);

      // Формируем данные для инвойса
      const invoiceDate = new Date().toISOString().split('T')[0];
      const invoiceNumber = `INV-${orderMerchantId}`;
      const vatAmount = body.vatAmount || 0;
      const subtotal = body.amount - vatAmount;

      console.log(`📧 Creating invoice document: ${invoiceNumber}`);

      // Создаем Document
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
              email: body.email,
            },
            content: [
              {
                heading: "Payment Summary",
                text: `Order ID: ${orderMerchantId}\n\nDescription: ${body.description || `Top-up: ${body.planId || "Payment"}`}\n\nTokens: ${tokensToAdd.toLocaleString()}\nSubtotal: ${body.currency} ${subtotal.toFixed(2)}\nVAT: ${body.currency} ${vatAmount.toFixed(2)}\nTotal: ${body.currency} ${(body.amount).toFixed(2)}`,
              },
            ],
            notes: `Thank you for your purchase. Your account has been credited with ${tokensToAdd.toLocaleString()} tokens.`,
          },
        },
      });

      invoiceDocumentId = invoiceDoc.id;
      console.log(`✅ Invoice document created: ${invoiceDocumentId}`);

      // Отправляем по email с PDF вложением
      if (process.env.RESEND_API_KEY && process.env.SMTP_USER) {
        try {
          console.log(`📧 Sending invoice email to: ${body.email}`);
          
          const resend = new Resend(process.env.RESEND_API_KEY);
          
          // Генерируем PDF с помощью @react-pdf/renderer
          let pdfBuffer: Buffer | null = null;
          try {
            console.log(`📄 Generating PDF for invoice: ${invoiceDocumentId}`);
            console.log(`📄 Using @react-pdf/renderer (no Chromium required)`);
            
            // Создаем PDF документ с помощью React PDF
            const pdfDoc = InvoicePDF({
              invoiceNumber,
              invoiceDate,
              orderMerchantId,
              description: body.description || `Top-up: ${body.planId || "Payment"}`,
              sender: {
                company: company?.name || 'CV Makers',
                vat: company?.vat || '',
                address: company?.address1 || '',
                city: company?.city || '',
                country: company?.country || '',
                iban: company?.iban || '',
                bankName: company?.bankName || undefined,
                bic: company?.bic || undefined,
              },
              recipient: {
                name: user.name || user.email?.split('@')[0] || "Customer",
                email: body.email,
              },
              payment: {
                tokens: tokensToAdd,
                subtotal,
                vat: vatAmount,
                total: body.amount,
                currency: body.currency,
                newBalance,
              },
              notes: `Thank you for your purchase. Your account has been credited with ${tokensToAdd.toLocaleString()} tokens.`,
            });
            
            // Рендерим PDF в Buffer
            pdfBuffer = await renderToBuffer(pdfDoc);
            
            console.log(`✅ PDF generated successfully with @react-pdf/renderer, size: ${pdfBuffer.length} bytes`);
          } catch (pdfError: any) {
            console.error("❌ Failed to generate PDF with @react-pdf/renderer:", pdfError);
            console.error("❌ PDF error details:", {
              message: pdfError.message,
              name: pdfError.name,
              stack: process.env.NODE_ENV === 'development' ? pdfError.stack : undefined,
            });
            // Продолжаем отправку email без PDF, если генерация не удалась
          }
          
          // Текстовая версия для лучшей доставляемости
          const emailText = `Invoice ${invoiceNumber} - CV Makers

Thank you for your purchase!

Your payment has been successfully processed and your account has been credited.

ORDER DETAILS
Order ID: ${orderMerchantId}
Invoice Number: ${invoiceNumber}
Date: ${invoiceDate}
Description: ${body.description || `Top-up: ${body.planId || "Payment"}`}

PAYMENT SUMMARY
Tokens credited: ${tokensToAdd.toLocaleString()}
Subtotal: ${body.currency} ${subtotal.toFixed(2)}
VAT: ${body.currency} ${vatAmount.toFixed(2)}
Total paid: ${body.currency} ${(body.amount).toFixed(2)}
New balance: ${newBalance.toLocaleString()} tokens

You can now use your tokens to create CVs and resumes.

If you have any questions, please contact us at info@cv-makers.co.uk

---
CV Makers - Professional CV & Resume Creator
https://cv-makers.co.uk`;

          // Улучшенный HTML с более простой структурой для лучшей доставляемости
          const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 30px 20px; background-color: #1e293b; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Invoice ${invoiceNumber}</h1>
              <p style="margin: 5px 0 0; font-size: 14px; color: #cbd5e1;">CV Makers</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #1e293b;">
                Thank you for your purchase! Your payment has been successfully processed and your account has been credited.
              </p>
              
              <!-- Order Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; background-color: #f8fafc; border-radius: 6px; padding: 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px; font-size: 18px; color: #475569; font-weight: bold;">Order Details</h2>
                    <table width="100%" cellpadding="5" cellspacing="0">
                      <tr>
                        <td style="color: #64748b; font-size: 14px; width: 40%;">Order ID:</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: bold;">${orderMerchantId}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Invoice Number:</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: bold;">${invoiceNumber}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Date:</td>
                        <td style="color: #1e293b; font-size: 14px;">${invoiceDate}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Description:</td>
                        <td style="color: #1e293b; font-size: 14px;">${body.description || `Top-up: ${body.planId || "Payment"}`}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Payment Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; background-color: #ecfdf5; border-radius: 6px; padding: 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px; font-size: 18px; color: #059669; font-weight: bold;">Payment Summary</h2>
                    <table width="100%" cellpadding="5" cellspacing="0">
                      <tr>
                        <td style="color: #64748b; font-size: 14px; width: 40%;">Tokens credited:</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: bold;">${tokensToAdd.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Subtotal:</td>
                        <td style="color: #1e293b; font-size: 14px;">${body.currency} ${subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">VAT:</td>
                        <td style="color: #1e293b; font-size: 14px;">${body.currency} ${vatAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; font-weight: bold;">Total paid:</td>
                        <td style="color: #1e293b; font-size: 16px; font-weight: bold;">${body.currency} ${(body.amount).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">New balance:</td>
                        <td style="color: #059669; font-size: 14px; font-weight: bold;">${newBalance.toLocaleString()} tokens</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #1e293b;">
                You can now use your tokens to create CVs and resumes.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #64748b; line-height: 1.6;">
                If you have any questions, please contact us at 
                <a href="mailto:info@cv-makers.co.uk" style="color: #3b82f6; text-decoration: none;">info@cv-makers.co.uk</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                CV Makers - Professional CV & Resume Creator<br>
                <a href="https://cv-makers.co.uk" style="color: #3b82f6; text-decoration: none;">https://cv-makers.co.uk</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

          // Формируем attachments (PDF если был сгенерирован)
          const attachments = pdfBuffer ? [
            {
              filename: `Invoice-${invoiceNumber}.pdf`,
              content: pdfBuffer,
            },
          ] : undefined;

          const emailResult = await resend.emails.send({
            from: `CV Makers <${process.env.SMTP_USER}>`,
            to: body.email,
            replyTo: 'info@cv-makers.co.uk',
            subject: `Invoice ${invoiceNumber} - CV Makers`,
            text: emailText,
            html: emailHtml,
            ...(attachments && { attachments }),
          });

          console.log(`✅ Invoice email sent successfully!`);
          console.log(`📧 PDF attached: ${pdfBuffer ? 'Yes' : 'No'}`);
          if (pdfBuffer) {
            console.log(`📧 PDF size: ${pdfBuffer.length} bytes`);
          }
          console.log(`📧 Resend result:`, JSON.stringify(emailResult, null, 2));
          invoiceSent = true;
        } catch (emailError: any) {
          console.error("❌ Failed to send invoice email:", emailError);
          console.error("❌ Email error details:", {
            message: emailError.message,
            statusCode: emailError.statusCode,
            name: emailError.name,
          });
          // Не прерываем процесс, если отправка email не удалась
        }
      } else {
        console.warn("⚠️ RESEND_API_KEY or SMTP_USER not configured!");
        console.warn(`⚠️ RESEND_API_KEY exists: ${!!process.env.RESEND_API_KEY}`);
        console.warn(`⚠️ SMTP_USER value: ${process.env.SMTP_USER || 'NOT SET'}`);
      }
    } catch (invoiceError: any) {
      console.error("❌ Failed to create invoice document:", invoiceError);
      console.error("❌ Invoice error details:", {
        message: invoiceError.message,
        code: invoiceError.code,
        stack: process.env.NODE_ENV === 'development' ? invoiceError.stack : undefined,
      });
      // Не прерываем процесс, если создание инвойса не удалось
    }

    console.log(`📊 Payment processing completed successfully`);
    console.log(`📊 Invoice document ID: ${invoiceDocumentId || 'not created'}`);
    console.log(`📊 Invoice sent: ${invoiceSent}`);

    return NextResponse.json({
      ok: true,
      orderMerchantId,
      state: "APPROVED",
      tokensAdded: tokensToAdd,
      tokenBalance: newBalance,
      invoiceCreated: invoiceDocumentId !== null,
      invoiceSent: invoiceSent,
    });
  } catch (err: any) {
    console.error("❌ Payment processing error:", err);
    console.error("❌ Error details:", {
      message: err.message,
      code: err.code,
      meta: err.meta,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    
    // Более детальные сообщения об ошибках для диагностики
    let errorMessage = "Payment processing failed";
    if (err.code === 'P2003') {
      errorMessage = "Database constraint violation. Please contact support.";
    } else if (err.code === 'P2002') {
      errorMessage = "Duplicate entry detected. Please try again.";
    } else if (err.message?.includes('does not exist')) {
      errorMessage = "Database table not found. Migration may not be applied.";
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    return NextResponse.json(
      { 
        ok: false, 
        error: errorMessage,
        code: err.code || undefined,
      },
      { status: 500 }
    );
  }
}
