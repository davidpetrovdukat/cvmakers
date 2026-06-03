import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SERVICE_COSTS } from '@/lib/currency';
import { getRequestLocale, getTranslator } from '@/i18n/server';
import { normalizeLocale } from '@/i18n/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// List documents for current user
export async function GET() {
  const locale = await getRequestLocale();
  const t = getTranslator(locale);
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: t('api.unauthorized') }, { status: 401 });
    const userId = (session.user as any).id as string;
    const docs = await prisma.document.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
    return NextResponse.json({ documents: docs });
  } catch (err) {
    console.error('[DOCUMENTS_GET_ERROR]', err);
    return NextResponse.json({ error: t('api.failedLoadDocuments') }, { status: 500 });
  }
}

// Create a document and charge tokens (configurable, default 100)
export async function POST(req: Request) {
  const requestLocale = await getRequestLocale();
  const t = getTranslator(requestLocale);
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: t('api.unauthorized') }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json().catch(() => ({}));
  const locale = normalizeLocale(body.locale || body?.data?.meta?.locale || requestLocale);
  const localeT = getTranslator(locale);
  const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : localeT('documents.untitled');
  const rawData = typeof body.data === 'object' && body.data !== null ? body.data : {};
  const data = {
    ...rawData,
    meta: {
      ...(typeof rawData.meta === 'object' && rawData.meta !== null ? rawData.meta : {}),
      locale,
    },
  };
  const actionRaw = typeof body.action === 'string' ? body.action.toLowerCase() : 'draft';
  const allowedActions = new Set(['draft', 'export-pdf', 'export-docx']);
  const action = allowedActions.has(actionRaw) ? actionRaw : 'draft';
  // Use SERVICE_COSTS from currency.ts, with env override support
  const draftCharge = Number(process.env.TOKENS_PER_DOCUMENT || SERVICE_COSTS.CREATE_DRAFT);
  const exportCharge = Number(process.env.TOKENS_PER_EXPORT || SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF);
  const chargeMap: Record<string, number> = {
    draft: draftCharge,
    'export-pdf': exportCharge,
    'export-docx': SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_DOCX,
  };
  const charge = chargeMap[action] ?? draftCharge;
  const docTypeRaw = typeof body.docType === 'string' ? body.docType.toLowerCase() : 'document';
  const docType = ['cv', 'resume', 'document'].includes(docTypeRaw) ? docTypeRaw : 'document';
  const status = action === 'draft' ? 'Draft' : 'Ready';
  const format = action === 'export-docx' ? 'docx' : action === 'export-pdf' ? 'pdf' : 'draft';

  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { tokenBalance: true } });
      if (!user) return NextResponse.json({ error: localeT('api.userNotFound') }, { status: 404 });
      if (user.tokenBalance < charge) return NextResponse.json({ error: localeT('api.notEnoughTokens') }, { status: 400 });

      const doc = await tx.document.create({
        data: {
          userId,
          title,
          data: data as any,
          docType,
          status,
          format,
        },
      });

      const newBalance = user.tokenBalance - charge;
      await tx.user.update({ where: { id: userId }, data: { tokenBalance: newBalance } });
      await tx.ledgerEntry.create({
        data: {
          userId,
          type: action === 'draft' ? 'Document' : 'Document Export',
          delta: -charge,
          balanceAfter: newBalance,
        },
      });

      return NextResponse.json({ document: doc, tokenBalance: newBalance, charge, action });
    });
  } catch (err) {
    console.error('[DOCUMENTS_POST_ERROR]', err);
    return NextResponse.json({ error: t('api.failedCreateDocument') }, { status: 500 });
  }
}


