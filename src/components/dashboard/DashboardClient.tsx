'use client';



import { Button, Card, Input } from '@/components';

import Section from '@/components/layout/Section';

import DocumentA4 from '@/components/pdf/DocumentA4';

import InvoiceA4 from '@/components/pdf/InvoiceA4';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Currency, getCurrencySymbol } from '@/lib/currency';
import { useI18n } from '@/i18n/LocaleProvider';



// ТИПЫ И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ

type Document = { id: string; title: string; updatedAt: string; status?: "Draft" | "Ready"; format?: string; docType?: string; data?: any };

type LedgerRow = { id: string; ts: string; type: 'Top-up' | 'Document' | 'Adjust' | 'STRIPE_PURCHASE'; delta: number; balanceAfter: number; currency?: Currency; amount?: number; receiptUrl?: string; invoiceNumber?: string };

type Company = { name: string; vat?: string; reg?: string; address1?: string; city?: string; country?: string; iban?: string; bankName?: string; bic?: string };

type Me = { id: string; name: string | null; email: string | null; tokenBalance: number; currency: Currency; company: Company | null };

type MarkReadyResult = { ok: boolean; err?: string; document?: any };

type ProfileForm = { firstName: string; lastName: string; email: string; phone: string; photo: string };

const DASHBOARD_COPY = {
  en: {
    hello: 'Hello',
    intro: 'Manage your CV and resume, token balance, and token history.',
    balance: 'Balance',
    tokens: 'tokens',
    settings: 'My settings',
    recentDocuments: 'Recent documents',
    viewAll: 'View all',
    title: 'Title',
    updated: 'Updated',
    status: 'Status',
    actions: 'Actions',
    document: 'Document',
    draft: 'Draft',
    view: 'View',
    hide: 'Hide',
    edit: 'Edit',
    download: 'Download',
    tokenHistory: 'Token history',
    date: 'Date',
    type: 'Type',
    delta: 'Delta',
    profileIntro: 'These details personalise your CV and resume.',
    name: 'Name',
    surname: 'Surname',
    email: 'E-mail',
    phone: 'Phone',
    photo: 'Photo',
    profileAlt: 'Profile',
    remove: 'Remove',
    saving: 'Saving...',
    saveProfile: 'Save profile',
    savedProfile: 'Profile saved. CV and resume will use these details.',
    failedProfile: 'Failed to save profile',
    notFound: 'Document not found',
    exportNotReady: 'This draft is not export-ready yet. Use export actions to generate a file.',
    managerPending: 'within the next few hours',
    managerWorking: (date: string) => `Personal manager is still working on it. Expected by ${date}.`,
    managerWorkingShort: 'Personal manager is still working on it. Please try again later.',
    finalizeFailed: 'Unable to finalize manager document',
    failed: 'Failed',
    pdfFailed: 'Failed to download PDF',
    newDocument: 'New Document',
    section: 'Section',
    text: 'Text',
    createFailed: 'Error creating document',
    topUpFailed: 'Top-up failed',
    promptEmail: "Please enter the recipient's email address:",
    emailFailed: 'Failed to send email.',
    emailSent: 'Email sent successfully!',
    emailError: 'Error sending email. Please try again.',
    saveFailed: 'Failed to save',
    resume: 'Resume',
    cv: 'CV',
  },
  tr: {
    hello: 'Merhaba',
    intro: 'CV ve özgeçmişlerinizi, token bakiyenizi ve token geçmişinizi yönetin.',
    balance: 'Bakiye',
    tokens: 'token',
    settings: 'Ayarlarım',
    recentDocuments: 'Son belgeler',
    viewAll: 'Tümünü görüntüle',
    title: 'Başlık',
    updated: 'Güncellendi',
    status: 'Durum',
    actions: 'İşlemler',
    document: 'Belge',
    draft: 'Taslak',
    view: 'Görüntüle',
    hide: 'Gizle',
    edit: 'Düzenle',
    download: 'İndir',
    tokenHistory: 'Token geçmişi',
    date: 'Tarih',
    type: 'Tür',
    delta: 'Değişim',
    profileIntro: 'Bu bilgiler CV ve özgeçmişlerinizi kişiselleştirir.',
    name: 'Ad',
    surname: 'Soyad',
    email: 'E-posta',
    phone: 'Telefon',
    photo: 'Fotoğraf',
    profileAlt: 'Profil',
    remove: 'Kaldır',
    saving: 'Kaydediliyor...',
    saveProfile: 'Profili kaydet',
    savedProfile: 'Profil kaydedildi. CV ve özgeçmişler bu bilgileri kullanacak.',
    failedProfile: 'Profil kaydedilemedi',
    notFound: 'Belge bulunamadı',
    exportNotReady: 'Bu taslak henüz dışa aktarmaya hazır değil. Dosya oluşturmak için dışa aktarma işlemlerini kullanın.',
    managerPending: 'önümüzdeki birkaç saat içinde',
    managerWorking: (date: string) => `Kişisel yönetici hâlâ belge üzerinde çalışıyor. Beklenen zaman: ${date}.`,
    managerWorkingShort: 'Kişisel yönetici hâlâ belge üzerinde çalışıyor. Lütfen daha sonra tekrar deneyin.',
    finalizeFailed: 'Yönetici belgesi tamamlanamadı',
    failed: 'Başarısız',
    pdfFailed: 'PDF indirilemedi',
    newDocument: 'Yeni Belge',
    section: 'Bölüm',
    text: 'Metin',
    createFailed: 'Belge oluşturulurken hata oluştu',
    topUpFailed: 'Token yükleme başarısız oldu',
    promptEmail: 'Lütfen alıcının e-posta adresini girin:',
    emailFailed: 'E-posta gönderilemedi.',
    emailSent: 'E-posta başarıyla gönderildi!',
    emailError: 'E-posta gönderilirken hata oluştu. Lütfen tekrar deneyin.',
    saveFailed: 'Kaydedilemedi',
    resume: 'Özgeçmiş',
    cv: 'CV',
  },
  ja: {
    hello: 'こんにちは',
    intro: 'CV・職務経歴書、トークン残高、トークン履歴を管理できます。',
    balance: '残高',
    tokens: 'トークン',
    settings: '設定',
    recentDocuments: '最近のドキュメント',
    viewAll: 'すべて表示',
    title: 'タイトル',
    updated: '更新日',
    status: 'ステータス',
    actions: '操作',
    document: 'ドキュメント',
    draft: '下書き',
    view: '表示',
    hide: '非表示',
    edit: '編集',
    download: 'ダウンロード',
    tokenHistory: 'トークン履歴',
    date: '日付',
    type: '種類',
    delta: '増減',
    profileIntro: 'これらの情報はCVと職務経歴書をパーソナライズするために使用されます。',
    name: '名',
    surname: '姓',
    email: 'メール',
    phone: '電話',
    photo: '写真',
    profileAlt: 'プロフィール',
    remove: '削除',
    saving: '保存中...',
    saveProfile: 'プロフィールを保存',
    savedProfile: 'プロフィールを保存しました。CVと職務経歴書にこれらの情報が反映されます。',
    failedProfile: 'プロフィールの保存に失敗しました',
    notFound: 'ドキュメントが見つかりません',
    exportNotReady: 'この下書きはまだエクスポートできません。エクスポート操作を使用してファイルを生成してください。',
    managerPending: '数時間以内',
    managerWorking: (date: string) => `担当マネージャーがまだ作業中です。${date}までにお届け予定です。`,
    managerWorkingShort: '担当マネージャーがまだ作業中です。後でもう一度お試しください。',
    finalizeFailed: 'マネージャードキュメントの確定に失敗しました',
    failed: '失敗',
    pdfFailed: 'PDFのダウンロードに失敗しました',
    newDocument: '新規ドキュメント',
    section: 'セクション',
    text: 'テキスト',
    createFailed: 'ドキュメントの作成中にエラーが発生しました',
    topUpFailed: 'トークンのチャージに失敗しました',
    promptEmail: '受信者のメールアドレスを入力してください：',
    emailFailed: 'メールの送信に失敗しました。',
    emailSent: 'メールを正常に送信しました！',
    emailError: 'メール送信中にエラーが発生しました。もう一度お試しください。',
    saveFailed: '保存に失敗しました',
    resume: '職務経歴書',
    cv: 'CV',
  },
} as const;



