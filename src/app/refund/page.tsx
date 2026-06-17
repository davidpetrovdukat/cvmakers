import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';
import { Currency, formatCurrency } from '@/lib/currency';
import { getRequestLocale } from '@/i18n/server';
import { Locale } from '@/i18n/config';

export const metadata = {
  title: 'Refund & Cancellation Policy - CV Makers',
  description: 'Refund and cancellation terms for CV Makers token purchases and services.',
};

const CURRENCY: Currency = 'GBP';

const PAGE_TITLES: Record<Locale, string> = {
  en: 'Refund & Cancellation Policy',
  tr: 'İade ve İptal Politikası',
  ja: '返金・キャンセルポリシー',
};

const SECTIONS: Record<Locale, PolicySection[]> = {
  en: [
    { id: 'summary', title: '1. Customer summary', body: 'Refunds are processed according to this Policy and applicable law. Standard refund processing time is 5-10 business days after approval; actual posting may take longer depending on banks/payment providers. Used tokens are generally non-refundable.' },
    { id: 'scope', title: '2. Scope and legal note', body: 'This Policy applies to refunds and cancellations for CV/resume creation, export, AI improvement, and related services provided by WORKING AGENT LTD. Nothing in this Policy affects statutory consumer rights.' },
    { id: 'definitions', title: '3. Definitions', body: 'Token Package means prepaid tokens purchased to access Services. Used Tokens are tokens deducted for drafts, exports, AI, or manager services. Unused Tokens are remaining tokens not yet spent.' },
    { id: 'rules', title: '4. Core refund rules', body: 'Refunds will not exceed the amount paid for the relevant purchase. Once tokens have been used for Services, refunds are generally not available unless the Service was materially defective. If you cancel before using purchased tokens, the remaining value may be refunded minus reasonable costs.' },
    { id: 'request', title: '5. How to request a refund', body: 'Send an email to info@cv-makers.co.uk with your order reference, account email, reason for the request, and evidence for any defective output. We will review the request and may ask for further details.' },
    { id: 'examples', title: '6. Examples', body: `Unused tokens: You purchased ${formatCurrency(20.00, CURRENCY)} = 2,000 tokens and used 300 tokens. The value of 1,700 unused tokens may be refundable where eligible. Used tokens are considered only where output is materially defective.` },
    { id: 'contact', title: '7. Contact details', body: 'Email: info@cv-makers.co.uk\nRegistered office: WORKING AGENT LTD, Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF' },
  ],
  tr: [
    { id: 'summary', title: '1. Müşteri özeti', body: 'İadeler bu Politika ve geçerli hukuk uyarınca işlenir. Onaydan sonra standart iade süresi 5-10 iş günüdür; bankaya veya ödeme sağlayıcısına bağlı olarak hesaba geçmesi daha uzun sürebilir. Kullanılmış tokenlar genellikle iade edilmez.' },
    { id: 'scope', title: '2. Kapsam ve yasal not', body: 'Bu Politika, WORKING AGENT LTD tarafından sağlanan CV/özgeçmiş oluşturma, dışa aktarma, yapay zekâ ile iyileştirme ve ilgili hizmetler için iade ve iptallere uygulanır. Bu Politika yasal tüketici haklarınızı sınırlamaz.' },
    { id: 'definitions', title: '3. Tanımlar', body: 'Token Paketi, Hizmetlere erişmek için satın alınan ön ödemeli token bakiyesidir. Kullanılmış Tokenlar; taslak oluşturma, dosya dışa aktarma veya yapay zekâ/yönetici hizmetleri için düşülen tokenlardır. Kullanılmamış Tokenlar henüz harcanmamış bakiyedir.' },
    { id: 'rules', title: '4. Temel iade kuralları', body: 'İadeler ilgili satın alma için ödediğiniz tutarı aşmaz. Tokenlar Hizmetler için kullanıldıktan sonra, Hizmet esaslı şekilde kusurlu değilse iade genellikle mümkün değildir. Satın alınan tokenlar kullanılmadan önce iptal edilirse kalan tutar makul masraflar düşülerek iade edilebilir.' },
    { id: 'request', title: '5. İade nasıl talep edilir?', body: 'İade talebi için info@cv-makers.co.uk adresine sipariş referansı, hesap e-postası, talep nedeni ve varsa kusurlu çıktı kanıtlarıyla yazın. Talebinizi inceler ve gerekirse ek bilgi isteriz.' },
    { id: 'examples', title: '6. Örnekler', body: `Kullanılmamış tokenlar: ${formatCurrency(20.00, CURRENCY)} tutarında 2.000 token satın alıp 300 token kullandıysanız, kalan 1.700 tokenın değeri uygun koşullarda iade edilebilir. Kullanılmış tokenlar yalnızca çıktı esaslı şekilde kusurluysa değerlendirilebilir.` },
    { id: 'contact', title: '7. İletişim', body: 'E-posta: info@cv-makers.co.uk\nKayıtlı ofis: WORKING AGENT LTD, Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF' },
  ],
  ja: [
    { id: 'summary', title: '1. お客様向け概要', body: '返金は、本ポリシーおよび適用される法令に従って処理されます。承認後の標準的な返金処理期間は5〜10営業日ですが、銀行または決済プロバイダーにより、実際の口座への反映にはさらに時間がかかる場合があります。使用済みのトークンは、原則として返金の対象となりません。' },
    { id: 'scope', title: '2. 適用範囲および法的注記', body: '本ポリシーは、WORKING AGENT LTDが提供するCV/職務経歴書の作成、エクスポート、AI改善および関連サービスに関する返金およびキャンセルに適用されます。本ポリシーのいかなる内容も、法令上の消費者権利を制限するものではありません。' },
    { id: 'definitions', title: '3. 定義', body: '「トークンパッケージ」とは、サービスへのアクセスのために購入する前払いトークン残高をいいます。「使用済みトークン」とは、下書き作成、ファイルのエクスポート、AIまたはマネージャーサービスに消費されたトークンをいいます。「未使用トークン」とは、まだ消費されていない残存トークンをいいます。' },
    { id: 'rules', title: '4. 返金の基本ルール', body: '返金額は、該当する購入についてお客様が支払った金額を超えることはありません。トークンがサービスに使用された後は、サービスに重大な欠陥がない限り、原則として返金はできません。購入したトークンを使用する前にキャンセルした場合、合理的な費用を差し引いた残額が返金されることがあります。' },
    { id: 'request', title: '5. 返金の申請方法', body: 'info@cv-makers.co.uk宛に、注文参照番号、アカウントのメールアドレス、申請理由、および出力に欠陥がある場合はその証拠を添えてメールをお送りください。当社は申請内容を確認し、必要に応じて追加情報をお願いすることがあります。' },
    { id: 'examples', title: '6. 例', body: `未使用トークン：${formatCurrency(20.00, CURRENCY)}で2,000トークンを購入し、300トークンを使用した場合、残りの1,700トークンの価値は、条件を満たす場合に返金の対象となることがあります。使用済みトークンは、出力に重大な欠陥がある場合にのみ検討されます。` },
    { id: 'contact', title: '7. お問い合わせ', body: 'Email: info@cv-makers.co.uk\nRegistered office: WORKING AGENT LTD, Academy House, 11 Dunraven Place, Bridgend, Mid Glamorgan, CF31 1JF' },
  ],
};

export default async function RefundPage() {
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
