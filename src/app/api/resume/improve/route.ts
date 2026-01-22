import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOpenAIClient, getDefaultOpenAIModel } from '@/lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Action = 'ai' | 'manager';
type DocType = 'resume' | 'cv';

interface ProfileContact {
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
}

interface ProfileExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  points: string[];
}

interface ProfileEducation {
  id: string;
  degree: string;
  school: string;
  year: string;
  location: string;
}

interface Profile {
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  summary: string;
  contacts: ProfileContact;
  experience: ProfileExperience[];
  education: ProfileEducation[];
  skills: string[];
  photo: string;
}

import { SERVICE_COSTS } from '@/lib/currency';

const DEFAULT_AI_COST = SERVICE_COSTS.AI_IMPROVE;
const DEFAULT_MANAGER_COST = SERVICE_COSTS.PERSONAL_MANAGER;

function parseTokenCost(envKey: string, fallback: number): number {
  const raw = process.env[envKey];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.round(parsed);
}

const TOKEN_COST_AI = parseTokenCost('TOKENS_AI_IMPROVE', DEFAULT_AI_COST);
const TOKEN_COST_MANAGER = parseTokenCost('TOKENS_MANAGER_REQUEST', DEFAULT_MANAGER_COST);

function randomId(): string {
  return Math.random().toString(36).slice(2);
}

function composeFullName(first?: string | null, last?: string | null): string {
  const parts: string[] = [];
  if (first && first.trim()) parts.push(first.trim());
  if (last && last.trim()) parts.push(last.trim());
  return parts.join(' ').trim();
}