const currencySym = (c: Currency) => `${c} `;

const fmtMoney = (n: number, c: Currency) => {

  const sym = currencySym(c);

  const abs = Math.abs(n);

  const opts: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

  try { return `${n < 0 ? '-' : ''}${sym}${new Intl.NumberFormat(undefined, opts).format(abs)}`; } catch { return `${sym}${abs.toFixed(2)}`; }

};



function money(n: number, c: Currency) {

  const sym = getCurrencySymbol(c);

  const abs = Math.abs(n);

  const opts: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

  try { return `${n < 0 ? '-' : ''}${sym}${new Intl.NumberFormat(undefined, opts).format(abs)}`; } catch { return `${sym}${abs.toFixed(2)}`; }

}

function int(n: number) { try { return new Intl.NumberFormat().format(Math.round(n)); } catch { return String(Math.round(n)); } }





// ====================================================================

// ОСНОВНОЙ КОМПОНЕНТ

// ====================================================================



export default function DashboardClient() {

  const router = useRouter();
  const { locale } = useI18n();
  const copy = DASHBOARD_COPY[locale];
  const bcRef = useRef<BroadcastChannel | null>(null);

  const [me, setMe] = useState<Me | null>(null);

  const [invoices, setInvoices] = useState<Document[]>([]);

  const [ledger, setLedger] = useState<LedgerRow[]>([]);

  const [invRange, setInvSlice] = useState<[number, number]>([0, 20]);

  const [ledRange, setLedSlice] = useState<[number, number]>([0, 20]);

  const [savingProfile, setSavingProfile] = useState(false);

  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileForm>({ firstName: '', lastName: '', email: '', phone: '', photo: '' });
  const profileInitializedRef = useRef(false);

  const [viewId, setViewId] = useState<string | null>(null);

  const [viewInv, setViewInv] = useState<any | null>(null);

  const [printing, setPrinting] = useState<any>(null);



  // load data

  useEffect(() => {

    try { bcRef.current = new BroadcastChannel('app-events'); } catch {}

    const cleanup = () => { try { bcRef.current?.close(); } catch {} };

    const loadAll = async () => {

      const meRes = await fetch('/api/me');

      if (meRes.ok) {

        const { user } = await meRes.json();

        setMe(user);

        if (!profileInitializedRef.current) {
          setProfile({
            firstName: user.company?.name || '',
            lastName: user.company?.vat || '',
            email: user.company?.reg || user.email || '',
            phone: user.company?.address1 || '',
            photo: user.company?.logoUrl || '',
          });
          profileInitializedRef.current = true;
        }

        try { bcRef.current?.postMessage({ type: 'tokens-updated', tokenBalance: user.tokenBalance }); } catch {}

      }

      const invRes = await fetch('/api/documents');

      if (invRes.ok) {

        const { documents } = await invRes.json();

        setInvoices(documents);

      }

      const ledRes = await fetch('/api/ledger');

      if (ledRes.ok) {

        const { ledger } = await ledRes.json();

        setLedger(ledger);

      }

    };

    loadAll();

    const onFocus = () => { loadAll(); };

    try { window.addEventListener('focus', onFocus); } catch {}

    return () => {

      try { window.removeEventListener('focus', onFocus); } catch {}

      cleanup();

    };

  }, []);



  const fetchInvoice = async (id: string) => {

    const res = await fetch(`/api/documents/${id}`);

    if (!res.ok) return null;

    const { document } = await res.json();

    return document as any;

  };



  const openView = async (id: string) => {

    if (viewId === id) {

      setViewId(null);

      setViewInv(null);

      return;

    }

    const inv = await fetchInvoice(id);

    if (!inv) { alert(copy.notFound); return; }

    setViewId(id);

    setViewInv(inv);

  };



  const markReadyIfDraft = async (document: any): Promise<MarkReadyResult> => {
    if (!document) return { ok: false, err: copy.notFound };
    const docType = String((document as any).docType ?? '').toLowerCase();
    const statusRaw = String((document as any).status ?? '').toLowerCase();

    const isResumeDoc = docType === 'cv' || docType === 'resume';
    if (!isResumeDoc) return { ok: true, document };

    if (statusRaw === 'draft') {
      return { ok: false, err: copy.exportNotReady };
    }

    if (statusRaw === 'sent') {
      try {
        const res = await fetch(`/api/resume/manager/${document.id}/release`, { method: 'POST' });
        if (res.status === 202) {
          const pendingPayload = await res.json().catch(() => ({}));
          const releaseAtIso = typeof pendingPayload?.releaseAt === 'string' ? pendingPayload.releaseAt : null;
          if (releaseAtIso) {
            const releaseAt = new Date(releaseAtIso);
            const formatted = Number.isNaN(releaseAt.getTime())
              ? copy.managerPending
              : releaseAt.toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
            return { ok: false, err: copy.managerWorking(formatted) };
          }
          return { ok: false, err: copy.managerWorkingShort };
        }
        if (!res.ok) {
          const errorPayload = await res.json().catch(() => ({}));
          return { ok: false, err: errorPayload?.error || copy.finalizeFailed };
        }
        const payload = await res.json().catch(() => ({}));
        const updated = payload?.document ?? document;
        setInvoices((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
        if (viewInv?.id === updated.id) setViewInv(updated);
        return { ok: true, document: updated };
      } catch (error) {
        return { ok: false, err: error instanceof Error ? error.message : copy.finalizeFailed };
      }
    }

    return { ok: true, document };
  };



  const ensureReadyAndDownload = async (id: string) => {

    const invFull = await fetchInvoice(id);

    if (!invFull) { alert(copy.notFound); return; }

    const mark = await markReadyIfDraft(invFull);
    if (!mark.ok) { alert(mark.err || copy.failed); return; }
    const resolvedDoc = mark.document ?? invFull;
    const docType = (resolvedDoc as any).docType;
    const isResumeDocument = docType === 'cv' || docType === 'resume';
    const documentId = (resolvedDoc as any).id || id;
    const downloadPath = isResumeDocument ? `/api/resume/pdf/${documentId}` : `/api/pdf/${documentId}`;
    const fallbackName = (resolvedDoc as any).title || (isResumeDocument ? (docType === 'cv' ? copy.cv : copy.resume) : copy.document);

    try {
      const res = await fetch(downloadPath);

      if (!res.ok) {
        const details = await res.json().catch(() => null);
        const message = [details?.error, details?.details, details?.hint].filter(Boolean).join(': ');
        throw new Error(message || `PDF download failed with status ${res.status}`);
      }

      const blob = await res.blob();

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${fallbackName}.pdf`;

      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);

    } catch (e) {

      alert(e instanceof Error ? e.message : copy.pdfFailed);

    }

  };



  const handleEditDocument = (document: any) => {
    if (!document) return;
    const docType = (document as any).docType === 'cv' ? 'cv' : 'resume';
    const basePath = docType === 'cv' ? '/create-cv' : '/create-resume';
    const data: any = (document as any).data || {};
    const templateKey = data.template ?? data.templateKey ?? (document as any).template;
    const params = new URLSearchParams();
    params.set('documentId', document.id);
    if (typeof templateKey === 'string' && templateKey) {
      params.set('template', templateKey);
    }
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleViewDocument = (document: any) => {
    if (!document) return;
    const docType = (document as any).docType;
    if (docType === 'cv' || docType === 'resume') {
      const templateKey = (document as any)?.data?.template ?? (document as any)?.data?.templateKey;
      const query = templateKey ? `?template=${encodeURIComponent(templateKey)}` : '';
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const target = origin ? `${origin}/print-resume/${document.id}${query}` : `/print-resume/${document.id}${query}`;
      try {
        window.open(target, '_blank', 'noopener');
      } catch {
        window.open(`/print-resume/${document.id}${query}`, '_blank', 'noopener');
      }
      return;
    }
    openView(document.id);
  };


  const createInvoice = async () => {

    if (!me) return;

    if (me.tokenBalance < 10) { alert('Недостаточно токенов. Пополните баланс.'); return; }

    const res = await fetch('/api/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: copy.newDocument, data: { content: [{ heading: copy.section, text: copy.text }] }, locale }) });

    if (res.ok) {

      const { document, tokenBalance } = await res.json();

      setInvoices(prev => [ document, ...prev ]);

      setMe({ ...me, tokenBalance });

      try { bcRef.current?.postMessage({ type: 'tokens-updated', tokenBalance }); } catch {}

      const ledRes = await fetch('/api/ledger');

      if (ledRes.ok) {

        const { ledger } = await ledRes.json();

        setLedger(ledger);

      }

    } else {

      const j = await res.json().catch(()=>({ error:'Error'}));

      alert(j.error || copy.createFailed);

    }

  };



  const topUp = async (amount: number) => {

    if (!me) return;

    const res = await fetch('/api/ledger', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'Top-up', amount, currency: me.currency }) });

    if (res.ok) {

      const { tokenBalance } = await res.json();

      setMe({ ...me, tokenBalance });

      try { bcRef.current?.postMessage({ type: 'tokens-updated', tokenBalance }); } catch {}

      const ledRes = await fetch('/api/ledger');

      if (ledRes.ok) {

        const { ledger } = await ledRes.json();

        setLedger(ledger);

      }

    } else {

      alert(copy.topUpFailed);

    }

  };



  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfile(prev => ({ ...prev, photo: reader.result as string }));
        profileInitializedRef.current = true;
      }
    };

    reader.readAsDataURL(file);

    event.target.value = '';

  };



  const saveProfile = async (next: ProfileForm) => {

    setSavingProfile(true);

    const payload = {

      firstName: next.firstName,

      lastName: next.lastName,

      contactEmail: next.email,

      phone: next.phone,

      photo: next.photo,

    };

    const res = await fetch('/api/company', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

    if (res.ok) {

      const { company } = await res.json();

      setProfile({

        firstName: company?.name || '',

        lastName: company?.vat || '',

        email: company?.reg || '',

        phone: company?.address1 || '',

        photo: company?.logoUrl || '',

      });
      profileInitializedRef.current = true;

      setMe(prev => prev ? { ...prev, company } : prev);

      setSavingProfile(false);

      setErrorBanner(null);

      setSavedBanner(copy.savedProfile);

      try { bcRef.current?.postMessage({ type: 'profile-updated', company }); } catch {}

      setTimeout(() => setSavedBanner(null), 2500);

    } else {

      setSavingProfile(false);

      let message = copy.failedProfile;

      try {

        const j = await res.json();

        if (j?.error) message = j.error;

      } catch {}

      setSavedBanner(null);

      setErrorBanner(message);

      setTimeout(() => setErrorBanner(null), 3500);

    }

  };



  const userName = me?.name || 'User';

  const currency = (me?.currency || 'GBP') as Currency;

  const tokenBalance = me?.tokenBalance ?? 0;

  const invView = invoices.slice(invRange[0], invRange[1]);

  const ledgerView = ledger.slice(ledRange[0], ledRange[1]);



  const onInvoiceSlice = useCallback((from: number, to: number) => {

    setInvSlice([from, to]);

  }, []);



  const onLedgerSlice = useCallback((from: number, to: number) => {

    setLedSlice([from, to]);

  }, []);



  return (

    <>

    <main className="bg-slate-50 min-h-screen">

      <style>{`.reveal-in{opacity:1;transform:translateY(0);filter:blur(0)}[data-reveal]{opacity:0;transform:translateY(6px);filter:blur(4px);transition:all .45s ease}`}</style>

      <Section className="py-6">

        <div className="flex flex-wrap items-center justify-between gap-2">

          <div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{copy.hello}, {userName}</h1>

            <p className="mt-1 text-slate-600">{copy.intro}</p>

          </div>

          <div className="flex items-center gap-2">

            <div className="inline-flex items-center gap-2 text-sm rounded-full border border-black/10 bg-white px-3 py-1">{copy.balance}: <b>{int(tokenBalance)}</b> {copy.tokens}</div>

            <a href="#profile-settings" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm">{copy.settings}</a>

          </div>

        </div>



        <div className="mt-4 grid lg:grid-cols-2 gap-4 items-start">

          <Card padding="sm" data-reveal>

              <div className="flex items-center justify-between">

                <div className="text-base font-semibold">{copy.recentDocuments}</div>

                <a className="text-sm underline" href="#">{copy.viewAll}</a>

              </div>

              <div className="mt-3 overflow-hidden rounded-xl border border-black/10">

                <table className="w-full text-sm">

                  <thead className="bg-slate-50 text-slate-600">

                    <tr>

                      <th className="text-left px-3 py-2">{copy.title}</th>

                      <th className="text-left px-3 py-2">{copy.updated}</th>
                      <th className="text-left px-3 py-2">{copy.status}</th>


                      <th className="text-right px-3 py-2">{copy.actions}</th>

                    </tr>

                  </thead>

                  <tbody>

                    {invView.map((inv) => {
                      const rawStatus = ((inv as any).status ?? (inv as any).statusMessage ?? inv.status ?? copy.draft) as string;
                      const statusLabel = typeof rawStatus === 'string' ? rawStatus : copy.draft;
                      const docType = (inv as any).docType;
                      const isResumeDocument = docType === 'cv' || docType === 'resume';
                      const normalizedStatus = statusLabel.toString().trim().toLowerCase();
                      const isDraft = isResumeDocument && normalizedStatus === 'draft';

                      return (

                      <React.Fragment key={inv.id}>

                        <tr className={`border-t ${viewId===inv.id ? 'border-black' : 'border-black/10'}`}>

                          <td className={`px-3 py-2 font-mono text-[12px] ${viewId===inv.id ? 'border-t-2 border-l-2 border-black rounded-tl-xl' : ''}`}>{(inv as any).title || copy.document}</td>

                          <td className={`px-3 py-2 ${viewId===inv.id ? 'border-t-2 border-black' : ''}`}>{new Date(inv.updatedAt).toISOString().slice(0,10)}</td>

                          <td className={`px-3 py-2 ${viewId===inv.id ? 'border-t-2 border-black' : ''}`}>{statusLabel}</td>

                          <td className={`px-3 py-2 text-right ${viewId===inv.id ? 'border-t-2 border-r-2 border-black rounded-tr-xl' : ''}`}>
                            <div className="flex justify-end gap-2">
                              <button
                                className="text-sm underline"
                                onClick={() => handleViewDocument(inv)}
                              >
                                {(inv as any).docType === 'cv' || (inv as any).docType === 'resume' ? copy.view : (viewId===inv.id ? copy.hide : copy.view)}
                              </button>
                              {isDraft ? (
                                <button
                                  className="text-sm underline"
                                  onClick={() => handleEditDocument(inv)}
                                >
                                  {copy.edit}
                                </button>
                              ) : (
                                <button className="text-sm underline" onClick={() => ensureReadyAndDownload(inv.id)}>{copy.download}</button>
                              )}
                            </div>
                          </td>

                        </tr>

                      </React.Fragment>

                    );

                    })}


                  </tbody>

                 </table>

                 <InvoicePager total={invoices.length} pageSize={20} onSlice={onInvoiceSlice} />

              </div>

          </Card>



          <Card padding="sm" data-reveal>

              <div className="text-base font-semibold">{copy.tokenHistory}</div>

              <div className="mt-3 overflow-hidden rounded-xl border border-black/10">

                <table className="w-full text-sm">

                  <thead className="bg-slate-50 text-slate-600">

                    <tr>

                      <th className="text-left px-3 py-2">{copy.date}</th>

                      <th className="text-left px-3 py-2">{copy.type}</th>


                      <th className="text-right px-3 py-2">{copy.delta}</th>

                      <th className="text-right px-3 py-2">{copy.balance}</th>


                    </tr>

                  </thead>

                  <tbody>

                    {ledgerView.map(row => (

                      <tr key={row.id} className="border-t border-black/10">

                        <td className="px-3 py-2 whitespace-nowrap">{new Date(row.ts).toLocaleString()}</td>

                        <td className="px-3 py-2">{row.type}</td>


                        <td className={`px-3 py-2 text-right ${row.delta>0?'text-emerald-700':'text-slate-900'}`}>{row.delta>0? `+${int(row.delta)}` : `-${int(Math.abs(row.delta))}`} {copy.tokens}</td>

                        <td className="px-3 py-2 text-right">{int(row.balanceAfter)}</td>


                      </tr>

                    ))}

                  </tbody>

                 </table>

                 <LedgerPager total={ledger.length} pageSize={20} onSlice={onLedgerSlice} />

              </div>

          </Card>

        </div>



        <div className="mt-6 scroll-mt-24" id="profile-settings">

            <Card padding="sm">

              <div className="text-base font-semibold">{copy.settings}</div>

              <p className="text-sm text-slate-600 mt-1">{copy.profileIntro}</p>

              {savedBanner && <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm p-3">{savedBanner}</div>}

              {errorBanner && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 text-red-900 text-sm p-3">{errorBanner}</div>}

              <form className="mt-4 grid gap-3" onSubmit={(e)=>{e.preventDefault(); saveProfile(profile);}}>

                <Input label={copy.name} value={profile.firstName} onChange={(e)=>setProfile({ ...profile, firstName: e.target.value })} required />

                <Input label={copy.surname} value={profile.lastName} onChange={(e)=>setProfile({ ...profile, lastName: e.target.value })} />

                <Input label={copy.email} type="email" value={profile.email} onChange={(e)=>setProfile({ ...profile, email: e.target.value })} required />

                <Input label={copy.phone} value={profile.phone} onChange={(e)=>setProfile({ ...profile, phone: e.target.value })} />

                <div className="grid gap-2">

                  <label className="text-xs text-[#475569] font-medium">{copy.photo}</label>

                  {profile.photo && (

                    <div className="flex items-center gap-3">

                      <img src={profile.photo} alt={copy.profileAlt} className="h-16 w-16 rounded-full object-cover border border-black/10" />

                      <Button type="button" size="sm" variant="outline" onClick={()=>setProfile({ ...profile, photo: '' })}>{copy.remove}</Button>

                    </div>

                  )}

                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm" />

                </div>

                <div className="mt-2">

                  <Button disabled={savingProfile} variant="primary" type="submit">{savingProfile? copy.saving : copy.saveProfile}</Button>

                </div>

              </form>

            </Card>

        </div>

      </Section>

    </main>

    {printing && (

      <div id="dash-print-area" style={{ position:'absolute', left: '-10000px', top: 0, width: '100%' }}>

        <DocumentA4

          title={printing.title}

          documentNo={printing.documentNo}

          documentDate={printing.documentDate}

          sender={printing.sender}

          recipient={printing.recipient}

          content={printing.content}

          notes={printing.notes}

          footerText={printing.footerText}

        />

      </div>

    )}

    {viewId && viewInv && (

      <div className="fixed inset-0 z-50">

        <div className="absolute inset-0 bg-black/30" onClick={()=>{ setViewId(null); setViewInv(null); }} />

        <div className="absolute inset-0 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full overflow-hidden">

            <ModalInvoiceView

              invoice={viewInv}

              onClose={() => { setViewId(null); setViewInv(null); }}

              onRefresh={async(id)=>{ const inv = await fetchInvoice(id); if(inv) setViewInv(inv); }}

              onDownload={()=>ensureReadyAndDownload(viewInv.id)}

              onSendEmail={async () => {

                const current = viewInv as any;
                const defaultEmail = current?.data?.recipient?.email || '';
                const recipientEmail = prompt(copy.promptEmail, defaultEmail);
                if (!recipientEmail) return;

                try {
                  const res = await fetch('/api/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: recipientEmail, documentId: current.id }),
                  });
                  if (!res.ok) {
                    const payload = await res.json().catch(() => ({}));
                    throw new Error(payload?.error || copy.emailFailed);
                  }
                  alert(copy.emailSent);
                } catch (error) {
                  console.error('Email send error:', error);
                  alert(error instanceof Error ? error.message : copy.emailError);
                }

              }}

              onSave={async(next)=>{

                const res = await fetch(`/api/documents/${viewInv.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });

                if (res.ok) { const j = await res.json(); setViewInv(j.document); setInvoices(prev=>prev.map(x=>x.id===j.document.id? j.document : x)); }

                else { const j = await res.json().catch(()=>({error: copy.failed})); alert(j.error||copy.saveFailed); }

              }}

            />

          </div>

        </div>

      </div>

    )}

    </>

  );

}





