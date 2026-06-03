import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';
import { getRequestLocale } from '@/i18n/server';

export const metadata = {
  title: 'Privacy Policy - CV Makers',
  description: 'How CV Makers collects, uses, and protects personal data.',
};

const SECTIONS = {
  en: [
    { id: 'introduction', title: '1. Introduction', body: 'We respect your privacy and handle personal data responsibly. This Policy explains what data we collect, why we process it, how long we retain it, who we may share it with, and how you can exercise your rights in connection with cv-makers.co.uk, operated by WORKING AGENT LTD.' },
    { id: 'data', title: '2. What personal data we collect', body: 'We collect only the personal data necessary to provide and improve our services, including identity and contact details, transaction and order data, account data, usage and technical data, CV/resume content, support messages, and information you choose to provide.' },
    { id: 'legal-bases', title: '3. Why we process your data', body: 'We process personal data to provide the Service, process payments, prevent fraud, handle support and refunds, meet legal obligations, improve security and reliability, and send marketing communications only where permitted.' },
    { id: 'sharing', title: '4. Sharing and international transfers', body: 'We may share personal data with trusted providers such as payment processors, hosting providers, analytics and monitoring tools, support tools, professional advisers, regulators, or law enforcement where required. International transfers use appropriate safeguards.' },
    { id: 'cookies', title: '5. Cookies and similar technologies', body: 'We use cookies and similar technologies for essential functions, security, analytics, and, with consent, marketing. See our Cookie Policy for details.' },
    { id: 'retention', title: '6. Retention', body: 'We retain personal data only as long as necessary for the stated purposes and legal obligations. Order and payment records may be kept for accounting and dispute purposes. Drafts and generated files are retained while needed to provide the Service or while saved in your account.' },
    { id: 'rights', title: '7. Your rights', body: 'You may request access, correction, deletion, restriction, portability, object to certain processing, and withdraw consent where applicable. Contact info@cv-makers.co.uk to exercise your rights.' },
    { id: 'security', title: '8. Security measures', body: 'We use reasonable technical and organisational safeguards, including encryption in transit, access controls, secure backups, monitoring, and staff training.' },
    { id: 'changes', title: '9. Changes to this Policy', body: 'We may update this Privacy Policy from time to time. Significant changes will be communicated via email or prominent notice where appropriate.' },
    { id: 'contact', title: '10. Contact & complaints', body: 'For privacy questions or requests, contact info@cv-makers.co.uk. If you are not satisfied, you may lodge a complaint with the UK Information Commissioner’s Office (ICO).' },
    { id: 'company-details', title: 'Company details', body: 'WORKING AGENT LTD\nCompany number: 15957326\nRegistered office: Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF\nEmail: info@cv-makers.co.uk' },
  ],
  tr: [
    { id: 'introduction', title: '1. Giriş', body: 'Gizliliğinize saygı duyuyor ve kişisel verileri sorumlu şekilde işliyoruz. Bu Politika, WORKING AGENT LTD tarafından işletilen cv-makers.co.uk ile bağlantılı olarak hangi verileri topladığımızı, neden işlediğimizi, ne kadar süre sakladığımızı, kimlerle paylaşabileceğimizi ve haklarınızı nasıl kullanabileceğinizi açıklar.' },
    { id: 'data', title: '2. Topladığımız kişisel veriler', body: 'Hizmetleri sağlamak ve iyileştirmek için gerekli kişisel verileri toplarız. Bunlar kimlik ve iletişim bilgileri, işlem ve sipariş verileri, hesap verileri, kullanım ve teknik veriler, CV/özgeçmiş içeriği, destek mesajları ve sizin sağlamayı seçtiğiniz bilgileri içerebilir.' },
    { id: 'legal-bases', title: '3. Verilerinizi neden işleriz?', body: 'Kişisel verileri Hizmeti sağlamak, ödemeleri işlemek, dolandırıcılığı önlemek, destek ve iadeleri yönetmek, yasal yükümlülükleri yerine getirmek, güvenlik ve güvenilirliği iyileştirmek ve yalnızca izin verilen durumlarda pazarlama iletişimleri göndermek için işleriz.' },
    { id: 'sharing', title: '4. Paylaşım ve uluslararası aktarımlar', body: 'Kişisel verileri ödeme sağlayıcıları, barındırma sağlayıcıları, analiz ve izleme araçları, destek araçları, profesyonel danışmanlar, düzenleyiciler veya gerekli olduğunda kolluk kuvvetleri gibi güvenilir taraflarla paylaşabiliriz. Uluslararası aktarımlar uygun güvencelerle yapılır.' },
    { id: 'cookies', title: '5. Çerezler ve benzer teknolojiler', body: 'Zorunlu işlevler, güvenlik, analiz ve onayınızla pazarlama için çerezler ve benzer teknolojiler kullanırız. Ayrıntılar için Çerez Politikamıza bakın.' },
    { id: 'retention', title: '6. Saklama', body: 'Kişisel verileri yalnızca belirtilen amaçlar ve yasal yükümlülükler için gerekli olduğu sürece saklarız. Sipariş ve ödeme kayıtları muhasebe ve uyuşmazlık amaçlarıyla saklanabilir. Taslaklar ve oluşturulan dosyalar Hizmeti sağlamak için gerektiği sürece veya hesabınızda kayıtlı kaldığı sürece saklanır.' },
    { id: 'rights', title: '7. Haklarınız', body: 'Erişim, düzeltme, silme, işlemeyi kısıtlama, veri taşınabilirliği, belirli işlemlere itiraz etme ve uygulanabilir olduğunda onayı geri çekme talep edebilirsiniz. Haklarınızı kullanmak için info@cv-makers.co.uk adresine yazın.' },
    { id: 'security', title: '8. Güvenlik önlemleri', body: 'Aktarım sırasında şifreleme, erişim kontrolleri, güvenli yedekler, izleme ve personel eğitimi dahil makul teknik ve organizasyonel önlemler kullanırız.' },
    { id: 'changes', title: '9. Bu Politikadaki değişiklikler', body: 'Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler uygun olduğunda e-posta veya belirgin bildirimle duyurulur.' },
    { id: 'contact', title: '10. İletişim ve şikâyetler', body: 'Gizlilikle ilgili sorular veya talepler için info@cv-makers.co.uk adresine yazın. Memnun kalmazsanız UK Information Commissioner’s Office (ICO) kurumuna şikâyette bulunabilirsiniz.' },
    { id: 'company-details', title: 'Şirket bilgileri', body: 'WORKING AGENT LTD\nŞirket numarası: 15957326\nKayıtlı ofis: Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF\nE-posta: info@cv-makers.co.uk' },
  ],
} satisfies Record<'en' | 'tr', PolicySection[]>;

export default async function PrivacyPage() {
  const locale = await getRequestLocale();
  return (
    <PolicyPage
      title={locale === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
      sections={SECTIONS[locale]}
      effectiveDate="06.10.2025"
      lastUpdated="06.10.2025"
      version="v1.0.6"
      helpEmail="info@cv-makers.co.uk"
      showRegionToggle={false}
    />
  );
}
