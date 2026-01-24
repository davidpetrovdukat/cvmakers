import React from "react";
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
  if (typeof value === 'boolean') return value ? 'true' : 'false';
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

const isReactElement = (value: unknown): boolean => React.isValidElement(value);

const collectReactElementPaths = (
  value: unknown,
  path: string,
  results: string[],
  depth = 0,
  maxDepth = 6,
) => {
  if (depth > maxDepth) return;
  if (isReactElement(value)) {
    results.push(path);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectReactElementPaths(item, `${path}[${index}]`, results, depth + 1, maxDepth));
    return;
  }
  if (value && typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
      collectReactElementPaths(child, `${path}.${key}`, results, depth + 1, maxDepth);
    });
  }
};

const normalizeProfileForPdf = (profile: Profile): Profile => {
  const contacts = profile?.contacts ?? ({} as Profile['contacts']);
  const experience = Array.isArray(profile?.experience)
    ? profile.experience
        .map((exp) => ({
          id: sanitizeString(exp?.id) || `exp-${Date.now()}-${Math.random()}`,
          title: sanitizeString(exp?.title),
          company: sanitizeString(exp?.company),
          location: sanitizeString(exp?.location),
          start: sanitizeString(exp?.start),
          end: sanitizeString(exp?.end),
          points: Array.isArray(exp?.points)
            ? exp.points.map((point) => sanitizeString(point)).filter((point) => point.length > 0)
            : [],
        }))
        .filter((exp) => exp.title || exp.company)
    : [];
  const education = Array.isArray(profile?.education)
    ? profile.education
        .map((ed) => ({
          id: sanitizeString(ed?.id) || `edu-${Date.now()}-${Math.random()}`,
          degree: sanitizeString(ed?.degree),
          school: sanitizeString(ed?.school),
          year: sanitizeString(ed?.year),
          location: sanitizeString(ed?.location),
        }))
        .filter((ed) => ed.degree || ed.school)
    : [];
  const skills = Array.isArray(profile?.skills)
    ? profile.skills.map((skill) => sanitizeString(skill)).filter((skill) => skill.length > 0)
    : [];

  return {
    name: sanitizeString(profile?.name) || 'No Name',
    firstName: sanitizeString(profile?.firstName),
    lastName: sanitizeString(profile?.lastName),
    role: sanitizeString(profile?.role),
    summary: sanitizeString(profile?.summary),
    contacts: {
      email: sanitizeString(contacts?.email),
      phone: sanitizeString(contacts?.phone),
      location: sanitizeString(contacts?.location),
      website: sanitizeString(contacts?.website) || undefined,
      linkedin: sanitizeString(contacts?.linkedin) || undefined,
    },
    experience,
    education,
    skills,
    photo: typeof profile?.photo === 'string' && isValidUrl(profile.photo) ? profile.photo : '',
  };
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

  const name = sanitizeString(input?.name) || `${sanitizeString(input?.firstName)} ${sanitizeString(input?.lastName)}`.trim() || 'No Name';
  const firstName = sanitizeString(input?.firstName) || '';
  const lastName = sanitizeString(input?.lastName) || '';
  const role = sanitizeString(input?.role || input?.title) || '';
  const summary = sanitizeString(input?.summary || input?.about) || '';
  const contacts = {
    email: sanitizeString(input?.contacts?.email || input?.email) || '',
    phone: sanitizeString(input?.contacts?.phone || input?.phone) || '',
    location: sanitizeString(input?.contacts?.location || input?.location) || '',
    website: sanitizeString(input?.contacts?.website || input?.website) || undefined,
    linkedin: sanitizeString(input?.contacts?.linkedin || input?.linkedin) || undefined,
  };

  return {
    name,
    firstName,
    lastName,
    role,
    summary,
    contacts,
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

    const reactElementPaths: string[] = [];
    collectReactElementPaths(raw, 'data', reactElementPaths);
    if (reactElementPaths.length) {
      console.warn(`[RESUME_PDF] React elements found in payload:`, reactElementPaths.slice(0, 20));
    }
    
    const profile = coerceProfile(raw.profile ?? raw.data?.profile ?? raw);
    const safeProfile = normalizeProfileForPdf(profile);
    console.log(`[RESUME_PDF] Profile coerced:`, {
      name: safeProfile.name,
      role: safeProfile.role,
      experienceCount: safeProfile.experience.length,
      educationCount: safeProfile.education.length,
      skillsCount: safeProfile.skills.length,
      hasPhoto: !!safeProfile.photo,
    });

    // Generate PDF with @react-pdf/renderer
    console.log(`[RESUME_PDF] Starting PDF generation...`);
    
    // Validate profile data before rendering
    console.log(`[RESUME_PDF] Profile data validation:`, {
      nameType: typeof safeProfile.name,
      roleType: typeof safeProfile.role,
      summaryType: typeof safeProfile.summary,
      contactsEmailType: typeof safeProfile.contacts?.email,
      experienceValid: safeProfile.experience.every((e) => typeof e.title === 'string' && typeof e.company === 'string'),
      educationValid: safeProfile.education.every((e) => typeof e.degree === 'string' && typeof e.school === 'string'),
      skillsValid: safeProfile.skills.every((s) => typeof s === 'string'),
    });
    
    const pdfDoc = <ResumePDF data={safeProfile} />;
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
  }
}
