import { prisma } from '@/lib/prisma';
import { ResumeTemplates, ResumeTemplateKey, Profile } from '@/components/resume';
import { Locale, normalizeLocale } from '@/i18n/config';
import { getTranslator } from '@/i18n/server';

export const dynamic = 'force-dynamic';

const FALLBACK_TEMPLATE: ResumeTemplateKey = 'classic';

const PROFILE_LABEL: Record<Locale, string> = {
  en: 'Profile',
  tr: 'Profil',
  ja: 'プロフィール',
};

const isTemplateKey = (value: unknown): value is ResumeTemplateKey =>
  typeof value === 'string' && value in ResumeTemplates;

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

  const contacts = {
    email: typeof input?.contacts?.email === 'string' ? input.contacts.email : '',
    phone: typeof input?.contacts?.phone === 'string' ? input.contacts.phone : '',
    location: typeof input?.contacts?.location === 'string' ? input.contacts.location : '',
    website: typeof input?.contacts?.website === 'string' ? input.contacts.website : '',
    linkedin: typeof input?.contacts?.linkedin === 'string' ? input.contacts.linkedin : '',
  } as Profile['contacts'];

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
    contacts,
    experience,
    education,
    skills,
    photo: typeof input?.photo === 'string' ? input.photo : '',
  };
};

export default async function PrintResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || !['cv', 'resume'].includes(doc.docType)) {
    return <div className="p-6 text-sm text-slate-500">Resume not found.</div>;
  }

  const raw = (doc.data as any) ?? {};
  const locale = normalizeLocale(raw?.meta?.locale);
  const t = getTranslator(locale);
  const templateKeyCandidate = raw.template ?? raw.templateKey ?? raw.resumeTemplate;
  const templateKey = isTemplateKey(templateKeyCandidate) ? templateKeyCandidate : FALLBACK_TEMPLATE;
  const Template = ResumeTemplates[templateKey] ?? ResumeTemplates[FALLBACK_TEMPLATE];
  const profile = coerceProfile(raw.profile ?? raw.data?.profile ?? raw);
  const labels = {
    summary: t('builder.summary'),
    profile: PROFILE_LABEL[locale],
    experience: t('builder.experience'),
    skills: t('builder.skills'),
    education: t('builder.education'),
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto max-w-[210mm] p-12">
        <Template data={profile} labels={labels as any} />
      </main>
    </div>
  );
}




