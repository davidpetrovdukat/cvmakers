import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { DocumentPDF } from "@/components/pdf/DocumentPDF";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log(`[PDF_API] Generating PDF for document ${id}`);
    
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    console.log(`[PDF_API] Using @react-pdf/renderer (no Chromium required)`);

    // Fetch document with user and company data
    const doc = await prisma.document.findUnique({ 
      where: { id }, 
      include: { user: { include: { company: true } } } 
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const data = (doc.data || {}) as any;

    // Generate PDF with @react-pdf/renderer
    const pdfDoc = (
      <DocumentPDF
        title={doc.title}
        documentNo={data.documentNo}
        documentDate={data.documentDate}
        sender={{
          company: doc.user.company?.name || '',
          vat: doc.user.company?.vat || '',
          address: doc.user.company?.address1 || '',
          city: doc.user.company?.city || '',
          country: doc.user.company?.country || '',
          iban: doc.user.company?.iban || '',
          bankName: (doc.user.company as any)?.bankName || undefined,
          bic: doc.user.company?.bic || undefined,
          logoUrl: (doc.user.company as any)?.logoUrl || undefined,
        }}
        recipient={{
          company: data.recipient?.company,
          name: data.recipient?.name,
          email: data.recipient?.email,
          address: data.recipient?.address,
          city: data.recipient?.city,
          country: data.recipient?.country,
        }}
        content={Array.isArray(data.content) ? data.content : undefined}
        notes={data.notes}
        footerText={data.footerText}
      />
    );

    const pdfBuffer = await renderToBuffer(pdfDoc);
    
    console.log(`[PDF_API] PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    const fileName = `document-${id || 'document'}.pdf`;
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    console.error(`[PDF_API] Error:`, e);
    console.error(`[PDF_API] Error details:`, {
      message: e.message,
      stack: process.env.NODE_ENV === 'development' ? e.stack : undefined,
    });
    return NextResponse.json({ 
      error: e?.message || 'Failed to render PDF',
      details: process.env.NODE_ENV === 'development' ? e.stack : 'Internal error'
    }, { status: 500 });
  }
}

