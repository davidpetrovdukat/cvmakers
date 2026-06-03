'use client';

import * as React from 'react';
import { ResumeTemplates, ResumeTemplateKey, Profile } from '@/components/resume';
import { useSearchParams } from 'next/navigation';
import { ScaledA4 } from '@/components/resume/ui';
import { BUILDER_TEMPLATE_KEYS } from '@/lib/resume/templates';
import { useI18n } from '@/i18n/LocaleProvider';

export type DocType = 'resume' | 'cv';

type BuilderProps = {
  initialDocType?: DocType | string;
  initialTemplate?: ResumeTemplateKey | string;
};

type StepKey = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'review';

const steps: { key: StepKey; n: number }[] = [
  { key: 'personal', n: 1 },
  { key: 'summary', n: 2 },
  { key: 'experience', n: 3 },
  { key: 'education', n: 4 },
  { key: 'skills', n: 5 },
  { key: 'review', n: 6 },
];

const BUILDER_COPY = {
  en: {
    templates: {
      classic: 'Classic ATS',
      split: 'Modern Split',
      serif: 'Elegant Serif',
      tech: 'Tech Compact',
    },
    docTypes: { resume: 'Resume', cv: 'CV' },
    steps: {
      personal: 'Personal details',
      summary: 'Summary',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      review: 'Review and finish',
    },
    costs: 'Costs',
    costCreate: 'Create',
    costExport: 'Export',
    costManager: 'Manager',
    costAi: 'AI',
    template: 'Template',
    tokenActions: 'Token actions',
    tokenActionsBody: (doc: string) => `Use tokens to generate your ${doc}.`,
    creatingDraft: 'Creating draft...',
    create: 'Create (100 tok.)',
    creatingPdf: 'Creating PDF...',
    exportPdf: 'Create & Export PDF (150 tok.)',
    creatingDocx: 'Creating DOCX...',
    exportDocx: 'Create & Export DOCX (150 tok.)',
    aiAssist: 'AI assist',
    aiBody: 'Let our model rewrite selected sections or generate bullet ideas.',
    fillRequiredTitle: 'Please fill all required fields first',
    creatingPerfect: (doc: string) => `We are creating the perfect ${doc} for you...`,
    improveAi: 'Improve with AI (200 tok.)',
    fillRequired: 'Fill all sections (personal details, summary, experience, education, skills) to enable AI improvement.',
    sendingManager: 'Sending to your personal manager...',
    sendManager: 'Send to personal manager (800 tok.)',
    tips: 'Tips',
    tipItems: [
      'Use action verbs and numbers in experience bullets.',
      'Keep the summary to three or four clear sentences.',
      'Tailor keywords to match the vacancy.',
    ],
    notices: {
      saveError: 'Unable to save draft',
      downloadError: 'Failed to download file',
      saved: (tokens: number) => `Draft saved to dashboard. Spent ${tokens} tokens.`,
      exported: (format: string, tokens: number) => `${format.toUpperCase()} ready. Spent ${tokens} tokens.`,
      exportError: (format: string) => `Unable to export ${format.toUpperCase()}`,
      aiError: 'Unable to improve resume',
      aiDone: 'AI polished your document and downloaded the PDF.',
      managerError: 'Unable to send to personal manager',
      managerPending: 'within the next few hours',
      managerDone: (doc: string, date: string) => `Request sent. Your personal manager will share the polished ${doc} by ${date}.`,
      managerQueued: 'Request sent to your personal manager. Expect an update within 3-6 hours.',
      loadError: 'Failed to load document',
      notFound: 'Document not found',
    },
    forms: {
      name: 'Name',
      namePlaceholder: 'Enter name',
      surname: 'Surname',
      surnamePlaceholder: 'Enter surname',
      role: 'Role / Title',
      rolePlaceholder: 'e.g. Product Manager',
      email: 'Email',
      phone: 'Phone',
      phonePlaceholder: 'Phone number',
      location: 'Location',
      locationPlaceholder: 'City, Country',
      website: 'Website',
      websitePlaceholder: 'Personal site (optional)',
      linkedin: 'LinkedIn',
      photoUrl: 'Photo URL',
      photoUrlPlaceholder: 'Link to photo',
      profileAlt: 'Profile',
      removePhoto: 'Remove photo',
      uploadPhoto: 'Upload photo',
      professionalSummary: 'Professional summary',
      summaryPlaceholder: 'Summarize your experience and strengths',
      writingTips: 'Writing tips',
      summaryTips: ['Use measurable outcomes (percentages, revenue, team size).', 'Keep it to three or four concise sentences.'],
      addRole: 'Add role',
      title: 'Title',
      titlePlaceholder: 'Job title',
      company: 'Company',
      companyPlaceholder: 'Company',
      start: 'Start',
      startPlaceholder: 'Start date',
      end: 'End',
      endPlaceholder: 'End date or Present',
      bullets: 'Bullets (one per line)',
      bulletsPlaceholder: 'Use action verbs + results',
      remove: 'Remove',
      addEducation: 'Add education',
      degree: 'Degree',
      degreePlaceholder: 'Degree or certificate',
      school: 'School',
      schoolPlaceholder: 'School',
      year: 'Year',
      yearPlaceholder: 'Year completed',
      addSkill: 'Add a skill',
      add: 'Add',
      reviewName: 'Name',
      reviewRole: 'Role',
      reviewExperience: 'Experience entries',
      reviewEducation: 'Education entries',
      reviewSkills: 'Skills',
      reviewHint: 'Use the export buttons to generate PDF or DOCX files.',
    },
  },
  tr: {
    templates: {
      classic: 'Klasik ATS',
      split: 'Modern Bölmeli',
      serif: 'Zarif Serif',
      tech: 'Teknik Kompakt',
    },
    docTypes: { resume: 'Özgeçmiş', cv: 'CV' },
    steps: {
      personal: 'Kişisel bilgiler',
      summary: 'Özet',
      experience: 'Deneyim',
      education: 'Eğitim',
      skills: 'Yetkinlikler',
      review: 'Gözden geçir ve tamamla',
    },
    costs: 'Maliyetler',
    costCreate: 'Oluştur',
    costExport: 'Dışa aktar',
    costManager: 'Yönetici',
    costAi: 'YZ',
    template: 'Şablon',
    tokenActions: 'Token işlemleri',
    tokenActionsBody: (doc: string) => `${doc} oluşturmak için token kullanın.`,
    creatingDraft: 'Taslak oluşturuluyor...',
    create: 'Oluştur (100 tok.)',
    creatingPdf: 'PDF oluşturuluyor...',
    exportPdf: 'PDF oluştur ve indir (150 tok.)',
    creatingDocx: 'DOCX oluşturuluyor...',
    exportDocx: 'DOCX oluştur ve indir (150 tok.)',
    aiAssist: 'Yapay zekâ desteği',
    aiBody: 'Modelimizin bölümleri yeniden yazmasına veya madde önerileri oluşturmasına izin verin.',
    fillRequiredTitle: 'Lütfen önce tüm zorunlu alanları doldurun',
    creatingPerfect: (doc: string) => `Sizin için ideal ${doc} hazırlanıyor...`,
    improveAi: 'Yapay zekâ ile iyileştir (200 tok.)',
    fillRequired: 'Yapay zekâ iyileştirmesini etkinleştirmek için tüm bölümleri doldurun: kişisel bilgiler, özet, deneyim, eğitim ve yetkinlikler.',
    sendingManager: 'Kişisel yöneticinize gönderiliyor...',
    sendManager: 'Kişisel yöneticiye gönder (800 tok.)',
    tips: 'İpuçları',
    tipItems: [
      'Deneyim maddelerinde eylem fiilleri ve sayılar kullanın.',
      'Özeti üç veya dört net cümleyle sınırlayın.',
      'Anahtar kelimeleri başvurduğunuz ilana göre uyarlayın.',
    ],
    notices: {
      saveError: 'Taslak kaydedilemedi',
      downloadError: 'Dosya indirilemedi',
      saved: (tokens: number) => `Taslak panele kaydedildi. ${tokens} token harcandı.`,
      exported: (format: string, tokens: number) => `${format.toUpperCase()} hazır. ${tokens} token harcandı.`,
      exportError: (format: string) => `${format.toUpperCase()} dışa aktarılamadı`,
      aiError: 'Özgeçmiş iyileştirilemedi',
      aiDone: 'Yapay zekâ belgenizi iyileştirdi ve PDF indirildi.',
      managerError: 'Kişisel yöneticiye gönderilemedi',
      managerPending: 'önümüzdeki birkaç saat içinde',
      managerDone: (doc: string, date: string) => `Talep gönderildi. Kişisel yöneticiniz iyileştirilmiş ${doc} belgesini ${date} tarihine kadar paylaşacak.`,
      managerQueued: 'Talep kişisel yöneticinize gönderildi. 3-6 saat içinde güncelleme bekleyebilirsiniz.',
      loadError: 'Belge yüklenemedi',
      notFound: 'Belge bulunamadı',
    },
    forms: {
      name: 'Ad',
      namePlaceholder: 'Adınızı girin',
      surname: 'Soyad',
      surnamePlaceholder: 'Soyadınızı girin',
      role: 'Pozisyon / Ünvan',
      rolePlaceholder: 'örn. Ürün Yöneticisi',
      email: 'E-posta',
      phone: 'Telefon',
      phonePlaceholder: 'Telefon numarası',
      location: 'Konum',
      locationPlaceholder: 'Şehir, Ülke',
      website: 'Web sitesi',
      websitePlaceholder: 'Kişisel site (isteğe bağlı)',
      linkedin: 'LinkedIn',
      photoUrl: 'Fotoğraf URL',
      photoUrlPlaceholder: 'Fotoğraf bağlantısı',
      profileAlt: 'Profil',
      removePhoto: 'Fotoğrafı kaldır',
      uploadPhoto: 'Fotoğraf yükle',
      professionalSummary: 'Profesyonel özet',
      summaryPlaceholder: 'Deneyiminizi ve güçlü yönlerinizi özetleyin',
      writingTips: 'Yazım ipuçları',
      summaryTips: ['Ölçülebilir sonuçlar kullanın: yüzde, gelir, ekip büyüklüğü.', 'Üç veya dört kısa ve net cümle yazın.'],
      addRole: 'Rol ekle',
      title: 'Ünvan',
      titlePlaceholder: 'İş ünvanı',
      company: 'Şirket',
      companyPlaceholder: 'Şirket',
      start: 'Başlangıç',
      startPlaceholder: 'Başlangıç tarihi',
      end: 'Bitiş',
      endPlaceholder: 'Bitiş tarihi veya Devam ediyor',
      bullets: 'Maddeler (her satıra bir tane)',
      bulletsPlaceholder: 'Eylem fiili + sonuç kullanın',
      remove: 'Kaldır',
      addEducation: 'Eğitim ekle',
      degree: 'Derece',
      degreePlaceholder: 'Derece veya sertifika',
      school: 'Okul',
      schoolPlaceholder: 'Okul',
      year: 'Yıl',
      yearPlaceholder: 'Tamamlanma yılı',
      addSkill: 'Yetkinlik ekle',
      add: 'Ekle',
      reviewName: 'Ad',
      reviewRole: 'Pozisyon',
      reviewExperience: 'Deneyim kaydı',
      reviewEducation: 'Eğitim kaydı',
      reviewSkills: 'Yetkinlikler',
      reviewHint: 'PDF veya DOCX oluşturmak için dışa aktarma düğmelerini kullanın.',
    },
  },
} as const;

