import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { ResumePDF } from "@/components/pdf/ResumePDF";
import { Profile } from "@/components/resume/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper to coerce data to Profile type
const coerceProfile = (input: any): Profile => {
  return {
    name: input?.name || `${input?.firstName || ''} ${input?.lastName || ''}`.trim() || 'No Name',
    firstName: input?.firstName || '',
    lastName: input?.lastName || '',
    role: input?.role || input?.title || '',
    summary: input?.summary || input?.about || '',
    contacts: {
      email: input?.contacts?.email || input?.email || '',
      phone: input?.contacts?.phone || input?.phone || '',
      location: input?.contacts?.location || input?.location || '',
      website: input?.contacts?.website || input?.website || '',
      linkedin: input?.contacts?.linkedin || input?.linkedin || '',
    },
    experience: Array.isArray(input?.experience) ? input.experience : [],
    education: Array.isArray(input?.education) ? input.education : [],
    skills: Array.isArray(input?.skills) ? input.skills : [],
    photo: typeof input?.photo === 'string' ? input.photo : '',
  };
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    console.log(`[RESUME_PDF] Using @react-pdf/renderer for ${doc.docType}`);

    // Extract and coerce profile data
    const raw = (doc.data as any) ?? {};
    const profile = coerceProfile(raw.profile ?? raw.data?.profile ?? raw);

    // Generate PDF with @react-pdf/renderer
    const pdfDoc = ResumePDF({ data: profile });
    const pdfBuffer = await renderToBuffer(pdfDoc);

    console.log(`[RESUME_PDF] PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    const safeTitle = (doc.title || `${doc.docType}-${id}`).replace(/[^a-z0-9\- ]/gi, '_').slice(0, 60) || 'resume';
    
    return new Response(pdfBuffer, {
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
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: err.message 
    }, { status: 500 });
  }
}
