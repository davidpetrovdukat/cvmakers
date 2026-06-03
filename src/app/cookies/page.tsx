import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';
import { getRequestLocale } from '@/i18n/server';

export const metadata = {
  title: 'Cookies Policy - CV Makers',
  description: 'Details on how CV Makers uses cookies and similar technologies.',
};

const SECTIONS = {
  en: [
    {
      id: 'overview',
      title: '1. Overview',
      body: 'This Cookies Policy explains how cv-makers.co.uk, operated by WORKING AGENT LTD, uses cookies and similar technologies such as localStorage, sessionStorage, pixels, and local identifiers. This Policy complements our Privacy Policy.',
    },
    {
      id: 'what-are-cookies',
      title: '2. What are cookies?',
      body: 'Cookies are small text files or browser entries placed on your device when you visit websites. They help the site function, keep you logged in, remember preferences, improve performance, and, with consent, support analytics and marketing.',
    },
    {
      id: 'categories',
      title: '3. Categories of cookies we use',
      body: 'Essential cookies support login, session management, and security. Functional cookies remember preferences such as language and UI settings. Performance cookies help us understand reliability and usage. Marketing cookies are used only with consent. Security cookies help detect suspicious activity and fraud.',
    },
    {
      id: 'consent',
      title: '4. Consent and lawful basis',
      body: 'Essential cookies are used because they are required for the Service to function. Non-essential cookies are set only after consent where required. Legal bases may include performance of contract, consent, and legitimate interests such as security and fraud prevention.',
    },
    {
      id: 'manage',
      title: '5. How to manage cookies',
      body: 'You can accept, decline, or customise non-essential cookies through the cookie banner or settings panel. You can also clear cookies through your browser. Disabling some cookies may reduce functionality.',
    },
    {
      id: 'contact',
      title: '6. Contact',
      body: 'Questions about cookies can be sent to info@cv-makers.co.uk. Registered office: WORKING AGENT LTD, Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF.',
    },
  ],
  tr: [
    {
      id: 'overview',
      title: '1. Genel bakış',
      body: 'Bu Çerez Politikası, WORKING AGENT LTD tarafından işletilen cv-makers.co.uk sitesinin çerezleri ve localStorage, sessionStorage, pikseller ve yerel tanımlayıcılar gibi benzer teknolojileri nasıl kullandığını açıklar. Bu Politika, Gizlilik Politikamızı tamamlar.',
    },
    {
      id: 'what-are-cookies',
      title: '2. Çerez nedir?',
      body: 'Çerezler, web sitelerini ziyaret ettiğinizde cihazınıza yerleştirilen küçük metin dosyaları veya tarayıcı kayıtlarıdır. Sitenin çalışmasına, oturumun açık kalmasına, tercihlerin hatırlanmasına, performansın iyileştirilmesine ve onayınızla analiz/pazarlama kullanımına yardımcı olur.',
    },
    {
      id: 'categories',
      title: '3. Kullandığımız çerez kategorileri',
      body: 'Zorunlu çerezler giriş, oturum yönetimi ve güvenliği destekler. İşlevsel çerezler dil ve arayüz tercihlerini hatırlar. Performans çerezleri güvenilirlik ve kullanım verilerini anlamamıza yardımcı olur. Pazarlama çerezleri yalnızca onayınızla kullanılır. Güvenlik çerezleri şüpheli aktivite ve dolandırıcılığı tespit etmeye yardımcı olur.',
    },
    {
      id: 'consent',
      title: '4. Onay ve hukuki dayanak',
      body: 'Zorunlu çerezler Hizmetin çalışması için gerekli olduğundan kullanılır. Zorunlu olmayan çerezler, gerektiğinde yalnızca onayınızdan sonra ayarlanır. Hukuki dayanaklar sözleşmenin ifası, onay ve güvenlik/dolandırıcılık önleme gibi meşru menfaatleri içerebilir.',
    },
    {
      id: 'manage',
      title: '5. Çerezleri nasıl yönetebilirsiniz?',
      body: 'Çerez bannerı veya ayarlar paneli üzerinden zorunlu olmayan çerezleri kabul edebilir, reddedebilir veya özelleştirebilirsiniz. Tarayıcınız üzerinden çerezleri temizleyebilirsiniz. Bazı çerezleri devre dışı bırakmak işlevselliği azaltabilir.',
    },
    {
      id: 'contact',
      title: '6. İletişim',
      body: 'Çerezlerle ilgili sorularınızı info@cv-makers.co.uk adresine gönderebilirsiniz. Kayıtlı ofis: WORKING AGENT LTD, Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF.',
    },
  ],
} satisfies Record<'en' | 'tr', PolicySection[]>;

export default async function CookiesPage() {
  const locale = await getRequestLocale();
  return (
    <PolicyPage
      title={locale === 'tr' ? 'Çerez Politikası' : 'Cookies Policy'}
      sections={SECTIONS[locale]}
      effectiveDate="06.10.2025"
      lastUpdated="06.10.2025"
      version="v1.0.6"
      helpEmail="info@cv-makers.co.uk"
      showRegionToggle={false}
    />
  );
}