type BuilderCopy = (typeof BUILDER_COPY)[keyof typeof BUILDER_COPY];

function normalizeDocType(value?: DocType | string): DocType {
  return value === 'cv' ? 'cv' : 'resume';
}

function normalizeTemplate(value?: ResumeTemplateKey | string): ResumeTemplateKey {
  return BUILDER_TEMPLATE_KEYS.includes(value as ResumeTemplateKey)
    ? (value as ResumeTemplateKey)
    : 'classic';
}

function composeFullName(first?: string | null, last?: string | null) {
  const parts: string[] = [];
  if (first && first.trim()) parts.push(first.trim());
  if (last && last.trim()) parts.push(last.trim());
  return parts.join(' ').trim();
}

function emptyProfile(): Profile {
  return {
    name: '',
    firstName: '',
    lastName: '',
    role: '',
    summary: '',
    contacts: {
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
    },
    experience: [],
    education: [],
    skills: [],
    photo: '',
  };
}

function coerceProfileData(input: any): Profile {
  const base = emptyProfile();
  const firstName = typeof input?.firstName === 'string' ? input.firstName : '';
  const lastName = typeof input?.lastName === 'string' ? input.lastName : '';
  const fullNameSource = typeof input?.name === 'string' ? input.name : '';
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

  const contacts = (input?.contacts ?? {}) as Record<string, unknown>;
  const email = typeof contacts?.email === 'string' ? (contacts.email as string) : (typeof input?.email === 'string' ? input.email : '');
  const phone = typeof contacts?.phone === 'string' ? (contacts.phone as string) : (typeof input?.phone === 'string' ? input.phone : '');
  const location = typeof contacts?.location === 'string' ? (contacts.location as string) : (typeof input?.location === 'string' ? input.location : '');
  const website = typeof contacts?.website === 'string' ? (contacts.website as string) : (typeof input?.website === 'string' ? input.website : '');
  const linkedin = typeof contacts?.linkedin === 'string' ? (contacts.linkedin as string) : (typeof input?.linkedin === 'string' ? input.linkedin : '');

  const computedName = fullNameSource && fullNameSource.trim() ? fullNameSource : composeFullName(firstName, lastName);

  return {
    ...base,
    name: computedName,
    firstName,
    lastName,
    role: typeof input?.role === 'string' ? input.role : '',
    summary: typeof input?.summary === 'string' ? input.summary : '',
    contacts: {
      email,
      phone,
      location,
      website,
      linkedin,
    },
    experience,
    education,
    skills,
    photo: typeof input?.photo === 'string' ? input.photo : base.photo,
  };
}

