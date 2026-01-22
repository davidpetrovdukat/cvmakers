import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { ResumePDF } from "@/components/pdf/ResumePDF";
import { Profile } from "@/components/resume/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper to validate and sanitize string
const sanitizeString = (value: any): string => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
};

// Helper to validate URL
const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Helper to coerce data to Profile type with validation
const coerceProfile = (input: any): Profile => {
  // Validate and sanitize experience array
  const experience = Array.isArray(input?.experience)
    ? input.experience
        .map((exp: any) => ({
          id: sanitizeString(exp?.id) || `exp-${Date.now()}-${Math.random()}`,
          title: sanitizeString(exp?.title) || '',
          company: sanitizeString(exp?.company) || '',
          location: sanitizeString(exp?.location) || '',
          start: sanitizeString(exp?.start) || '',
          end: sanitizeString(exp?.end) || '',
          points: Array.isArray(exp?.points)
            ? exp.points.map((p: any) => sanitizeString(p)).filter((p: string) => p.length > 0)
            : [],
        }))
        .filter((exp: any) => exp.title || exp.company) // Only include if has at least title or company
    : [];

  // Validate and sanitize education array
  const education = Array.isArray(input?.education)
    ? input.education
        .map((ed: any) => ({
          id: sanitizeString(ed?.id) || `edu-${Date.now()}-${Math.random()}`,
          degree: sanitizeString(ed?.degree) || '',
          school: sanitizeString(ed?.school) || '',
          year: sanitizeString(ed?.year) || '',
          location: sanitizeString(ed?.location) || '',
        }))
        .filter((ed: any) => ed.degree || ed.school) // Only include if has at least degree or school
    : [];

  // Validate and sanitize skills array
  const skills = Array.isArray(input?.skills)
    ? input.skills
        .map((skill: any) => sanitizeString(skill))
        .filter((skill: string) => skill.length > 0)
    : [];

  // Validate photo URL
  const photo = typeof input?.photo === 'string' && isValidUrl(input.photo) ? input.photo : '';

  return {
    name: sanitizeString(input?.name) || `${sanitizeString(input?.firstName)} ${sanitizeString(input?.lastName)}`.trim() || 'No Name',
    firstName: sanitizeString(input?.firstName) || '',
    lastName: sanitizeString(input?.lastName) || '',
    role: sanitizeString(input?.role || input?.title) || '',
    summary: sanitizeString(input?.summary || input?.about) || '',
    contacts: {
      email: sanitizeString(input?.contacts?.email || input?.email) || '',
      phone: sanitizeString(input?.contacts?.phone || input?.phone) || '',
      location: sanitizeString(input?.contacts?.location || input?.location) || '',
      website: sanitizeString(input?.contacts?.website || input?.website) || undefined,
      linkedin: sanitizeString(input?.contacts?.linkedin || input?.linkedin) || undefined,
    },
    experience,
    education,
    skills,
    photo,
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
    console.log(`[RESUME_PDF] Raw data keys:`, Object.keys(raw));
    
    const profile = coerceProfile(raw.profile ?? raw.data?.profile ?? raw);
    console.log(`[RESUME_PDF] Profile coerced:`, {
      name: profile.name,
      role: profile.role,
      experienceCount: profile.experience.length,
      educationCount: profile.education.length,
      skillsCount: profile.skills.length,
      hasPhoto: !!profile.photo,
    });

    // Generate PDF with @react-pdf/renderer
    console.log(`[RESUME_PDF] Starting PDF generation...`);
    const pdfDoc = <ResumePDF data={profile} />;
    const pdfBuffer = await renderToBuffer(pdfDoc);

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
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: err.message 
    }, { status: 500 });
  }
}
