import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const resend = new Resend(process.env.RESEND_API_KEY);

const absoluteUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}${path}`;
};

// Универсальная отправка документа PDF по email
export async function POST(req: Request) {
  try {
    console.log(`[DOC_SEND] Starting email send process`);
    console.log(`[DOC_SEND] RESEND_API_KEY exists: ${!!process.env.RESEND_API_KEY}`);
    console.log(`[DOC_SEND] SMTP_USER: ${process.env.SMTP_USER}`);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { email: toEmail, documentId } = await req.json();
    if (!toEmail || !documentId) {
      return NextResponse.json(
        { message: "Recipient email and Document ID are required" },
        { status: 400 },
      );
    }

    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId: session.user.id },
      include: { user: { include: { company: true } } },
    });

    if (!doc) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 },
      );
    }

    console.log(`[DOC_SEND] Generating PDF for document ${doc.id}`);
    
    // Generate PDF directly instead of fetching from API
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const origin = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
    const printUrl = `${origin}/print/${doc.id}`;
    
    console.log(`[INVOICE_SEND] Print URL: ${printUrl}`);
    
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
      console.log(`[DOC_SEND] Navigating to: ${printUrl}`);
      await page.goto(printUrl, { 
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 30000
      });
      console.log(`[DOC_SEND] Page loaded, generating PDF...`);
      
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '14mm', right: '14mm', bottom: '16mm', left: '14mm' },
        preferCSSPageSize: true,
      });
      
      console.log(`[DOC_SEND] PDF generated, size: ${pdfBuffer.length} bytes`);
    } catch (pdfError) {
      console.error(`[DOC_SEND] PDF generation error:`, pdfError);
      throw new Error(`Failed to generate PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
    } finally {
      try { await browser.close(); } catch {}
    }

    await resend.emails.send({
      from: `CV Makers <${process.env.SMTP_USER || "info@cv-makers.co.uk"}>`,
      to: toEmail,
      subject: `${doc.title} from ${doc.user?.company?.name || "CV Makers"}`,
      html: `<p>Please find your document attached.</p>`,
      attachments: [
        {
          filename: `${doc.title || 'Document'}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("[DOC_SEND_ERROR]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
