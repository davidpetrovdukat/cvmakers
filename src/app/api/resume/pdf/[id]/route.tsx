import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer-core";
import type { Browser, Page } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resolveBaseUrl = (req: Request) => {
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = forwardedHost || req.headers.get('host');
  const proto = forwardedProto || 'https';
  if (!host) return null;
  return `${proto}://${host}`;
};

const launchBrowser = async () => {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || await chromium.executablePath();
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let browser: Browser | null = null;
  let page: Page | null = null;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id as string;
    const { id } = await params;

    console.log(`[RESUME_PDF] Generating PDF for document ${id}`);

    const doc = await prisma.document.findUnique({ 
      where: { id }, 
      select: { userId: true, docType: true, title: true, data: true } 
    });
    
    if (!doc || doc.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    if (!['cv', 'resume'].includes(doc.docType)) {
      return NextResponse.json({ error: 'Unsupported document type' }, { status: 400 });
    }

    const baseUrl = resolveBaseUrl(req);
    if (!baseUrl) {
      return NextResponse.json({ error: 'Unable to resolve base URL' }, { status: 500 });
    }

    const url = `${baseUrl}/print-resume/${id}`;
    console.log(`[RESUME_PDF] Rendering HTML at ${url}`);

    browser = await launchBrowser();
    page = await browser.newPage();
    await page.emulateMediaType('screen');
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });

    console.log(`[RESUME_PDF] PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    const safeTitle = (doc.title || `${doc.docType}-${id}`).replace(/[^a-z0-9\- ]/gi, '_').slice(0, 60) || 'resume';
    
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('[RESUME_PDF_ERROR]', err);
    console.error('[RESUME_PDF_ERROR] Details:', {
      message: err.message,
      name: err.name,
      code: err.code,
      stack: err.stack,
    });
    
    // Check for React-specific errors
    const isReactError = err.message?.includes('React error') || err.message?.includes('not valid as a React child');
    
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: err.message,
      hint: isReactError ? 'Data validation issue - check that all profile fields are strings' : undefined,
    }, { status: 500 });
  } finally {
    if (page) {
      try {
        await page.close();
      } catch {}
    }
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }
}