function sanitizeText(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function coerceProfileData(input: any): Profile {
  const firstName = sanitizeText(input?.firstName);
  const lastName = sanitizeText(input?.lastName);
  const nameFromInput = sanitizeText(input?.name);
  const computedName = nameFromInput || composeFullName(firstName, lastName);

  const experience = Array.isArray(input?.experience)
    ? input.experience.map((item: any) => ({
        id: sanitizeText(item?.id) || randomId(),
        title: sanitizeText(item?.title),
        company: sanitizeText(item?.company),
        location: sanitizeText(item?.location),
        start: sanitizeText(item?.start),
        end: sanitizeText(item?.end),
        points: Array.isArray(item?.points)
          ? item.points
              .map((point: any) => sanitizeText(point))
              .filter((point: string) => point.length > 0)
          : [],
      }))
    : [];

  const education = Array.isArray(input?.education)
    ? input.education.map((item: any) => ({
        id: sanitizeText(item?.id) || randomId(),
        degree: sanitizeText(item?.degree),
        school: sanitizeText(item?.school),
        year: sanitizeText(item?.year),
        location: sanitizeText(item?.location),
      }))
    : [];

  const skills = Array.isArray(input?.skills)
    ? input.skills
        .map((skill: any) => sanitizeText(skill))
        .filter((skill: string) => skill.length > 0)
    : [];

  const contacts = input?.contacts ?? {};
  return {
    name: computedName,
    firstName,
    lastName,
    role: sanitizeText(input?.role),
    summary: sanitizeText(input?.summary),
    contacts: {
      email: sanitizeText(contacts?.email ?? input?.email),
      phone: sanitizeText(contacts?.phone ?? input?.phone),
      location: sanitizeText(contacts?.location ?? input?.location),
      website: sanitizeText(contacts?.website ?? input?.website),
      linkedin: sanitizeText(contacts?.linkedin ?? input?.linkedin),
    },
    experience,
    education,
    skills,
    photo: sanitizeText(input?.photo),
  };
}

function mergeProfiles(base: Profile, patchInput: any): Profile {
  const patch = coerceProfileData(patchInput);
  const merged: Profile = { ...base };

  const firstName = patch.firstName || base.firstName;
  const lastName = patch.lastName || base.lastName;
  merged.firstName = firstName;
  merged.lastName = lastName;
  const patchedName = composeFullName(firstName, lastName) || patch.name || base.name;
  merged.name = patchedName || base.name;

  merged.role = patch.role || base.role;
  merged.summary = patch.summary || base.summary;

  merged.contacts = {
    email: patch.contacts.email || base.contacts.email,
    phone: patch.contacts.phone || base.contacts.phone,
    location: patch.contacts.location || base.contacts.location,
    website: patch.contacts.website || base.contacts.website,
    linkedin: patch.contacts.linkedin || base.contacts.linkedin,
  };

  merged.experience = patch.experience.length ? patch.experience : base.experience;
  merged.education = patch.education.length ? patch.education : base.education;
  merged.skills = patch.skills.length ? patch.skills : base.skills;
  merged.photo = patch.photo || base.photo;
  return merged;
}

const MAX_SUMMARY_LENGTH = 1200;
const MAX_EXPERIENCES = 6;
const MAX_POINTS_PER_EXPERIENCE = 6;
const MAX_POINT_LENGTH = 280;
const MAX_EDUCATION_ENTRIES = 5;
const MAX_SKILLS = 30;

function prepareProfileForModel(profile: Profile): Profile {
  const clone = JSON.parse(JSON.stringify(profile)) as Profile;

  if (clone.photo && clone.photo.startsWith('data:')) {
    clone.photo = '';
  }

  if (clone.summary) {
    clone.summary = clone.summary.slice(0, MAX_SUMMARY_LENGTH);
  }

  clone.contacts = {
    email: clone.contacts.email.slice(0, 320),
    phone: clone.contacts.phone.slice(0, 80),
    location: clone.contacts.location.slice(0, 160),
    website: clone.contacts.website.slice(0, 320),
    linkedin: clone.contacts.linkedin.slice(0, 320),
  };

  clone.experience = clone.experience.slice(0, MAX_EXPERIENCES).map((item) => ({
    ...item,
    title: item.title.slice(0, 160),
    company: item.company.slice(0, 160),
    location: item.location.slice(0, 160),
    start: item.start.slice(0, 40),
    end: item.end.slice(0, 40),
    points: item.points.slice(0, MAX_POINTS_PER_EXPERIENCE).map((point) => point.slice(0, MAX_POINT_LENGTH)),
  }));

  clone.education = clone.education.slice(0, MAX_EDUCATION_ENTRIES).map((item) => ({
    ...item,
    degree: item.degree.slice(0, 160),
    school: item.school.slice(0, 160),
    year: item.year.slice(0, 40),
    location: item.location.slice(0, 160),
  }));

  clone.skills = clone.skills.slice(0, MAX_SKILLS).map((skill) => skill.slice(0, 80)).filter(Boolean);

  return clone;
}


function buildPrompt(profile: Profile, docType: DocType, action: Action): string {
  const label = docType === 'cv' ? 'CV' : 'resume';
  const tone =
    action === 'manager'
      ? 'Act as a seasoned HR personal manager preparing a premium revision.'
      : 'Act as an expert career coach polishing the document for applicant tracking systems and human reviewers.';

  return [
    `${tone}`,
    'Clean grammar, highlight impact, and keep the structure identical.',
    'Preserve existing sections. Improve bullet points with strong verbs and quantifiable results when possible.',
    'Do not fabricate experience or education entries that do not exist.',
    'Keep each experience item\'s id field unchanged. If a field is missing, fall back to the original value.',
    'Return valid JSON that matches this shape:',
    '{',
    '  "name": string,',
    '  "firstName": string,',
    '  "lastName": string,',
    '  "role": string,',
    '  "summary": string,',
    '  "contacts": {',
    '    "email": string,',
    '    "phone": string,',
    '    "location": string,',
    '    "website": string,',
    '    "linkedin": string',
    '  },',
    '  "experience": [',
    '    { "id": string, "title": string, "company": string, "location": string, "start": string, "end": string, "points": string[] }',
    '  ],',
    '  "education": [',
    '    { "id": string, "degree": string, "school": string, "year": string, "location": string }',
    '  ],',
    '  "skills": string[],',
    '  "photo": string',
    '}',
    `Current ${label} data:`,
    JSON.stringify(profile),
  ].join('\n');
}

async function improveProfileWithAI(profile: Profile, docType: DocType, action: Action): Promise<Profile> {
  const client = getOpenAIClient();
  const model = getDefaultOpenAIModel();
  const promptProfile = prepareProfileForModel(profile);
  const prompt = buildPrompt(promptProfile, docType, action);

  const response = await client.chat.completions.create({
    model,
    temperature: action === 'manager' ? 0.65 : 0.5,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful writing assistant focused on professional CV and resume copy. Respond only with valid JSON. Do not wrap the JSON in markdown fences.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    return profile;
  }
  try {
    const parsed = JSON.parse(content);
    return mergeProfiles(profile, parsed);
  } catch {
    return profile;
  }
}

function pickCharge(action: Action): number {
  return action === 'manager' ? TOKEN_COST_MANAGER : TOKEN_COST_AI;
}

function computeReleaseAt(now: Date): { releaseAt: Date; hours: number } {
  const hours = 3 + Math.random() * 3;
  const releaseAt = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return { releaseAt, hours };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const action: Action = body?.action === 'manager' ? 'manager' : 'ai';
  const docType: DocType = body?.docType === 'cv' ? 'cv' : 'resume';
  const template = typeof body?.template === 'string' && body.template ? body.template : 'classic';
  const baseProfile = coerceProfileData(body?.profile ?? {});

  const charge = pickCharge(action);

  const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { tokenBalance: true } });
  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (currentUser.tokenBalance < charge) {
    return NextResponse.json({ error: 'Not enough tokens' }, { status: 400 });
  }

  let improvedProfile: Profile = baseProfile;
  try {
    improvedProfile = await improveProfileWithAI(baseProfile, docType, action);
  } catch (error) {
    console.error('[RESUME_IMPROVE_OPENAI_ERROR]', error);
    return NextResponse.json({ error: 'Unable to contact OpenAI' }, { status: 502 });
  }

  const requestedAt = new Date();
  const releaseData = action === 'manager' ? computeReleaseAt(requestedAt) : null;
  const releaseAtIso = releaseData ? releaseData.releaseAt.toISOString() : null;

  const documentPayload = JSON.parse(JSON.stringify({
    docType,
    template,
    profile: improvedProfile,
    meta: {
      generatedAt: requestedAt.toISOString(),
      action,
      source: 'ai-improve',
      releaseAt: releaseAtIso,
      releaseWindowHours: releaseData?.hours ?? null,
      requestedAt: requestedAt.toISOString(),
    },
  }));

  try {
    const result = await prisma.$transaction(async (tx) => {
      const userRow = await tx.user.findUnique({ where: { id: userId }, select: { tokenBalance: true } });
      if (!userRow) throw new Error('USER_NOT_FOUND');
      if (userRow.tokenBalance < charge) throw new Error('INSUFFICIENT_TOKENS');

      const newBalance = userRow.tokenBalance - charge;

      const document = await tx.document.create({
        data: {
          userId,
          title:
            improvedProfile.name && improvedProfile.name.trim()
              ? `${improvedProfile.name.trim()} ${docType === 'cv' ? 'CV' : 'Resume'}`
              : docType === 'cv'
              ? 'CV Draft'
              : 'Resume Draft',
          docType,
          status: action === 'manager' ? 'Sent' : 'Ready',
          format: action === 'manager' ? 'pending-manager' : 'pdf',
          data: documentPayload as any,
        },
      });

      await tx.user.update({ where: { id: userId }, data: { tokenBalance: newBalance } });
      await tx.ledgerEntry.create({
        data: {
          userId,
          type: action === 'manager' ? 'Manager Assist' : 'AI Assist',
          delta: -charge,
          balanceAfter: newBalance,
        },
      });

      return { document, tokenBalance: newBalance };
    });

    return NextResponse.json({
      profile: improvedProfile,
      document: {
        id: result.document.id,
        title: result.document.title,
        status: result.document.status,
        docType: result.document.docType,
      },
      tokenBalance: result.tokenBalance,
      charge,
      action,
      releaseAt: releaseAtIso ?? undefined,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'INSUFFICIENT_TOKENS') {
        return NextResponse.json({ error: 'Not enough tokens' }, { status: 400 });
      }
      if (error.message === 'USER_NOT_FOUND') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }
    console.error('[RESUME_IMPROVE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to save improved document' }, { status: 500 });
  }
}

