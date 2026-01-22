import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

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

      // Отправляем по email (ВРЕМЕННО БЕЗ PDF для диагностики)
      if (process.env.RESEND_API_KEY && process.env.SMTP_USER) {
        try {
          console.log(`📧 Sending invoice email to: ${body.email}`);
          
          const resend = new Resend(process.env.RESEND_API_KEY);
          
          // Формируем детальный HTML для email
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1e293b;">Thank you for your purchase!</h2>
              <p>Your payment has been successfully processed and your account has been credited.</p>
              
              <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #475569;">Order Details</h3>
                <p><strong>Order ID:</strong> ${orderMerchantId}</p>
                <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                <p><strong>Date:</strong> ${invoiceDate}</p>
                <p><strong>Description:</strong> ${body.description || `Top-up: ${body.planId || "Payment"}`}</p>
              </div>
              
              <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #059669;">Payment Summary</h3>
                <p><strong>Tokens credited:</strong> ${tokensToAdd.toLocaleString()}</p>
                <p><strong>Subtotal:</strong> ${body.currency} ${subtotal.toFixed(2)}</p>
                <p><strong>VAT:</strong> ${body.currency} ${vatAmount.toFixed(2)}</p>
                <p><strong>Total paid:</strong> ${body.currency} ${(body.amount).toFixed(2)}</p>
                <p><strong>New balance:</strong> ${newBalance.toLocaleString()} tokens</p>
              </div>
              
              <p>You can now use your tokens to create CVs and resumes.</p>
              <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                If you have any questions, please contact us at <a href="mailto:info@cv-makers.co.uk">info@cv-makers.co.uk</a>
              </p>
              
              <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
                CV Makers - Professional CV & Resume Creator
              </p>
            </div>
          `;

          const emailResult = await resend.emails.send({
            from: `CV Makers <${process.env.SMTP_USER}>`,
            to: body.email,
            subject: `Invoice ${invoiceNumber} - CV Makers`,
            html: emailHtml,
          });

          console.log(`✅ Invoice email sent successfully!`);
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