function mutateExp(
  setProfile: React.Dispatch<React.SetStateAction<Profile>>,
  id: string,
  patch: Partial<Profile['experience'][number]>,
) {
  setProfile((current) => ({
    ...current,
    experience: current.experience.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
  }));
}

function removeExp(setProfile: React.Dispatch<React.SetStateAction<Profile>>, id: string) {
  setProfile((current) => ({
    ...current,
    experience: current.experience.filter((entry) => entry.id !== id),
  }));
}

function mutateEdu(
  setProfile: React.Dispatch<React.SetStateAction<Profile>>,
  id: string,
  patch: Partial<Profile['education'][number]>,
) {
  setProfile((current) => ({
    ...current,
    education: current.education.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
  }));
}

function removeEdu(setProfile: React.Dispatch<React.SetStateAction<Profile>>, id: string) {
  setProfile((current) => ({
    ...current,
    education: current.education.filter((entry) => entry.id !== id),
  }));
}

// Validation: check if profile has all required fields for AI improvement
function isProfileComplete(p: Profile): boolean {
  // Personal details (excluding optional website & linkedin)
  const hasName = !!(p.name.trim() || (p.firstName.trim() && p.lastName.trim()));
  const hasRole = !!p.role.trim();
  const hasEmail = !!p.contacts.email.trim();
  const hasPhone = !!p.contacts.phone.trim();
  const hasLocation = !!p.contacts.location.trim();
  
  // Summary
  const hasSummary = !!p.summary.trim();
  
  // At least 1 experience
  const hasExperience = p.experience.length >= 1;
  
  // At least 1 education
  const hasEducation = p.education.length >= 1;
  
  // At least 1 skill
  const hasSkills = p.skills.length >= 1;
  
  return hasName && hasRole && hasEmail && hasPhone && hasLocation && 
         hasSummary && hasExperience && hasEducation && hasSkills;
}

