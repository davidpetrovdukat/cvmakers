import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';
import { Currency, formatCurrency, SERVICE_COSTS } from '@/lib/currency';
import { getRequestLocale } from '@/i18n/server';

export const metadata = {
  title: 'Terms & Conditions - CV Makers',
  description: 'Terms & Conditions for using CV Makers services.',
};

function getSections(currency: Currency, locale: 'en' | 'tr'): PolicySection[] {
  if (locale === 'tr') {
    return [
      { id: 'intro', title: '1. Genel hükümler', body: 'Bu Şartlar ve Koşullar, cv-makers.co.uk sitesinin kullanımını ve WORKING AGENT LTD tarafından sağlanan CV/özgeçmiş oluşturma, iyileştirme ve dışa aktarma hizmetlerini düzenler. Web sitesini kullanarak, taslak oluşturarak veya token satın alarak bu Şartları kabul edersiniz.' },
      { id: 'definitions', title: '2. Tanımlar', body: 'Hizmetler; CV/özgeçmiş oluşturma, düzenleme, PDF veya DOCX dışa aktarma, yapay zekâ ile iyileştirme ve kişisel yönetici desteğini ifade eder. Tokenlar, Hizmetler için ödeme yapmakta kullanılan dahili kredilerdir.' },
      { id: 'accounts', title: '3. Hesap ve kullanım hakkı', body: 'Sipariş vermek veya kayıt olmak için en az 18 yaşında olmalı ya da bir tüzel kişiliğin yetkili temsilcisi olmalısınız. Kayıt sırasında doğru ve güncel bilgi sağlamalı ve giriş bilgilerinizin gizliliğini korumalısınız.' },
      { id: 'tokens', title: '4. Sipariş, tokenlar ve ödeme', body: `Hizmetler token bazlı sistemle sunulur. Örnek paketler: Starter ${formatCurrency(5, currency)} = 500 token, Pro ${formatCurrency(15, currency)} = 1.500 token, Business ${formatCurrency(30, currency)} = 3.000 token. Hizmet maliyetleri: Taslak oluşturma ${SERVICE_COSTS.CREATE_DRAFT} token, PDF dışa aktarma ${SERVICE_COSTS.EXPORT_PDF} token, DOCX dışa aktarma ${SERVICE_COSTS.EXPORT_DOCX} token, yapay zekâ iyileştirme ${SERVICE_COSTS.AI_IMPROVE} token, kişisel yönetici ${SERVICE_COSTS.PERSONAL_MANAGER} token.` },
      { id: 'service', title: '5. Hizmetin ifası', body: 'Taslaklar ve dosyalar tokenlar düşüldükten sonra oluşturulur. Son dosyayı indirdikten sonra hemen incelemelisiniz. Teknik hata durumunda yeniden oluşturma veya token iadesi sunabiliriz.' },
      { id: 'delivery', title: '6. Dijital içerik teslimi', body: 'Fiziksel gönderim yapılmaz. Hizmet yalnızca dijital içerik teslim eder. Belgeler PDF veya DOCX olarak elektronik şekilde oluşturulur ve indirilir. Oluşturulan belgeler hesabınız aktif olduğu sürece Dashboard üzerinden tekrar indirilebilir.' },
      { id: 'refunds', title: '7. İptal ve iadeler', body: 'Token paketleri kullanılmadan önce iptal edilebilir. Hizmetler için kullanılmış tokenlar iade edilmez. Bizden kaynaklanan önemli teknik arızalarda iade veya telafi, İade ve İptal Politikamıza göre değerlendirilebilir.' },
      { id: 'ip', title: '8. Fikri mülkiyet', body: 'CV/özgeçmiş oluşturma için yüklediğiniz veya girdiğiniz veriler üzerindeki haklar sizde kalır. Şirket materyalleriniz üzerinde mülkiyet iddia etmez ve bunları yalnızca Hizmetleri sağlamak için kullanır.' },
      { id: 'privacy', title: '9. Gizlilik ve veri işleme', body: 'Kişisel verileri Gizlilik Politikamıza ve geçerli veri koruma mevzuatına uygun olarak işleriz.' },
      { id: 'warranty', title: '10. Sorumluluk reddi', body: 'Hizmetleri makul özenle ve açıklamalarına uygun şekilde sağlamayı amaçlarız. Hizmet “olduğu gibi” sunulur; iş bulma, işveren onayı veya belirli kariyer sonucu garanti edilmez.' },
      { id: 'liability', title: '11. Sorumluluğun sınırlandırılması', body: 'Şirket, kasıt veya ağır ihmal durumları dışında dolaylı veya sonuçsal kayıplardan sorumlu değildir. Toplam sorumluluk, ilgili Hizmete yol açan token paketi için fiilen ödediğiniz tutarla sınırlıdır.' },
      { id: 'changes', title: '12. Şartlardaki değişiklikler', body: 'Bu Şartları zaman zaman güncelleyebiliriz. Önemli değişiklikler web sitesinde yayınlanır veya e-posta ile bildirilebilir. Hizmeti kullanmaya devam etmeniz güncellenmiş Şartları kabul ettiğiniz anlamına gelir.' },
      { id: 'law', title: '13. Geçerli hukuk ve yetki', body: 'Bu Şartlar İngiltere ve Galler hukukuna tabidir. Uyuşmazlıklar, zorunlu tüketici koruma kuralları saklı kalmak üzere İngiltere ve Galler mahkemelerinin yetkisine tabidir.' },
      { id: 'company-details', title: 'Şirket bilgileri', body: 'WORKING AGENT LTD\nŞirket numarası: 15957326\nKayıtlı ofis: Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF\nE-posta: info@cv-makers.co.uk' },
    ];
  }
  return [
    { id: 'intro', title: '1. General provisions', body: 'These Terms and Conditions govern use of cv-makers.co.uk and the provision of CV/resume creation, improvement, and export services by WORKING AGENT LTD. By using the website, creating a draft, or purchasing token packages, you agree to these Terms.' },
    { id: 'definitions', title: '2. Definitions', body: 'Services means creation, editing, and export of CVs/resumes in PDF or DOCX, as well as improvements via AI or a personal manager. Tokens are internal credits used to pay for Services.' },
    { id: 'accounts', title: '3. Right to use and account registration', body: 'You must be at least 18 years old to place an order or register, or be an authorized representative of a legal entity. You must provide accurate information and protect your login credentials.' },
    { id: 'tokens', title: '4. Ordering, tokens and payment', body: `Services are provided through a token system. Example packages: Starter ${formatCurrency(5, currency)} = 500 tokens, Pro ${formatCurrency(15, currency)} = 1,500 tokens, Business ${formatCurrency(30, currency)} = 3,000 tokens. Service costs: Draft ${SERVICE_COSTS.CREATE_DRAFT} tokens, PDF export ${SERVICE_COSTS.EXPORT_PDF} tokens, DOCX export ${SERVICE_COSTS.EXPORT_DOCX} tokens, AI improvement ${SERVICE_COSTS.AI_IMPROVE} tokens, personal manager ${SERVICE_COSTS.PERSONAL_MANAGER} tokens.` },
    { id: 'service', title: '5. Service performance', body: 'Drafts and files are generated after tokens are deducted. You must review the final file immediately upon download. In case of technical errors, we may offer regeneration or token refunds.' },
    { id: 'delivery', title: '6. Delivery of Digital Content', body: 'No physical shipment is provided. The Service delivers digital content only. Documents are generated electronically as PDF or DOCX and can be downloaded from your Dashboard while your account is active.' },
    { id: 'refunds', title: '7. Cancellation and refunds', body: 'Token packages can be cancelled before use. Tokens already used for Services are non-refundable. Significant technical failures caused by us may be handled according to our Refund & Cancellation Policy.' },
    { id: 'ip', title: '8. Intellectual property', body: 'You retain all rights to the data you upload or input for CV/resume creation. We use your materials solely to provide Services.' },
    { id: 'privacy', title: '9. Confidentiality and data processing', body: 'We process personal data in accordance with our Privacy Policy and applicable data-protection law.' },
    { id: 'warranty', title: '10. Warranties and disclaimer', body: 'The Service is provided with reasonable care and according to its description, but we do not guarantee job placement, employer approval, or specific career outcomes.' },
    { id: 'liability', title: '11. Limitation of liability', body: 'We are not liable for indirect or consequential losses except in cases of willful misconduct or gross negligence. Total liability is limited to the amount paid for the relevant token package.' },
    { id: 'changes', title: '12. Changes to these Terms', body: 'We may update these Terms from time to time. Continued use of the Service constitutes acceptance of updated Terms.' },
    { id: 'law', title: '13. Governing law and jurisdiction', body: 'These Terms are governed by the laws of England and Wales. Disputes are subject to the courts of England and Wales, except where mandatory consumer protection laws apply.' },
    { id: 'company-details', title: 'Company details', body: 'WORKING AGENT LTD\nCompany number: 15957326\nRegistered office: Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF\nEmail: info@cv-makers.co.uk' },
  ];
}

export default async function TermsPage() {
  const locale = await getRequestLocale();
  const sections = getSections('GBP', locale);
  return (
    <PolicyPage
      title={locale === 'tr' ? 'Şartlar ve Koşullar' : 'Terms & Conditions'}
      sections={sections}
      effectiveDate="06.10.2025"
      lastUpdated="06.10.2025"
      version="v1.0.6"
      helpEmail="info@cv-makers.co.uk"
      showRegionToggle={false}
    />
  );
}
