import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';
import { Currency, formatCurrency, SERVICE_COSTS } from '@/lib/currency';

export const metadata = {
  title: 'Terms & Conditions - CV Makers',
  description: 'Terms & Conditions for using CV Makers services.',
};

function getDynamicTermsSections(currency: Currency): PolicySection[] {
  return [
  {
    id: 'intro',
    title: '1. General provisions',
    body: `These Terms and Conditions govern the use of the website cv-makers.co.uk and the provision of CV/resume creation, improvement, and export services by WORKING AGENT LTD (Company No. 15957326), registered at 31 Auctioneers Way, Northampton, United Kingdom, NN1 1HF (the "Company," "we," "us," "our").\nBy using our website, creating a draft CV, or purchasing token packages, you agree to these Terms. If you do not agree, please do not use the Service.`
  },
  {
    id: 'definitions',
    title: '2. Definitions',
    body: `"Services" — creation, editing, and export of CVs/resumes in PDF or DOCX, as well as improvements via AI or a personal manager.\n"Draft" — a resume draft created by the user.\n"Final File" — the finished document (PDF or DOCX) saved by the user.\n"Client," "you" — an individual or entity using the website or purchasing tokens.\n"Tokens" — internal credits used to pay for Services (1.00 GBP = 100 tokens, other currencies converted at current exchange rates).`
  },
  {
    id: 'accounts',
    title: '3. Right to use and account registration',
    body: `You must be at least 18 years old to place an order or register, or be an authorized representative of a legal entity.\nYou must provide accurate and up-to-date information during registration and keep it current.\nYou are responsible for maintaining the confidentiality of your login credentials and for all activities carried out under your account.`
  },
  {
    id: 'tokens',
    title: '4. Ordering, tokens and payment',
    body: `Services are provided through a token-based system with GBP as the base currency:
• Starter — ${formatCurrency(5.00, currency)} = 500 tokens
• Pro — ${formatCurrency(15.00, currency)} = 1,500 tokens  
• Business — ${formatCurrency(30.00, currency)} = 3,000 tokens
• Custom — price by agreement (custom token allocation).

Service costs (in tokens):
• Create CV/Resume draft — ${SERVICE_COSTS.CREATE_DRAFT} tokens
• Export to PDF — ${SERVICE_COSTS.EXPORT_PDF} tokens
• Export to DOCX — ${SERVICE_COSTS.EXPORT_DOCX} tokens
• Improve with AI — ${SERVICE_COSTS.AI_IMPROVE} tokens
• Send to personal manager — ${SERVICE_COSTS.PERSONAL_MANAGER} tokens

All prices are calculated from GBP (1.00 GBP = 100 tokens). Other currencies are converted at current exchange rates. Payments are made via methods listed on the website. Services are activated only after payment is received.`
  },
  {
    id: 'service',
    title: '5. Service performance',
    body: `Drafts and files are generated automatically after tokens are deducted.\nYou must review the final file immediately upon download.\nIn case of technical errors, the Company may offer regeneration or token refunds.`
  },
  {
    id: 'refunds',
    title: '6. Cancellation and refunds',
    body: `Token packages can be canceled before use; refunds are issued minus payment provider fees.\nTokens already used for Services are non-refundable.\nIn case of significant technical failures caused by us, compensation or refunds may be granted in line with our refund policy.`
  },
  {
    id: 'ip',
    title: '7. Intellectual property',
    body: `You retain all rights to the data you upload or input for resume creation.\nThe Company does not claim ownership of your materials and uses them solely for providing Services.\nFinal files belong to you after generation.`
  },
  {
    id: 'privacy',
    title: '8. Confidentiality and data processing',
    body: `We process personal data in accordance with our Privacy Policy and applicable law (UK GDPR and the Data Protection Act 2018).\nUploaded data is automatically deleted after processing, unless otherwise required for technical support.`
  },
  {
    id: 'warranty',
    title: '9. Warranties and disclaimer',
    body: `We warrant that Services will be provided with reasonable care and in accordance with their descriptions.\nThe Service is provided “as is.” We do not guarantee job placement, employer approval, or specific career outcomes from using the generated CV/resume.`
  },
  {
    id: 'liability',
    title: '10. Limitation of liability',
    body: `The Company is not liable for indirect or consequential losses, including loss of profit, data, or reputation, except in cases of willful misconduct or gross negligence.\nThe Company’s total liability is limited to the amount actually paid by you for the token package used for the specific Service giving rise to the claim.`
  },
  {
    id: 'indemnity',
    title: '11. Indemnity',
    body: `You agree to indemnify and hold the Company harmless from any claims, liabilities, damages, or expenses (including reasonable legal fees) arising out of: (a) your breach of these Terms; (b) unlawful use of third-party data; or (c) misuse of generated files.`
  },
  {
    id: 'third-party',
    title: '12. Third-party links',
    body: `The website may contain links to third-party resources. We are not responsible for their content or accuracy.`
  },
  {
    id: 'termination',
    title: '13. Suspension and termination',
    body: `We may suspend or terminate your account if you breach these Terms, engage in fraudulent activity, or pose a security threat.\nTermination does not release you from obligations incurred before termination.`
  },
  {
    id: 'changes',
    title: '14. Changes to these Terms',
    body: `We may update these Terms from time to time. Significant changes will be posted on the website or sent to you via email. Continued use of the Service constitutes acceptance of the updated Terms.`
  },
  {
    id: 'notices',
    title: '15. Notices',
    body: `All official communications must be sent to:\n📧 info@cv-makers.co.uk\n📍 31 Auctioneers Way, Northampton, United Kingdom, NN1 1HF`
  },
  {
    id: 'law',
    title: '16. Governing law and jurisdiction',
    body: `These Terms are governed by the laws of England and Wales. Disputes will be subject to the exclusive jurisdiction of the courts of England and Wales, except where mandatory consumer protection laws apply in your country of residence.`
  },
  {
    id: 'misc',
    title: '17. Miscellaneous',
    body: `If any provision of these Terms is found invalid or unenforceable, the remaining provisions remain in force.\nFailure by the Company to enforce any right does not constitute a waiver of that right.\nThese Terms represent the entire agreement between you and the Company regarding the use of the Service.`
  },
  {
    id: 'company-details',
    title: 'Company details',
    body: `WORKING AGENT LTD\nCompany number: 15957326\nRegistered office: 31 Auctioneers Way, Northampton, United Kingdom, NN1 1HF\nEmail: info@cv-makers.co.uk`
  },
  ];
}

export default function TermsPage() {
  // For now, use GBP as default currency. In the future, this could be made dynamic based on user preferences
  const sections = getDynamicTermsSections('GBP');
  
  return (
    <PolicyPage
      title="Terms & Conditions"
      sections={sections}
      effectiveDate="01.09.2025"
      lastUpdated="18.09.2025"
      version="v1.0.6"
      helpEmail="info@cv-makers.co.uk"
      showRegionToggle={false}
    />
  );
}
