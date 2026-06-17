import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';
import { getRequestLocale } from '@/i18n/server';
import { Locale } from '@/i18n/config';

export const metadata = {
  title: 'Privacy Policy - CV Makers',
  description: 'How CV Makers collects, uses, and protects personal data.',
};

const PAGE_TITLES: Record<Locale, string> = {
  en: 'Privacy Policy',
  tr: 'Gizlilik Politikası',
  ja: 'プライバシーポリシー',
};

const SECTIONS: Record<Locale, PolicySection[]> = {
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
    { id: 'contact', title: '10. Contact & complaints', body: "For privacy questions or requests, contact info@cv-makers.co.uk. If you are not satisfied, you may lodge a complaint with the UK Information Commissioner's Office (ICO)." },
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
    { id: 'contact', title: '10. İletişim ve şikâyetler', body: "Gizlilikle ilgili sorular veya talepler için info@cv-makers.co.uk adresine yazın. Memnun kalmazsanız UK Information Commissioner's Office (ICO) kurumuna şikâyette bulunabilirsiniz." },
    { id: 'company-details', title: 'Şirket bilgileri', body: 'WORKING AGENT LTD\nŞirket numarası: 15957326\nKayıtlı ofis: Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF\nE-posta: info@cv-makers.co.uk' },
  ],
  ja: [
    { id: 'introduction', title: '1. はじめに', body: '当社はお客様のプライバシーを尊重し、個人データを責任をもって取り扱います。本ポリシーは、WORKING AGENT LTDが運営するcv-makers.co.ukにおいて、当社が収集するデータ、その処理目的、保存期間、共有先、およびお客様が行使できる権利について説明するものです。' },
    { id: 'data', title: '2. 収集する個人データ', body: '当社は、サービスの提供および改善に必要な個人データのみを収集します。これには、氏名・連絡先情報、取引および注文データ、アカウントデータ、利用状況および技術データ、CV/職務経歴書の内容、サポートメッセージ、お客様が任意で提供する情報が含まれます。' },
    { id: 'legal-bases', title: '3. データの処理目的', body: '個人データは、サービスの提供、決済処理、不正防止、サポートおよび返金対応、法的義務の履行、セキュリティおよび信頼性の向上、ならびに許可された場合に限りマーケティング通信の送信のために処理します。' },
    { id: 'sharing', title: '4. 共有および国際的な移転', body: '個人データは、決済処理業者、ホスティングプロバイダー、分析・監視ツール、サポートツール、専門アドバイザー、規制当局、または必要に応じて法執行機関など、信頼できる提供者と共有することがあります。国際的なデータ移転には、適切な保護措置を講じます。' },
    { id: 'cookies', title: '5. クッキーおよび類似技術', body: '必須機能、セキュリティ、分析、ならびに同意を得た場合のマーケティングのために、クッキーおよび類似技術を使用します。詳細はクッキーポリシーをご参照ください。' },
    { id: 'retention', title: '6. 保存期間', body: '個人データは、記載された目的および法的義務に必要な期間のみ保存します。注文および支払い記録は、会計および紛争対応のために保存される場合があります。下書きおよび生成されたファイルは、サービス提供に必要な期間、またはお客様のアカウントに保存されている期間保存されます。' },
    { id: 'rights', title: '7. お客様の権利', body: 'お客様は、アクセス、訂正、削除、処理の制限、データポータビリティの請求、特定の処理への異議申し立て、ならびに該当する場合の同意の撤回を求めることができます。権利の行使については、info@cv-makers.co.ukまでご連絡ください。' },
    { id: 'security', title: '8. セキュリティ対策', body: '当社は、通信時の暗号化、アクセス制御、安全なバックアップ、監視、スタッフ教育など、合理的な技術的および組織的安全管理措置を実施しています。' },
    { id: 'changes', title: '9. 本ポリシーの変更', body: '当社は、本プライバシーポリシーを随時更新することがあります。重要な変更は、電子メールまたは適切な方法による目立つ通知でお知らせします。' },
    { id: 'contact', title: '10. お問い合わせおよび苦情', body: 'プライバシーに関するご質問またはご請求は、info@cv-makers.co.ukまでご連絡ください。ご満足いただけない場合は、英国情報コミッショナー室（ICO）に苦情を申し立てることができます。' },
    { id: 'company-details', title: '会社情報', body: 'WORKING AGENT LTD\nCompany number: 15957326\nRegistered office: Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF\nEmail: info@cv-makers.co.uk' },
  ],
};

export default async function PrivacyPage() {
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
