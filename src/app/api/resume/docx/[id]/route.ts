import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Document as DocxDocument, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { Profile } from "@/components/resume";
import { getTranslator } from "@/i18n/server";
import { normalizeLocale } from "@/i18n/config";

type HeadingType = (typeof HeadingLevel)[keyof typeof HeadingLevel];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const coerceProfile = (input: any): Profile => {
  const experience = Array.isArray(input?.experience)
    ? input.experience.map((exp: any) => ({
        id: typeof exp?.id === 'string' ? exp.id : Math.random().toString(36).slice(2),
        title: typeof exp?.title === 'string' ? exp.title : '',
        company: typeof exp?.company === 'string' ? exp.company : '',
        location: typeof exp?.location === 'string' ? exp.location : '',
        start: typeof exp?.start === 'string' ? exp.start : '',
        end: typeof exp?.end === 'string' ? exp.end : '',
        points: Array.isArray(exp?.points) ? exp.points.filter((p: any) => typeof p === 'string') : [],
      }))
    : [];

  const education = Array.isArray(input?.education)
    ? input.education.map((ed: any) => ({
        id: typeof ed?.id === 'string' ? ed.id : Math.random().toString(36).slice(2),
        degree: typeof ed?.degree === 'string' ? ed.degree : '',
        school: typeof ed?.school === 'string' ? ed.school : '',
        year: typeof ed?.year === 'string' ? ed.year : '',
        location: typeof ed?.location === 'string' ? ed.location : '',
      }))
    : [];

  const skills = Array.isArray(input?.skills) ? input.skills.filter((s: any) => typeof s === 'string') : [];

  const providedFirst = typeof input?.firstName === 'string' ? input.firstName : '';
  const providedLast = typeof input?.lastName === 'string' ? input.lastName : '';
  const derivedFromName = typeof input?.name === 'string' ? input.name.split(' ') : [];
  const fallbackFirst = providedFirst || derivedFromName[0] || '';
  const fallbackLast = providedLast || (derivedFromName.length > 1 ? derivedFromName.slice(1).join(' ') : '');

  return {
    name: typeof input?.name === 'string' ? input.name : [fallbackFirst, fallbackLast].filter(Boolean).join(' ').trim(),
    firstName: fallbackFirst,
    lastName: fallbackLast,
    role: typeof input?.role === 'string' ? input.role : '',
    summary: typeof input?.summary === 'string' ? input.summary : '',
    contacts: {
      email: typeof input?.contacts?.email === 'string' ? input.contacts.email : '',
      phone: typeof input?.contacts?.phone === 'string' ? input.contacts.phone : '',
      location: typeof input?.contacts?.location === 'string' ? input.contacts.location : '',
      website: typeof input?.contacts?.website === 'string' ? input.contacts.website : '',
      linkedin: typeof input?.contacts?.linkedin === 'string' ? input.contacts.linkedin : '',
    },
    experience,
    education,
    skills,
    photo: typeof input?.photo === 'string' ? input.photo : '',
  };
};

const paragraph = (text: string, opts?: { bold?: boolean; heading?: HeadingType }) =>
  new Paragraph({
    heading: opts?.heading,
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
      }),
    ],
  });

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { id } = await params;

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || doc.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!['cv', 'resume'].includes(doc.docType)) return NextResponse.json({ error: 'Unsupported document type' }, { status: 400 });

  const payload = (doc.data as any) ?? {};
  const locale = normalizeLocale(payload?.meta?.locale);
  const t = getTranslator(locale);
  const profile = coerceProfile(payload.profile ?? payload.data?.profile ?? payload);

  const docx = new DocxDocument({
    sections: [
      {
        children: [
          paragraph(profile.name || 'Untitled', { heading: HeadingLevel.TITLE, bold: true }),
          paragraph(profile.role || ''),
          paragraph([profile.contacts.email, profile.contacts.phone, profile.contacts.location].filter(Boolean).join(' - ')),
          paragraph(t('builder.summary'), { heading: HeadingLevel.HEADING_2 }),
          paragraph(profile.summary || ''),
          ...(profile.experience.length
            ? [paragraph(t('builder.experience'), { heading: HeadingLevel.HEADING_2 }),
               ...profile.experience.flatMap((item) => [
                 paragraph(`${item.title}${item.company ? ` - ${item.company}` : ''}`, { bold: true }),
                 paragraph([item.start, item.end].filter(Boolean).join(' - ') + (item.location ? ` - ${item.location}` : '')),
                 ...item.points.map((point) => new Paragraph({ text: point, bullet: { level: 0 } })),
               ])]
            : []),
          ...(profile.education.length
            ? [paragraph(t('builder.education'), { heading: HeadingLevel.HEADING_2 }),
               ...profile.education.flatMap((item) => [
                 paragraph(`${item.degree}${item.school ? ` - ${item.school}` : ''}`, { bold: true }),
                 paragraph([item.year, item.location].filter(Boolean).join(' - ')),
               ])]
            : []),
          ...(profile.skills.length
            ? [paragraph(t('builder.skills'), { heading: HeadingLevel.HEADING_2 }),
               paragraph(profile.skills.join(', '))]
            : []),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(docx);
  const body = new Uint8Array(buffer);
  const safeTitle = (doc.title || `${doc.docType}-${id}`).replace(/[^a-z0-9\- ]/gi, '_').slice(0, 60) || 'resume';

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${safeTitle}.docx"`,
      'Cache-Control': 'no-store',
    },
  });
}

