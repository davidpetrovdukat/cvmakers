import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

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
    try {
      // Получаем данные компании пользователя
      const company = await prisma.company.findUnique({
        where: { userId: user.id },
      });

      // Формируем данные для инвойса
      const invoiceDate = new Date().toISOString().split('T')[0];
      const invoiceNumber = `INV-${orderMerchantId}`;
      const vatAmount = body.vatAmount || 0;
      const subtotal = body.amount - vatAmount;

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
      console.log(`📄 Invoice document created: ${invoiceDocumentId}`);

      // Генерируем PDF и отправляем по email
      if (process.env.RESEND_API_KEY && process.env.SMTP_USER) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
          const origin = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
          const printUrl = `${origin}/print/${invoiceDoc.id}`;

          console.log(`📧 Generating PDF for invoice: ${printUrl}`);

          const isLocal = process.env.NODE_ENV === 'development';
          const execPath = isLocal ? undefined : await chromium.executablePath();

          const browser = await puppeteer.launch({
            args: isLocal ? [] : chromium.args,
            defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
            executablePath: execPath,
            headless: chromium.headless,
          });

          let pdfBuffer: Buffer;
          try {
            const page = await browser.newPage();
            await page.goto(printUrl, {
              waitUntil: ['domcontentloaded', 'networkidle0'],
              timeout: 30000,
            });

            pdfBuffer = await page.pdf({
              format: 'A4',
              printBackground: true,
              margin: { top: '14mm', right: '14mm', bottom: '16mm', left: '14mm' },
              preferCSSPageSize: true,
            });

            console.log(`📄 PDF generated, size: ${pdfBuffer.length} bytes`);
          } finally {
            try {
              await browser.close();
            } catch {}
          }

          // Отправляем email с PDF
          await resend.emails.send({
            from: `CV Makers <${process.env.SMTP_USER || 'info@cv-makers.co.uk'}>`,
            to: body.email,
            subject: `Invoice ${invoiceNumber} - CV Makers`,
            html: `
              <p>Thank you for your purchase!</p>
              <p>Your invoice is attached. Your account has been credited with <strong>${tokensToAdd.toLocaleString()} tokens</strong>.</p>
              <p>Order ID: <strong>${orderMerchantId}</strong></p>
              <p>If you have any questions, please contact us at info@cv-makers.co.uk</p>
            `,
            attachments: [
              {
                filename: `Invoice-${invoiceNumber}.pdf`,
                content: pdfBuffer,
              },
            ],
          });

          console.log(`✅ Invoice sent to ${body.email}`);
        } catch (emailError) {
          console.error("⚠️ Failed to send invoice email:", emailError);
          // Не прерываем процесс, если отправка email не удалась
        }
      } else {
        console.warn("⚠️ RESEND_API_KEY or SMTP_USER not configured, skipping invoice email");
      }
    } catch (invoiceError) {
      console.error("⚠️ Failed to create invoice document:", invoiceError);
      // Не прерываем процесс, если создание инвойса не удалось
    }

    return NextResponse.json({
      ok: true,
      orderMerchantId,
      state: "APPROVED",
      tokensAdded: tokensToAdd,
      tokenBalance: newBalance,
      invoiceSent: invoiceDocumentId !== null,
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
