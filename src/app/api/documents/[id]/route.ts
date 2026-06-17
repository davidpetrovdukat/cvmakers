import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRequestLocale, getTranslator } from '@/i18n/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = getTranslator(await getRequestLocale());
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: t('api.unauthorized') }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { id } = await params;

  const doc = await prisma.document.findFirst({ where: { id, userId } });
  if (!doc) return NextResponse.json({ error: t('api.notFound') }, { status: 404 });
  return NextResponse.json({ document: doc });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = getTranslator(await getRequestLocale());
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: t('api.unauthorized') }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === 'string' ? body.title : undefined;
  const data = typeof body.data === 'object' ? body.data : undefined;
  const status = typeof body.status === 'string' ? body.status : undefined;
  const format = typeof body.format === 'string' ? body.format : undefined;
  const docType = typeof body.docType === 'string' ? body.docType : undefined;

  const exists = await prisma.document.findFirst({ where: { id, userId } });
  if (!exists) return NextResponse.json({ error: t('api.notFound') }, { status: 404 });

  const updated = await prisma.document.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(data && { data: data as any }),
      ...(status && { status }),
      ...(format && { format }),
      ...(docType && { docType }),
    },
  });
  return NextResponse.json({ document: updated });
}




