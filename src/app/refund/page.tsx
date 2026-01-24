import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';
import { Currency } from '@/lib/currency';
import { formatCurrency } from '@/lib/currency';

export const metadata = {
  title: 'Refund & Cancellation Policy - CV Makers',
  description: 'Refund and cancellation terms for CV Makers token purchases and services.',
};

function getDynamicRefundSections(currency: Currency): PolicySection[] {
  return [
  {
    id: 'summary',
    title: '1. Customer summary',
    body: `Refunds are processed according to this Policy and applicable law.\nStandard refund processing time is 5–10 business days after approval; actual posting may take longer depending on banks/payment providers.\nRefunds will not exceed the amount actually paid for your order (minus any non-refundable processor fees).\nTokens already used for Services (draft generation, exports, AI improvement, or manager review) are generally non-refundable.\nToken packages can be refunded only if unused; once tokens are spent, refunds are not possible except in cases of technical fault.\nPromotional credits, discounts, and bonus tokens are normally non-refundable unless required by law or explicitly stated otherwise.\nRefund requests must be sent to info@cv-makers.co.uk with your order details.\nThis Policy may be updated; significant changes will be communicated as described below.\nBy expressly requesting immediate access to Services (e.g., downloading or generating a CV), you may lose the statutory cancellation right — see section 4.6.`
  },
  {
    id: 'scope',
    title: '2. Scope and legal note',
    body: `This Policy applies to refunds and cancellations for CV/resume creation, export, AI improvement, and related services provided by WORKING AGENT LTD. Nothing in this Policy affects statutory consumer rights (for example under the Consumer Contracts Regulations 2013 and the Consumer Rights Act 2015, where applicable).`
  },
  {
    id: 'definitions',
    title: '3. Definitions',
    body: `Order / Service Fee — the amount you paid for token packages.\nToken Package — prepaid balance of tokens purchased to access Services.\nUsed Tokens — tokens deducted for generating drafts, exporting files, or using AI/manager services.\nUnused Tokens — tokens remaining in your balance that have not yet been spent.\nPromotional Credits — bonus tokens or discounts awarded under promotions.`
  },
  {
    id: 'rules',
    title: '4. Core refund rules',
    body: `4.1 Refund cap. Refunds will not exceed the amount you paid for the relevant purchase (less any non-refundable payment fees). Refunds are made in the original purchase currency where possible.\n4.2 Used tokens. Once tokens have been used for Services, refunds are generally not available, except where the Service was materially defective and could not be remedied.\n4.3 Cancellation before use. If you cancel before using purchased tokens, we will refund the remaining amount minus any reasonable costs already incurred.\n4.4 Defective or non-conforming output. If a generated CV/resume is materially defective or does not match the specification, we will first attempt to correct it (revisions/regeneration). If the issue cannot be fixed within a reasonable time, a partial or full refund may be issued.\n4.5 Promotions. Promotional credits, discounts, or bonus tokens are normally non-refundable unless required by law.\n4.6 Immediate use / loss of cancellation right. If you request an immediate start and confirm you waive the cancellation right (or if you download or use generated files), your statutory cancellation right may no longer apply.\n4.7 Custom services. Where a personal manager is engaged, once the review process has begun, refunds are not available unless otherwise agreed in writing.`
  },
  {
    id: 'request',
    title: '5. How to request a refund',
    body: `Send an email to info@cv-makers.co.uk with the following:\n• Order reference number.\n• Account email used for purchase.\n• Whether the request concerns unused tokens, cancellation, or an issue with generated files.\n• For defective outputs: description of the issue and evidence (screenshots, file names, timestamps).\n• Preferred refund method (normally refunded to the original payment method).\n\nUpon receipt we will:\n• Acknowledge your request within 5 business days.\n• Investigate and, if needed, request further details.\n• Provide a decision and, if approved, initiate the refund within 5–10 business days of approval (posting time depends on your provider).`
  },
  {
    id: 'investigation',
    title: '6. Investigation, evidence and decisions',
    body: `6.1 We review order/payment records, token logs, file generation history, and any evidence you submit.\n6.2 Approved refunds are normally returned to the original payment method; if not possible, an alternative may be offered (e.g., bank transfer).\n6.3 If a claim is refused, we will explain the reasons and outline possible next steps.`
  },
  {
    id: 'fraud',
    title: '7. Chargebacks, fraud and abuse',
    body: `If you initiate a chargeback while a refund request is pending, it will be treated as a dispute. We will provide full evidence (order logs, confirmations, timestamps, downloads) to the payment provider. We may refuse refunds and suspend accounts in cases of fraud, abuse, or repeated unwarranted chargebacks.`
  },
  {
    id: 'changes',
    title: '8. Changes to this Policy',
    body: `We may update this Policy from time to time. Material changes will be notified by email or via a prominent notice on the website. Updates apply prospectively and do not affect transactions completed before the change date.`
  },
  {
    id: 'records',
    title: '9. Record retention',
    body: `We keep records necessary to review refund requests — including order IDs, payment history, token usage logs, and delivery records — for at least 24 months, and up to 6 years in corporate or disputed matters, consistent with our Privacy Policy and applicable law.`
  },
  {
    id: 'escalation',
    title: '10. Escalation and disputes',
    body: `If you disagree with our decision, you may send a detailed appeal to info@cv-makers.co.uk with your order details. Appeals are reviewed within 10 business days. This does not affect your statutory rights to pursue dispute resolution or legal action.`
  },
  {
    id: 'examples',
    title: '11. Examples',
    body: `Unused tokens: You purchased ${formatCurrency(20.00, currency)} = 2,000 tokens, used 300 tokens → 1,700 unused tokens. If you request a refund, the value of unused tokens may be refunded (less fees).\nUsed tokens: If you spent tokens to generate/download a CV, refunds are only possible where the output is materially defective.\nPromotional tokens: 100 bonus tokens received in a promotion → non-refundable.\nCurrency conversion: All refunds are calculated from GBP base currency (1.00 GBP = 100 tokens) and converted to your original payment currency at current exchange rates.`
  },
  {
    id: 'contact',
    title: '12. Contact details',
    body: `Email: info@cv-makers.co.uk\nRegistered office: WORKING AGENT LTD, 31 Auctioneers Way, Northampton, United Kingdom, NN1 1HF`
  },
  ];
}

export default function RefundPage() {
  // For now, use GBP as default currency. In the future, this could be made dynamic based on user preferences
  const sections = getDynamicRefundSections('GBP');
  
  return (
    <PolicyPage
      title="Refund & Cancellation Policy"
      sections={sections}
      effectiveDate="16.09.2025"
      lastUpdated="18.09.2025"
      version="v1.0.6"
      helpEmail="info@cv-makers.co.uk"
      showRegionToggle={false}
    />
  );
}
