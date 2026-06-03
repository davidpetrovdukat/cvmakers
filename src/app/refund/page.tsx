import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';
import { Currency, formatCurrency } from '@/lib/currency';
import { getRequestLocale } from '@/i18n/server';

export const metadata = {
  title: 'Refund & Cancellation Policy - CV Makers',
  description: 'Refund and cancellation terms for CV Makers token purchases and services.',
};

function getSections(currency: Currency, locale: 'en' | 'tr'): PolicySection[] {
  if (locale === 'tr') {
    return [
      { id: 'summary', title: '1. Müşteri özeti', body: 'İadeler bu Politika ve geçerli hukuk uyarınca işlenir. Onaydan sonra standart iade süresi 5-10 iş günüdür; bankaya veya ödeme sağlayıcısına bağlı olarak hesaba geçmesi daha uzun sürebilir. Kullanılmış tokenlar genellikle iade edilmez.' },
      { id: 'scope', title: '2. Kapsam ve yasal not', body: 'Bu Politika, WORKING AGENT LTD tarafından sağlanan CV/özgeçmiş oluşturma, dışa aktarma, yapay zekâ ile iyileştirme ve ilgili hizmetler için iade ve iptallere uygulanır. Bu Politika yasal tüketici haklarınızı sınırlamaz.' },
      { id: 'definitions', title: '3. Tanımlar', body: 'Token Paketi, Hizmetlere erişmek için satın alınan ön ödemeli token bakiyesidir. Kullanılmış Tokenlar; taslak oluşturma, dosya dışa aktarma veya yapay zekâ/yönetici hizmetleri için düşülen tokenlardır. Kullanılmamış Tokenlar henüz harcanmamış bakiyedir.' },
      { id: 'rules', title: '4. Temel iade kuralları', body: 'İadeler ilgili satın alma için ödediğiniz tutarı aşmaz. Tokenlar Hizmetler için kullanıldıktan sonra, Hizmet esaslı şekilde kusurlu değilse iade genellikle mümkün değildir. Satın alınan tokenlar kullanılmadan önce iptal edilirse kalan tutar makul masraflar düşülerek iade edilebilir.' },
      { id: 'request', title: '5. İade nasıl talep edilir?', body: 'İade talebi için info@cv-makers.co.uk adresine sipariş referansı, hesap e-postası, talep nedeni ve varsa kusurlu çıktı kanıtlarıyla yazın. Talebinizi inceler ve gerekirse ek bilgi isteriz.' },
      { id: 'examples', title: '6. Örnekler', body: `Kullanılmamış tokenlar: ${formatCurrency(20.00, currency)} tutarında 2.000 token satın alıp 300 token kullandıysanız, kalan 1.700 tokenın değeri uygun koşullarda iade edilebilir. Kullanılmış tokenlar yalnızca çıktı esaslı şekilde kusurluysa değerlendirilebilir.` },
      { id: 'contact', title: '7. İletişim', body: 'E-posta: info@cv-makers.co.uk\nKayıtlı ofis: WORKING AGENT LTD, Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF' },
    ];
  }
  return [
    { id: 'summary', title: '1. Customer summary', body: 'Refunds are processed according to this Policy and applicable law. Standard refund processing time is 5-10 business days after approval; actual posting may take longer depending on banks/payment providers. Used tokens are generally non-refundable.' },
    { id: 'scope', title: '2. Scope and legal note', body: 'This Policy applies to refunds and cancellations for CV/resume creation, export, AI improvement, and related services provided by WORKING AGENT LTD. Nothing in this Policy affects statutory consumer rights.' },
    { id: 'definitions', title: '3. Definitions', body: 'Token Package means prepaid tokens purchased to access Services. Used Tokens are tokens deducted for drafts, exports, AI, or manager services. Unused Tokens are remaining tokens not yet spent.' },
    { id: 'rules', title: '4. Core refund rules', body: 'Refunds will not exceed the amount paid for the relevant purchase. Once tokens have been used for Services, refunds are generally not available unless the Service was materially defective. If you cancel before using purchased tokens, the remaining value may be refunded minus reasonable costs.' },
    { id: 'request', title: '5. How to request a refund', body: 'Send an email to info@cv-makers.co.uk with your order reference, account email, reason for the request, and evidence for any defective output. We will review the request and may ask for further details.' },
    { id: 'examples', title: '6. Examples', body: `Unused tokens: You purchased ${formatCurrency(20.00, currency)} = 2,000 tokens and used 300 tokens. The value of 1,700 unused tokens may be refundable where eligible. Used tokens are considered only where output is materially defective.` },
    { id: 'contact', title: '7. Contact details', body: 'Email: info@cv-makers.co.uk\nRegistered office: WORKING AGENT LTD, Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF' },
  ];
}

export default async function RefundPage() {
  const locale = await getRequestLocale();
  const sections = getSections('GBP', locale);
  return (
    <PolicyPage
      title={locale === 'tr' ? 'İade ve İptal Politikası' : 'Refund & Cancellation Policy'}
      sections={sections}
      effectiveDate="06.10.2025"
      lastUpdated="06.10.2025"
      version="v1.0.6"
      helpEmail="info@cv-makers.co.uk"
      showRegionToggle={false}
    />
  );
}