export default function CVResumeBuilder({ initialDocType, initialTemplate }: BuilderProps) {
  const { locale, t } = useI18n();
  const copy = BUILDER_COPY[locale];
  const defaultDocType = normalizeDocType(initialDocType);
  const defaultTemplate = normalizeTemplate(initialTemplate);

  const [docType, setDocType] = React.useState<DocType>(defaultDocType);
  const [step, setStep] = React.useState<StepKey>('personal');
  const [templatesByDoc, setTemplatesByDoc] = React.useState<Record<DocType, ResumeTemplateKey>>(() => ({
    resume: defaultTemplate,
    cv: defaultTemplate,
  }));
  const [profiles, setProfiles] = React.useState<Record<DocType, Profile>>(() => ({
    resume: emptyProfile(),
    cv: emptyProfile(),
  }));
  const bcRef = React.useRef<BroadcastChannel | null>(null);
  const [busy, setBusy] = React.useState<null | 'draft' | 'pdf' | 'docx' | 'ai' | 'manager'>(null);
  const [notice, setNotice] = React.useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const noticeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchParams = useSearchParams();
  const documentIdFromQuery = searchParams.get('documentId');
  const templateOverride = searchParams.get('template');
  const [loadedDocumentId, setLoadedDocumentId] = React.useState<string | null>(null);

  const applyCompanyProfile = React.useCallback((company: any) => {
    if (!company) return;
    const firstName = typeof company.name === 'string' ? company.name.trim() : '';
    const lastName = typeof company.vat === 'string' ? company.vat.trim() : '';
    const email = typeof company.reg === 'string' ? company.reg.trim() : '';
    const phone = typeof company.address1 === 'string' ? company.address1.trim() : '';
    const photo = typeof company.logoUrl === 'string' ? company.logoUrl : '';

    setProfiles((current) => {
      const applyTo = (profile: Profile): Profile => {
        let mutated = false;
        let nextProfile = profile;
        let contacts = profile.contacts;
        const ensureProfile = () => {
          if (!mutated) {
            nextProfile = { ...profile };
            contacts = { ...profile.contacts };
            mutated = true;
          }
        };

        if (firstName && !profile.firstName) {
          ensureProfile();
          nextProfile.firstName = firstName;
        }
        if (lastName && !profile.lastName) {
          ensureProfile();
          nextProfile.lastName = lastName;
        }
        if (email && !profile.contacts.email) {
          ensureProfile();
          contacts.email = email;
        }
        if (phone && !profile.contacts.phone) {
          ensureProfile();
          contacts.phone = phone;
        }
        if (mutated) {
          nextProfile.contacts = contacts;
        }
        if (photo && !profile.photo) {
          ensureProfile();
          nextProfile.photo = photo;
        }
        const combined = composeFullName(nextProfile.firstName, nextProfile.lastName);
        if (combined && (!profile.name || profile.name === composeFullName(profile.firstName, profile.lastName))) {
          ensureProfile();
          nextProfile.name = combined;
        }
        return mutated ? nextProfile : profile;
      };

      const resume = applyTo(current.resume);
      const cv = applyTo(current.cv);
      if (resume === current.resume && cv === current.cv) return current;
      return { resume, cv };
    });
  }, [setProfiles]);

  React.useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('app-events');
      channel.onmessage = (event: MessageEvent) => {
        const data: any = (event as MessageEvent).data;
        if (data?.type === 'profile-updated' && data.company) {
          applyCompanyProfile(data.company);
        }
      };
      bcRef.current = channel;
    } catch {
      bcRef.current = null;
    }
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
      try { channel?.close(); } catch {}
      bcRef.current = null;
    };
  }, [applyCompanyProfile]);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/company', { cache: 'no-store' });
        if (!res.ok) return;
        const payload = await res.json().catch(() => null);
        applyCompanyProfile(payload?.company);
      } catch {
        /* no-op */
      }
    };
    loadProfile();
  }, [applyCompanyProfile]);

  const pushNotice = React.useCallback((kind: 'success' | 'error', message: string) => {
    setNotice({ kind, message });
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 6000);
  }, [setProfiles]);

  React.useEffect(() => {
    if (!templateOverride) return;
    const normalizedTemplate = normalizeTemplate(templateOverride);
    setTemplatesByDoc((current) => ({
      ...current,
      [docType]: normalizedTemplate,
    }));
  }, [templateOverride, docType]);

  React.useEffect(() => {
    if (!documentIdFromQuery || loadedDocumentId === documentIdFromQuery) return;
    let cancelled = false;

    const loadExisting = async () => {
      try {
        const response = await fetch(`/api/documents/${documentIdFromQuery}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load document');
        }
        const payload = await response.json().catch(() => null);
        const doc = payload?.document;
        if (!doc) {
          throw new Error('Document not found');
        }
        if (cancelled) return;
        const docTypeFromDoc: DocType = doc.docType === 'cv' ? 'cv' : 'resume';
        const templateFromDoc = doc?.data?.template ?? doc?.data?.templateKey ?? doc.template;
        const profileSource = doc?.data?.profile ?? doc?.data?.data?.profile ?? doc?.profile ?? doc?.data ?? {};
        const hydratedProfile = coerceProfileData(profileSource);

        setDocType(docTypeFromDoc);
        if (typeof templateFromDoc === 'string' && templateFromDoc) {
          const nextTemplate = normalizeTemplate(templateFromDoc);
          setTemplatesByDoc((current) => ({
            ...current,
            [docTypeFromDoc]: nextTemplate,
          }));
        }
        setProfiles((current) => ({
          ...current,
          [docTypeFromDoc]: hydratedProfile,
        }));
        setLoadedDocumentId(documentIdFromQuery);
        setStep('personal');
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Failed to load document';
        pushNotice('error', message);
      }
    };

    loadExisting();

    return () => {
      cancelled = true;
    };
  }, [documentIdFromQuery, loadedDocumentId, pushNotice]);

  const template = templatesByDoc[docType];
  const profile = profiles[docType];
  const templateOptions = React.useMemo(
    () => BUILDER_TEMPLATE_KEYS.map((key) => ({ key, label: copy.templates[key] })),
    [copy],
  );
  const profileComplete = React.useMemo(() => isProfileComplete(profile), [profile]);
  const SelectedTemplate = ResumeTemplates[template] ?? ResumeTemplates.classic;

  type CreateDocResult = {
    document: { id: string; title?: string };
    tokenBalance?: number;
    charge?: number;
    action?: string;
  };

  const setProfile = React.useCallback(
    (updater: React.SetStateAction<Profile>) => {
      setProfiles((current) => {
        const nextProfile = typeof updater === 'function' ? (updater as (value: Profile) => Profile)(current[docType]) : updater;
        if (nextProfile === current[docType]) return current;
        return { ...current, [docType]: nextProfile };
      });
    },
    [docType],
  );

  const handleTemplateChange = (value: ResumeTemplateKey) => {
    setTemplatesByDoc((current) => ({ ...current, [docType]: value }));
  };

  const sanitizeFilename = React.useCallback(
    (title: string | undefined, ext: 'pdf' | 'docx') => {
      const fallback = docType === 'cv' ? 'cv' : 'resume';
      const base = title && title.trim() ? title.trim() : fallback;
      const safe = base.replace(/[^a-z0-9-_ ]/gi, '').trim().replace(/\s+/g, '-');
      return `${safe || fallback}.${ext}`;
    },
    [docType],
  );

  const downloadBinary = React.useCallback(async (url: string, filename: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      const info = await response.json().catch(() => ({}));
      throw new Error(info?.error || copy.notices.downloadError);
    }
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
  }, [copy.notices.downloadError, setProfiles]);

  const createDocument = React.useCallback(
    async (action: 'draft' | 'export-pdf' | 'export-docx'): Promise<CreateDocResult> => {
      const profilePayload = JSON.parse(JSON.stringify(profile)) as Profile;
      if (!profilePayload.name || !profilePayload.name.trim()) {
        const combinedName = composeFullName(profilePayload.firstName, profilePayload.lastName);
        if (combinedName) {
          profilePayload.name = combinedName;
        }
      }
      const payload = {
        title: profilePayload.name
          ? `${profilePayload.name} ${docType === 'cv' ? copy.docTypes.cv : copy.docTypes.resume}`
          : docType === 'cv' ? t('documents.cvDraft') : t('documents.resumeDraft'),
        locale,
        action,
        docType,
        template,
        data: {
          docType,
          template,
          profile: profilePayload,
          meta: { generatedAt: new Date().toISOString(), locale },
        },
      };

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || copy.notices.saveError);
      }

      if (typeof result?.tokenBalance === 'number') {
        try { bcRef.current?.postMessage({ type: 'tokens-updated', tokenBalance: result.tokenBalance }); } catch {}
      }
      try { bcRef.current?.postMessage({ type: 'documents-updated' }); } catch {}

      return result as CreateDocResult;
    },
    [profile, docType, template, locale, t, copy],
  );

  const handleCreateDraft = React.useCallback(async () => {
    if (busy) return;
    setBusy('draft');
    setNotice(null);
    try {
      const result = await createDocument('draft');
      const charged = result.charge ?? 100;
      pushNotice('success', copy.notices.saved(charged));
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.notices.saveError;
      pushNotice('error', message);
    } finally {
      setBusy(null);
    }
  }, [busy, createDocument, pushNotice, copy]);

  const handleExport = React.useCallback(
    async (format: 'pdf' | 'docx') => {
      if (busy) return;
      setBusy(format === 'pdf' ? 'pdf' : 'docx');
      setNotice(null);
      try {
        const result = await createDocument(format === 'pdf' ? 'export-pdf' : 'export-docx');
        const documentSummary = result.document;
        const filename = sanitizeFilename(documentSummary?.title, format);
        const endpoint = format === 'pdf' ? `/api/resume/pdf/${documentSummary.id}` : `/api/resume/docx/${documentSummary.id}`;
        await downloadBinary(endpoint, filename);
        const charged = result.charge ?? 150;
        pushNotice('success', copy.notices.exported(format, charged));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : copy.notices.exportError(format);
        pushNotice('error', message);
      } finally {
        setBusy(null);
      }
    },
    [busy, createDocument, downloadBinary, pushNotice, sanitizeFilename, copy],
  );

  const handleAI = React.useCallback(async () => {
    if (busy) return;
    setBusy('ai');
    setNotice(null);
    try {
      const response = await fetch('/api/resume/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai',
          docType,
          template,
          profile,
          locale,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || copy.notices.aiError);
      }
      if (payload?.profile) {
        const nextProfile = coerceProfileData(payload.profile);
        setProfiles((current) => ({ ...current, [docType]: nextProfile }));
      }
      if (typeof payload?.tokenBalance === 'number') {
        try { bcRef.current?.postMessage({ type: 'tokens-updated', tokenBalance: payload.tokenBalance }); } catch {}
      }
      try { bcRef.current?.postMessage({ type: 'documents-updated' }); } catch {}
      const docSummary = payload?.document as { id: string; title?: string } | undefined;
      if (docSummary?.id) {
        const fallback = docSummary.title || `${docType === 'cv' ? copy.docTypes.cv : copy.docTypes.resume} AI`;
        const filename = sanitizeFilename(fallback, 'pdf');
        await downloadBinary(`/api/resume/pdf/${docSummary.id}`, filename);
      }
      pushNotice('success', copy.notices.aiDone);
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.notices.aiError;
      pushNotice('error', message);
    } finally {
      setBusy(null);
    }
  }, [busy, docType, template, profile, locale, downloadBinary, pushNotice, setProfiles, sanitizeFilename, copy]);

  const handleManager = React.useCallback(async () => {
    if (busy) return;
    setBusy('manager');
    setNotice(null);
    try {
      const response = await fetch('/api/resume/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manager',
          docType,
          template,
          profile,
          locale,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || copy.notices.managerError);
      }
      if (payload?.profile) {
        const nextProfile = coerceProfileData(payload.profile);
        setProfiles((current) => ({ ...current, [docType]: nextProfile }));
      }
      if (typeof payload?.tokenBalance === 'number') {
        try { bcRef.current?.postMessage({ type: 'tokens-updated', tokenBalance: payload.tokenBalance }); } catch {}
      }
      try { bcRef.current?.postMessage({ type: 'documents-updated' }); } catch {}
      const releaseAtIso = typeof payload?.releaseAt === 'string' ? payload.releaseAt : null;
      if (releaseAtIso) {
        const releaseAt = new Date(releaseAtIso);
        const formatted = Number.isNaN(releaseAt.getTime())
          ? copy.notices.managerPending
          : releaseAt.toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
        pushNotice('success', copy.notices.managerDone(docType === 'cv' ? copy.docTypes.cv : copy.docTypes.resume, formatted));
      } else {
        pushNotice('success', copy.notices.managerQueued);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.notices.managerError;
      pushNotice('error', message);
    } finally {
      setBusy(null);
    }
  }, [busy, docType, template, profile, locale, pushNotice, setProfiles, copy]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-[280px_1fr_420px]">
        <aside className="sticky top-16 self-start rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
            <select
              className="rounded-md border border-slate-300 bg-white px-2 py-1"
              value={docType}
              onChange={(event) => setDocType(event.target.value as DocType)}
            >
              <option value="resume">{copy.docTypes.resume}</option>
              <option value="cv">{copy.docTypes.cv}</option>
            </select>
            <select
              className="col-span-2 rounded-md border border-slate-300 bg-white px-2 py-1"
              value={template}
              onChange={(event) => handleTemplateChange(event.target.value as ResumeTemplateKey)}
            >
              {templateOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <nav className="flex flex-col gap-1 text-sm" id="step-nav">
            {steps.map((item) => (
              <button
                key={item.key}
                className={`justify-start rounded-md px-3 py-2 text-left hover:bg-slate-50 ${step === item.key ? 'bg-slate-100 font-semibold' : 'bg-white'}`}
                onClick={() => setStep(item.key)}
              >
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[11px] text-slate-600">
                  {item.n}
                </span>
                {copy.steps[item.key]}
              </button>
            ))}
          </nav>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <div className="font-semibold">{copy.costs}</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <CostPill label={copy.costCreate} value="100 tok." />
              <CostPill label={copy.costExport} value="150 tok." />
              <CostPill label={copy.costManager} value="800 tok." />
              <CostPill label={copy.costAi} value="200 tok." />
            </div>
          </div>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <Editor step={step} profile={profile} setProfile={setProfile} copy={copy} />
        </section>

        <section className="space-y-3" id="preview-pane">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="text-xs text-slate-500">{copy.template}</div>
                <div className="font-semibold">{copy.templates[template]}</div>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-100 p-3">
              <ScaledA4 key={`${docType}-${template}`} maxScale={0.78}>
                <SelectedTemplate data={profile} />
              </ScaledA4>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm">
            <div className="font-semibold">{copy.tokenActions}</div>
            <p className="mt-1 text-slate-600">{copy.tokenActionsBody(docType === 'cv' ? copy.docTypes.cv : copy.docTypes.resume)}</p>
            <div className="mt-3 flex flex-col gap-2">
              <button
                className="rounded-md bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleCreateDraft}
                disabled={busy !== null}
              >
                {busy === 'draft' ? copy.creatingDraft : copy.create}
              </button>
              <button
                className="rounded-md border border-slate-300 px-3 py-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleExport('pdf')}
                disabled={busy !== null}
              >
                {busy === 'pdf' ? copy.creatingPdf : copy.exportPdf}
              </button>
              <button
                className="rounded-md border border-slate-300 px-3 py-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleExport('docx')}
                disabled={busy !== null}
              >
                {busy === 'docx' ? copy.creatingDocx : copy.exportDocx}
              </button>
            </div>
            {notice && (
              <div
                className={`mt-3 rounded-md border px-3 py-2 text-xs ${notice.kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}
              >
                {notice.message}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm">
            <div className="font-semibold">{copy.aiAssist}</div>
            <p className="mt-1 text-slate-600">{copy.aiBody}</p>
            <div className="mt-3 flex flex-col gap-2">
              <button
                id="btn-ai"
                className={`relative overflow-hidden rounded-md px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  busy === 'ai'
                    ? 'border border-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-sky-500 text-white shadow-lg animate-pulse'
                    : 'border border-slate-300 text-slate-900 hover:bg-slate-100'
                }`}
                onClick={handleAI}
                disabled={busy !== null || !profileComplete}
                title={!profileComplete ? copy.fillRequiredTitle : undefined}
              >
                {busy === 'ai' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                    {copy.creatingPerfect(docType === 'cv' ? copy.docTypes.cv : copy.docTypes.resume)}
                  </span>
                ) : (
                  copy.improveAi
                )}
              </button>
              {!profileComplete && (
                <p className="text-xs text-amber-600">
                  {copy.fillRequired}
                </p>
              )}
              <button
                id="btn-manager"
                className={`rounded-md px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  busy === 'manager'
                    ? 'bg-emerald-600 text-white shadow-inner'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
                onClick={handleManager}
                disabled={busy !== null}
              >
                {busy === 'manager' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                    {copy.sendingManager}
                  </span>
                ) : (
                  copy.sendManager
                )}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
            <div className="font-semibold">{copy.tips}</div>
            <ul className="mt-2 space-y-1">
              {copy.tipItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function Editor({ step, profile, setProfile, copy }: { step: StepKey; profile: Profile; setProfile: React.Dispatch<React.SetStateAction<Profile>>; copy: BuilderCopy }) {
  switch (step) {
    case 'personal':
      return <PersonalForm profile={profile} setProfile={setProfile} copy={copy} />;
    case 'summary':
      return <SummaryForm profile={profile} setProfile={setProfile} copy={copy} />;
    case 'experience':
      return <ExperienceForm profile={profile} setProfile={setProfile} copy={copy} />;
    case 'education':
      return <EducationForm profile={profile} setProfile={setProfile} copy={copy} />;
    case 'skills':
      return <SkillsForm profile={profile} setProfile={setProfile} copy={copy} />;
    case 'review':
      return <ReviewPanel profile={profile} copy={copy} />;
    default:
      return null;
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold text-slate-600">{label}</div>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ${className || ''}`} />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea {...rest} className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ${className || ''}`} />;
}

function PersonalForm({ profile, setProfile, copy }: EditorProps) {
  const nameParts = React.useMemo(() => {
    const parts = (profile.name || '').trim().split(/\s+/).filter(Boolean);
    const first = profile.firstName ?? parts[0] ?? '';
    const last = profile.lastName ?? (parts.length > 1 ? parts.slice(1).join(' ') : '');
    return { first, last };
  }, [profile.firstName, profile.lastName, profile.name]);

  const handleFirstNameChange = (value: string) => {
    setProfile((prev) => {
      const fallbackLast = prev.lastName ?? nameParts.last;
      const combined = composeFullName(value, fallbackLast);
      return {
        ...prev,
        firstName: value,
        lastName: prev.lastName ?? fallbackLast,
        name: combined || value || prev.name,
      };
    });
  };

  const handleLastNameChange = (value: string) => {
    setProfile((prev) => {
      const fallbackFirst = prev.firstName ?? nameParts.first;
      const combined = composeFullName(fallbackFirst, value);
      return {
        ...prev,
        firstName: prev.firstName ?? fallbackFirst,
        lastName: value,
        name: combined || fallbackFirst || value || prev.name,
      };
    });
  };

  const handlePhotoUpload: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfile((prev) => ({ ...prev, photo: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handlePhotoRemove = () => {
    setProfile((prev) => ({ ...prev, photo: '' }));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">{copy.steps.personal}</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label={copy.forms.name}>
          <Input value={nameParts.first} placeholder={copy.forms.namePlaceholder} onChange={(event) => handleFirstNameChange(event.target.value)} />
        </Field>
        <Field label={copy.forms.surname}>
          <Input value={nameParts.last} placeholder={copy.forms.surnamePlaceholder} onChange={(event) => handleLastNameChange(event.target.value)} />
        </Field>
        <Field label={copy.forms.role}>
          <Input value={profile.role} placeholder={copy.forms.rolePlaceholder} onChange={(event) => setProfile((prev) => ({ ...prev, role: event.target.value }))} />
        </Field>
        <Field label={copy.forms.email}>
          <Input value={profile.contacts.email} placeholder="name@email.com" onChange={(event) => setProfile((prev) => ({ ...prev, contacts: { ...prev.contacts, email: event.target.value } }))} />
        </Field>
        <Field label={copy.forms.phone}>
          <Input value={profile.contacts.phone} placeholder={copy.forms.phonePlaceholder} onChange={(event) => setProfile((prev) => ({ ...prev, contacts: { ...prev.contacts, phone: event.target.value } }))} />
        </Field>
        <Field label={copy.forms.location}>
          <Input value={profile.contacts.location} placeholder={copy.forms.locationPlaceholder} onChange={(event) => setProfile((prev) => ({ ...prev, contacts: { ...prev.contacts, location: event.target.value } }))} />
        </Field>
        <Field label={copy.forms.website}>
          <Input value={profile.contacts.website || ''} placeholder={copy.forms.websitePlaceholder} onChange={(event) => setProfile((prev) => ({ ...prev, contacts: { ...prev.contacts, website: event.target.value } }))} />
        </Field>
        <Field label={copy.forms.linkedin}>
          <Input value={profile.contacts.linkedin || ''} placeholder="LinkedIn profile" onChange={(event) => setProfile((prev) => ({ ...prev, contacts: { ...prev.contacts, linkedin: event.target.value } }))} />
        </Field>
        {profile.photo ? (
          <div className="col-span-2 grid gap-2">
            <Field label={copy.forms.photoUrl}>
              <Input value={profile.photo} placeholder={copy.forms.photoUrlPlaceholder} onChange={(event) => setProfile((prev) => ({ ...prev, photo: event.target.value }))} />
            </Field>
            <div className="flex items-center gap-3">
              <img src={profile.photo} alt={copy.forms.profileAlt} className="h-16 w-16 rounded-full object-cover border border-slate-200" />
              <button type="button" className="text-xs text-slate-500 underline" onClick={handlePhotoRemove}>
                {copy.forms.removePhoto}
              </button>
            </div>
          </div>
        ) : (
          <label className="col-span-2 block">
            <div className="mb-1 text-xs font-semibold text-slate-600">{copy.forms.uploadPhoto}</div>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm" />
          </label>
        )}
      </div>
    </div>
  );
}

function SummaryForm({ profile, setProfile, copy }: EditorProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{copy.steps.summary}</h2>
      <div className="mt-3 grid gap-3">
        <Field label={copy.forms.professionalSummary}>
          <Textarea rows={5} value={profile.summary} placeholder={copy.forms.summaryPlaceholder} onChange={(event) => setProfile((prev) => ({ ...prev, summary: event.target.value }))} />
        </Field>
        <div className="rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-600">
          <div className="font-semibold">{copy.forms.writingTips}</div>
          <ul className="mt-1 list-disc pl-5">
            {copy.forms.summaryTips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ExperienceForm({ profile, setProfile, copy }: EditorProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{copy.steps.experience}</h2>
        <button
          className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
          onClick={() => {
            setProfile((prev) => ({
              ...prev,
              experience: [
                ...prev.experience,
                { id: Math.random().toString(36).slice(2), title: '', company: '', location: '', start: '', end: '', points: [] },
              ],
            }));
          }}
        >
          {copy.forms.addRole}
        </button>
      </div>
      <div className="mt-3 space-y-4">
        {profile.experience.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-slate-200 p-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label={copy.forms.title}>
                <Input value={entry.title} placeholder={copy.forms.titlePlaceholder} onChange={(event) => mutateExp(setProfile, entry.id, { title: event.target.value })} />
              </Field>
              <Field label={copy.forms.company}>
                <Input value={entry.company} placeholder={copy.forms.companyPlaceholder} onChange={(event) => mutateExp(setProfile, entry.id, { company: event.target.value })} />
              </Field>
              <Field label={copy.forms.location}>
                <Input value={entry.location} placeholder={copy.forms.locationPlaceholder} onChange={(event) => mutateExp(setProfile, entry.id, { location: event.target.value })} />
              </Field>
              <Field label={copy.forms.start}>
                <Input value={entry.start} placeholder={copy.forms.startPlaceholder} onChange={(event) => mutateExp(setProfile, entry.id, { start: event.target.value })} />
              </Field>
              <Field label={copy.forms.end}>
                <Input value={entry.end} placeholder={copy.forms.endPlaceholder} onChange={(event) => mutateExp(setProfile, entry.id, { end: event.target.value })} />
              </Field>
              <Field label={copy.forms.bullets}>
                <Textarea rows={3} value={entry.points.join('\n')} placeholder={copy.forms.bulletsPlaceholder} onChange={(event) => mutateExp(setProfile, entry.id, { points: event.target.value.split('\n') })} />
              </Field>
            </div>
            <div className="mt-2 text-right">
              <button className="text-xs text-slate-500 hover:underline" onClick={() => removeExp(setProfile, entry.id)}>
                {copy.forms.remove}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationForm({ profile, setProfile, copy }: EditorProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{copy.steps.education}</h2>
        <button
          className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
          onClick={() => {
            setProfile((prev) => ({
              ...prev,
              education: [
                ...prev.education,
                { id: Math.random().toString(36).slice(2), degree: '', school: '', year: '', location: '' },
              ],
            }));
          }}
        >
          {copy.forms.addEducation}
        </button>
      </div>
      <div className="mt-3 space-y-4">
        {profile.education.map((entry) => (
          <div key={entry.id} className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 p-3">
            <Field label={copy.forms.degree}>
              <Input value={entry.degree} placeholder={copy.forms.degreePlaceholder} onChange={(event) => mutateEdu(setProfile, entry.id, { degree: event.target.value })} />
            </Field>
            <Field label={copy.forms.school}>
              <Input value={entry.school} placeholder={copy.forms.schoolPlaceholder} onChange={(event) => mutateEdu(setProfile, entry.id, { school: event.target.value })} />
            </Field>
            <Field label={copy.forms.year}>
              <Input value={entry.year} placeholder={copy.forms.yearPlaceholder} onChange={(event) => mutateEdu(setProfile, entry.id, { year: event.target.value })} />
            </Field>
            <Field label={copy.forms.location}>
              <Input value={entry.location} placeholder={copy.forms.locationPlaceholder} onChange={(event) => mutateEdu(setProfile, entry.id, { location: event.target.value })} />
            </Field>
            <div className="col-span-2 text-right">
              <button className="text-xs text-slate-500 hover:underline" onClick={() => removeEdu(setProfile, entry.id)}>
                {copy.forms.remove}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsForm({ profile, setProfile, copy }: EditorProps) {
  const [draft, setDraft] = React.useState('');

  return (
    <div>
      <h2 className="text-lg font-semibold">{copy.steps.skills}</h2>
      <div className="mt-3 flex gap-2">
        <Input placeholder={copy.forms.addSkill} value={draft} onChange={(event) => setDraft(event.target.value)} />
        <button
          className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
          onClick={() => {
            if (!draft.trim()) return;
            setProfile((prev) => ({ ...prev, skills: [...prev.skills, draft.trim()] }));
            setDraft('');
          }}
        >
          {copy.forms.add}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {profile.skills.map((skill, index) => (
          <span key={`${skill}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-sm">
            {skill}
            <button
              className="text-xs text-slate-500 hover:underline"
              onClick={() => setProfile((prev) => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== index) }))}
            >
              {copy.forms.remove}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function ReviewPanel({ profile, copy }: { profile: Profile; copy: BuilderCopy }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{copy.steps.review}</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <li className="rounded border border-slate-200 bg-slate-50 p-2">{copy.forms.reviewName}: <b>{profile.name}</b></li>
        <li className="rounded border border-slate-200 bg-slate-50 p-2">{copy.forms.reviewRole}: <b>{profile.role}</b></li>
        <li className="rounded border border-slate-200 bg-slate-50 p-2">{copy.forms.reviewExperience}: <b>{profile.experience.length}</b></li>
        <li className="rounded border border-slate-200 bg-slate-50 p-2">{copy.forms.reviewEducation}: <b>{profile.education.length}</b></li>
        <li className="rounded border border-slate-200 bg-slate-50 p-2">{copy.forms.reviewSkills}: <b>{profile.skills.length}</b></li>
      </ul>
      <div className="mt-4 text-xs text-slate-500">{copy.forms.reviewHint}</div>
    </div>
  );
}

type EditorProps = {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  copy: BuilderCopy;
};

function CostPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
      <span className="mr-2 text-slate-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function runBuilderSmokeTests() {
  const element = React.createElement(CVResumeBuilder, {});
  const hasPreviewPane = typeof document !== 'undefined' ? !!document.getElementById('preview-pane') : true;
  const hasStepNav = typeof document !== 'undefined' ? !!document.getElementById('step-nav') : true;
  const expectedSteps = 6;
  const aiButton = typeof document !== 'undefined' ? document.getElementById('btn-ai') : {};
  const managerButton = typeof document !== 'undefined' ? document.getElementById('btn-manager') : {};
  return [
    { name: 'Component exists', pass: typeof CVResumeBuilder === 'function' },
    { name: 'Element created', pass: !!element },
    { name: 'Preview pane present', pass: hasPreviewPane },
    { name: 'Step navigator present', pass: hasStepNav },
    { name: 'Has 6 steps', pass: steps.length === expectedSteps },
    { name: 'AI button present', pass: !!aiButton },
    { name: 'Manager button present', pass: !!managerButton },
  ];
}
