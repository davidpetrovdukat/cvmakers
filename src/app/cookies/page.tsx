import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';
import { getRequestLocale } from '@/i18n/server';
import { Locale } from '@/i18n/config';

export const metadata = {
  title: 'Cookies Policy - CV Makers',
  description: 'Details on how CV Makers uses cookies and similar technologies.',
};

const PAGE_TITLES: Record<Locale, string> = {
  en: 'Cookies Policy',
  tr: 'Çerez Politikası',
  ja: 'クッキーポリシー',
};

const SECTIONS: Record<Locale, PolicySection[]> = {
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
  ja: [
    {
      id: 'overview',
      title: '1. 概要',
      body: '本クッキーポリシーは、WORKING AGENT LTDが運営するcv-makers.co.ukにおける、クッキーおよびlocalStorage、sessionStorage、ピクセル、ローカル識別子などの類似技術の利用について説明するものです。本ポリシーは、プライバシーポリシーを補完するものです。',
    },
    {
      id: 'what-are-cookies',
      title: '2. クッキーとは',
      body: 'クッキーとは、ウェブサイトを訪問した際にお客様のデバイスに保存される小さなテキストファイルまたはブラウザ上の記録です。サイトの機能維持、ログイン状態の保持、設定の記憶、パフォーマンスの向上、ならびに同意を得た場合の分析およびマーケティングに使用されます。',
    },
    {
      id: 'categories',
      title: '3. 使用するクッキーの種類',
      body: '必須クッキーは、ログイン、セッション管理、セキュリティを支えます。機能クッキーは、言語やUI設定などの設定を記憶します。パフォーマンスクッキーは、信頼性および利用状況の把握に役立ちます。マーケティングクッキーは、同意を得た場合にのみ使用します。セキュリティクッキーは、不審な行動や不正の検知に役立ちます。',
    },
    {
      id: 'consent',
      title: '4. 同意および法的根拠',
      body: '必須クッキーは、サービスの運営に必要であるため使用されます。必須ではないクッキーは、必要な場合には同意を得た後にのみ設定されます。法的根拠には、契約の履行、同意、ならびにセキュリティおよび不正防止などの正当な利益が含まれる場合があります。',
    },
    {
      id: 'manage',
      title: '5. クッキーの管理方法',
      body: 'クッキーバナーまたは設定パネルから、必須ではないクッキーの受け入れ、拒否、またはカスタマイズができます。ブラウザからクッキーを削除することも可能です。一部のクッキーを無効にすると、機能が制限される場合があります。',
    },
    {
      id: 'contact',
      title: '6. お問い合わせ',
      body: 'クッキーに関するご質問は、info@cv-makers.co.ukまでお送りください。Registered office: WORKING AGENT LTD, Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF.',
    },
  ],
};

export default async function CookiesPage() {
  const locale = await getRequestLocale();
  return (
    <PolicyPage
      title={PAGE_TITLES[locale]}
      sections={SECTIONS[locale]}
      effectiveDate="06.10.2025"
      lastUpdated="06.10.2025"
      version="v1.0.6"
      helpEmail="info@cv-makers.co.uk"
      showRegionToggle={false}
    />
  );
}