// === ВЫНЕСЕННЫЕ КОМПОНЕНТЫ ===



function TablePager({ total, pageSize = 20, onSlice }: { total: number; pageSize?: number; onSlice: (from: number, to: number) => void }) {

  const [page, setPage] = useState(1);

  const pages = Math.max(1, Math.ceil(total / pageSize));



  useEffect(() => {

    const from = Math.min((page - 1) * pageSize, Math.max(0, total - (total % pageSize || pageSize)));

    const to = Math.min(from + pageSize, total);

    onSlice(from, to);

  }, [page, total, pageSize, onSlice]);



  if (total <= pageSize) return null;



  return (

    <div className="flex items-center justify-between p-3">

      <div className="text-xs text-slate-600">Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}</div>

      <div className="flex items-center gap-2">

        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>

        <div className="text-xs text-slate-600">{page} / {pages}</div>

        <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</Button>

      </div>

    </div>

  );

}



const InvoicePager = TablePager;

const LedgerPager = TablePager;



function ModalInvoiceView({ invoice, onClose, onDownload, onSendEmail, onRefresh, onSave }: {

  invoice: any;

  onClose: () => void;

  onDownload: () => void;

  onSendEmail: () => void;

  onRefresh: (id: string) => Promise<void>;

  onSave: (next: Record<string, any>) => Promise<void>;

}) {

  const [editing, setEditing] = useState(false);
  const invoiceData = (invoice.data || {}) as any;
  const initialItems = Array.isArray(invoice.items) ? invoice.items : Array.isArray(invoiceData.items) ? invoiceData.items : [];
  const displayDate = (() => {
    const value = invoice.date || invoiceData.documentDate || invoice.createdAt || invoice.updatedAt;
    if (!value) return '';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString().slice(0, 10);
  })();
  const displayRecipient = invoice.clientMeta || invoiceData.recipient || {};
  const displayCurrency = invoice.currency || invoiceData.currency || 'GBP';

  const [form, setForm] = useState<{ client: string; subtotal: number; tax: number; total: number }>({ client: invoice.client, subtotal: invoice.subtotal, tax: invoice.tax, total: invoice.total });

  const [client, setClient] = useState<{ name: string; vat: string; address: string; city: string; country: string; email: string }>({

    name: invoice.client || displayRecipient.name || displayRecipient.company || '',

    vat: (displayRecipient?.vat as string) || '',

    address: (displayRecipient?.address as string) || '',

    city: (displayRecipient?.city as string) || '',

    country: (displayRecipient?.country as string) || '',

    email: (displayRecipient?.email as string) || '',

  });

  const [company, setCompany] = useState<any>({

    name: invoice.user?.company?.name || '',

    vat: invoice.user?.company?.vat || '',

    reg: invoice.user?.company?.reg || '',

    address1: invoice.user?.company?.address1 || '',

    city: invoice.user?.company?.city || '',

    country: invoice.user?.company?.country || '',

    iban: invoice.user?.company?.iban || '',

    bankName: invoice.user?.company?.bankName || '',

    bic: invoice.user?.company?.bic || '',

  });

  const [items, setItems] = useState<Array<{ desc: string; qty: number; rate: number; tax: number }>>(

    initialItems.map((it: any) => ({ desc: it.description ?? it.desc ?? '', qty: it.quantity ?? it.qty ?? 0, rate: Number(it.rate), tax: it.tax ?? 0 }))

  );

  const [rateInputs, setRateInputs] = useState<string[]>(

    initialItems.map((it: any) => {

      const v = Number(it.rate ?? 0);

      return Number.isFinite(v) ? v.toFixed(2) : '0.00';

    })

  );



  const totals = (() => {

    const subtotal = items.reduce((s, it) => s + (Number(it.qty)||0)*(Number(it.rate)||0), 0);

    const tax = items.reduce((s, it) => s + (Number(it.qty)||0)*(Number(it.rate)||0)*((Number(it.tax)||0)/100), 0);

    return { subtotal: Math.round(subtotal), tax: Math.round(tax), total: Math.round(subtotal + tax) };

  })();



  useEffect(() => {

    setForm({ client: invoice.client, subtotal: invoice.subtotal, tax: invoice.tax, total: invoice.total });

    const nextData = (invoice.data || {}) as any;
    const nextRecipient = invoice.clientMeta || nextData.recipient || {};

    setClient({

      name: invoice.client || nextRecipient.name || nextRecipient.company || '',

      vat: (nextRecipient?.vat as string) || '',

      address: (nextRecipient?.address as string) || '',

      city: (nextRecipient?.city as string) || '',

      country: (nextRecipient?.country as string) || '',

      email: (nextRecipient?.email as string) || '',

    });

    setCompany({

      name: invoice.user?.company?.name || '',

      vat: invoice.user?.company?.vat || '',

      reg: invoice.user?.company?.reg || '',

      address1: invoice.user?.company?.address1 || '',

      city: invoice.user?.company?.city || '',

      country: invoice.user?.company?.country || '',

      iban: invoice.user?.company?.iban || '',

      bankName: invoice.user?.company?.bankName || '',

      bic: invoice.user?.company?.bic || '',

    });

    const nextItems = Array.isArray(invoice.items) ? invoice.items : Array.isArray(nextData.items) ? nextData.items : [];
    setItems(nextItems.map((it: any) => ({ desc: it.description ?? it.desc ?? '', qty: it.quantity ?? it.qty ?? 0, rate: Number(it.rate), tax: it.tax ?? 0 })));

    setRateInputs(nextItems.map((it: any) => {

      const v = Number(it.rate ?? 0);

      return Number.isFinite(v) ? v.toFixed(2) : '0.00';

    }));

  }, [invoice]);



  return (

    <div className="flex flex-col max-h-[90vh]">

      <div className="flex items-center justify-between p-3 border-b border-black/10">

        <div className="text-base font-semibold">Invoice {invoice.number}</div>

        <button className="text-xl leading-none px-2" aria-label="Close" onClick={onClose}>?</button>

      </div>



      <div className="p-3 border-b border-black/10 flex items-center gap-2">

        {!editing ? (

          <>

            <button className="text-sm underline" onClick={() => setEditing(true)}>Edit</button>

            {invoice.status==='Draft' && (<button className="text-sm underline" onClick={()=>alert('Already saved as draft')}>Save draft</button>)}

            <button className="text-sm underline" onClick={onDownload}>Download PDF</button>

            <button className="text-sm underline" onClick={onSendEmail}>Send email</button>

          </>

        ) : (

          <>

            <div className="flex flex-wrap items-center gap-3 w-full">

              <div className="text-sm text-slate-700">Totals: Subtotal <b>{fmtMoney(totals.subtotal, displayCurrency)}</b> · Tax <b>{fmtMoney(totals.tax, displayCurrency)}</b> · Total <b>{fmtMoney(totals.total, displayCurrency)}</b></div>

              <div className="ml-auto flex items-center gap-2">

                <button className="text-sm underline" onClick={async()=>{

                  await fetch('/api/company', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(company) });

                  await onSave({
                    data: {
                      ...(invoice.data || {}),
                      recipient: {
                        ...(invoice.data?.recipient || {}),
                        name: client.name,
                        vat: client.vat,
                        address: client.address,
                        city: client.city,
                        country: client.country,
                        email: client.email,
                        iban: (client as any).iban || '',
                        bankName: (client as any).bankName || '',
                        bic: (client as any).bic || '',
                      },
                      items: items.map(it=>({ description: it.desc, quantity: it.qty, rate: it.rate, tax: it.tax })),
                    },
                  });

                  setEditing(false);

                  await onRefresh(invoice.id);

                }}>Save</button>

                <button className="text-sm" onClick={()=>{ setEditing(false); }}>Cancel</button>

              </div>

            </div>

          </>

        )}

      </div>



      <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 110px)' }}>

        {!editing ? (

          <div className="max-w-[800px] mx-auto">

            <InvoiceA4

              currency={displayCurrency}

              items={items.map((it:any)=>({ desc: it.desc, qty: it.qty, rate: it.rate, tax: it.tax }))}

              subtotal={invoice.subtotal ?? totals.subtotal}

              taxTotal={invoice.tax ?? totals.tax}

              total={invoice.total ?? totals.total}

              sender={{ company: invoice.user?.company?.name || 'Company', vat: invoice.user?.company?.vat, address: invoice.user?.company?.address1, city: invoice.user?.company?.city, country: invoice.user?.company?.country, iban: invoice.user?.company?.iban, bankName: invoice.user?.company?.bankName, bic: invoice.user?.company?.bic }}

              client={{ name: invoice.client || displayRecipient.name || displayRecipient.company, vat: (displayRecipient?.vat as string) || undefined, address: (displayRecipient?.address as string) || undefined, city: (displayRecipient?.city as string) || undefined, country: (displayRecipient?.country as string) || undefined }}

              invoiceNo={invoice.number || invoiceData.documentNo}

              invoiceDate={displayDate}

              invoiceDue={''}

              notes={''}

            />

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">

            <div className="grid gap-2">

              <div className="text-sm font-semibold">Seller</div>

              <input className="rounded border px-2 py-1 text-sm" placeholder="Company name" value={company.name} onChange={(e)=>setCompany({ ...company, name: e.target.value })} />

              <div className="grid grid-cols-2 gap-2">

                <input className="rounded border px-2 py-1 text-sm" placeholder="VAT" value={company.vat} onChange={(e)=>setCompany({ ...company, vat: e.target.value })} />

                <input className="rounded border px-2 py-1 text-sm" placeholder="Reg" value={company.reg} onChange={(e)=>setCompany({ ...company, reg: e.target.value })} />

              </div>

              <input className="rounded border px-2 py-1 text-sm" placeholder="Address line" value={company.address1} onChange={(e)=>setCompany({ ...company, address1: e.target.value })} />

              <div className="grid grid-cols-2 gap-2">

                <input className="rounded border px-2 py-1 text-sm" placeholder="City" value={company.city} onChange={(e)=>setCompany({ ...company, city: e.target.value })} />

                <input className="rounded border px-2 py-1 text-sm" placeholder="Country" value={company.country} onChange={(e)=>setCompany({ ...company, country: e.target.value })} />

              </div>

              <div className="grid grid-cols-3 gap-2">

                <input className="rounded border px-2 py-1 text-sm" placeholder="IBAN" value={company.iban} onChange={(e)=>setCompany({ ...company, iban: e.target.value })} />

                <input className="rounded border px-2 py-1 text-sm" placeholder="Bank name" value={company.bankName} onChange={(e)=>setCompany({ ...company, bankName: e.target.value })} />

                <input className="rounded border px-2 py-1 text-sm" placeholder="SWIFT / BIC" value={company.bic} onChange={(e)=>setCompany({ ...company, bic: e.target.value })} />

              </div>

            </div>



            <div className="grid gap-2">

              <div className="text-sm font-semibold">Client</div>

              <input className="rounded border px-2 py-1 text-sm" placeholder="Client name" value={client.name} onChange={(e)=>setClient({ ...client, name: e.target.value })} />

              <input className="rounded border px-2 py-1 text-sm" placeholder="Email address" type="email" value={client.email} onChange={(e)=>setClient({ ...client, email: e.target.value })} />

              <div className="grid grid-cols-2 gap-2">

                <input className="rounded border px-2 py-1 text-sm" placeholder="VAT" value={client.vat} onChange={(e)=>setClient({ ...client, vat: e.target.value })} />

                <input className="rounded border px-2 py-1 text-sm" placeholder="City" value={client.city} onChange={(e)=>setClient({ ...client, city: e.target.value })} />

              </div>

              <input className="rounded border px-2 py-1 text-sm" placeholder="Address line" value={client.address} onChange={(e)=>setClient({ ...client, address: e.target.value })} />

              <input className="rounded border px-2 py-1 text-sm" placeholder="Country" value={client.country} onChange={(e)=>setClient({ ...client, country: e.target.value })} />

              <div className="text-xs text-slate-600 mt-2">Bank details (optional)</div>

              <div className="grid grid-cols-3 gap-2">

                <input className="rounded border px-2 py-1 text-sm" placeholder="IBAN" value={(client as any).iban || ''} onChange={(e)=>setClient({ ...(client as any), iban: e.target.value } as any)} />

                <input className="rounded border px-2 py-1 text-sm" placeholder="Bank name" value={(client as any).bankName || ''} onChange={(e)=>setClient({ ...(client as any), bankName: e.target.value } as any)} />

                <input className="rounded border px-2 py-1 text-sm" placeholder="SWIFT / BIC" value={(client as any).bic || ''} onChange={(e)=>setClient({ ...(client as any), bic: e.target.value } as any)} />

              </div>

            </div>



            <div className="grid gap-2">

              <div className="text-sm font-semibold">Items</div>

              <div className="grid gap-1">

                <div className="grid grid-cols-12 gap-1 text-[11px] text-slate-600">

                  <div className="col-span-6">Description</div>

                  <div className="col-span-2 text-right">Qty</div>

                  <div className="col-span-2 text-right">Rate</div>

                  <div className="col-span-2 text-right">Tax %</div>

                </div>

                {items.map((it, i) => (

                  <div key={i} className="grid grid-cols-12 gap-1">

                    <input className="col-span-6 rounded border px-2 py-1 text-sm" value={it.desc} onChange={(e)=>setItems(prev=>prev.map((p,idx)=> idx===i? { ...p, desc: e.target.value } : p))} />

                    <input className="col-span-2 rounded border px-2 py-1 text-sm text-right" type="text" inputMode="numeric" value={it.qty} onChange={(e)=>{ const v=(e.target.value||'').replace(/[^0-9]/g,''); setItems(prev=>prev.map((p,idx)=> idx===i? { ...p, qty: Number(v||0) } : p)); }} />

                    <input

                      className="col-span-2 rounded border px-2 py-1 text-sm text-right"

                      type="text"

                      inputMode="decimal"

                      value={rateInputs[i] ?? ''}

                      onChange={(e)=>{

                        const raw = e.target.value || '';

                        let s = raw.replace(',', '.').replace(/[^0-9.]/g, '');

                        const first = s.indexOf('.');

                        if (first !== -1) {

                          s = s.slice(0, first + 1) + s.slice(first + 1).replace(/\./g, '');

                          const parts = s.split('.');

                          const dec = parts[1] ?? '';

                          s = parts[0] + '.' + dec.slice(0, 2);

                          if (raw.endsWith('.') && dec.length === 0) s = parts[0] + '.';

                        }

                        setRateInputs(prev => prev.map((v, idx) => idx === i ? s : v));

                        const num = parseFloat(s);

                        const next = Number.isNaN(num) ? 0 : Math.round(num * 100) / 100;

                        setItems(prev=>prev.map((p,idx)=> idx===i? { ...p, rate: next } : p));

                      }}

                    />

                    <input className="col-span-2 rounded border px-2 py-1 text-sm text-right" type="number" value={it.tax} onChange={(e)=>setItems(prev=>prev.map((p,idx)=> idx===i? { ...p, tax: Number(e.target.value) } : p))} />

                  </div>

                ))}

                <button className="rounded border border-dashed border-black/20 text-sm py-1" onClick={(e)=>{ e.preventDefault(); setItems(prev=>[...prev, { desc: 'Service', qty: 1, rate: 100, tax: 0 }]); }}>+ Add row</button>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}










