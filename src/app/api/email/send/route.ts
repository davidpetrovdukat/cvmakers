import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

let resendClient: Resend | null | undefined;

function getResendClient(): Resend | null {
  if (resendClient !== undefined) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    resendClient = null;
    return resendClient;
  }
  resendClient = new Resend(apiKey);
  return resendClient;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { email: toEmail, documentId } = await req.json();
    if (!toEmail || !documentId) return NextResponse.json({ message: "Recipient email and Document ID are required" }, { status: 400 });

    const doc = await prisma.document.findFirst({ where: { id: documentId, userId: session.user.id }, include: { user: { include: { company: true } } } });
    if (!doc) return NextResponse.json({ message: "Document not found" }, { status: 404 });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const origin = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
    const printUrl = `${origin}/print/${doc.id}`;

    const isLocal = process.env.NODE_ENV === 'development';
    const execPath = isLocal ? undefined : await chromium.executablePath();
    const browser = await puppeteer.launch({ args: isLocal ? [] : chromium.args, defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 }, executablePath: execPath, headless: chromium.headless });

    let pdfBuffer: Buffer;
    try {
      const page = await browser.newPage();
      await page.goto(printUrl, { waitUntil: ['domcontentloaded', 'networkidle0'], timeout: 30000 });
      pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '14mm', right: '14mm', bottom: '16mm', left: '14mm' }, preferCSSPageSize: true });
    } finally {
      try { await browser.close(); } catch {}
    }

    const resend = getResendClient();
    if (!resend) {
      console.error('Resend API key is missing.');
      return NextResponse.json(
        { message: 'Email service is not configured.' },
        { status: 503 },
      );
    }

    await resend.emails.send({
      from: `CV Makers <${process.env.EMAIL_FROM || 'info@cv-makers.co.uk'}>`,
      to: toEmail,
      subject: `${doc.title} from ${doc.user?.company?.name || 'CV Makers'}`,
      html: `<p>Please find your document attached.</p>`,
      attachments: [{ filename: `${doc.title || 'Document'}.pdf`, content: pdfBuffer }],
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('[EMAIL_SEND_ERROR]', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}





