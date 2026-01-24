import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';

export const metadata = {
  title: 'Privacy Policy - CV Makers',
  description: 'How CV Makers collects, uses, and protects personal data.',
};

const sections: PolicySection[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    body: `We respect your privacy and handle personal data responsibly. This Policy explains what personal data we collect, why we process it, how long we retain it, who we may share it with, and how you can exercise your rights under data-protection law in connection with the services offered by cv-makers.co.uk, operated by WORKING AGENT LTD (Company No. 15957326), registered office: 31 Auctioneers Way, Northampton, United Kingdom, NN1 1HF.
For any questions or requests, please contact: info@cv-makers.co.uk.`
  },
  {
    id: 'data',
    title: '2. What personal data we collect',
    body: `We only collect the personal data necessary to provide and improve our services. Typical categories include:
• Identity & contact: name, email address, billing/postal address;
• Transaction & order data: token purchases, order references, invoices, payment identifiers (we do not store full card details);
• Account data: username, password hash, profile preferences;
• Usage & technical data: IP address, device/browser type, access logs, timestamps;
• CV/resume content: text you provide to generate drafts, improvements, or exports;
• Support & correspondence: messages sent to our support team, including uploaded files and communication history;
• Other information: any details you choose to provide when using our Services.
We do not collect more data than necessary for these purposes.`
  },
  {
    id: 'legal-bases',
    title: '3. Why we process your data and legal bases',
    body: `We process personal data for the following purposes and on these legal bases:
• To provide Services (performance of contract): create drafts, generate PDF/DOCX exports, apply AI improvements, deliver manager feedback, and communicate with you.
• To process payments and prevent fraud (legal obligation / legitimate interests): verify token purchases, detect abuse, comply with accounting and financial requirements.
• To handle support, refunds, and disputes (performance of contract / legitimate interests).
• To send marketing communications only where you have given consent; you may withdraw consent at any time.
• To meet legal or regulatory obligations (legal obligation), such as tax and record-keeping.
• For our legitimate business interests, including service improvement, security monitoring, and anonymised analytics (balanced against your rights).`
  },
  {
    id: 'sharing',
    title: '4. Sharing and international transfers',
    body: `We may share personal data with trusted third parties where necessary to provide the Service, including:
• Payment processors and banks;
• Hosting and cloud providers (for storing drafts and user data);
• Analytics, monitoring, and support tools;
• Professional advisers (legal, accounting) if required;
• Regulators or law enforcement, where legally required.
Some providers may operate outside the UK/EEA. In such cases, we rely on safeguards such as UK adequacy decisions or Standard Contractual Clauses (SCCs). We will not transfer your personal data in a way that reduces the level of protection guaranteed under applicable law.`
  },
  {
    id: 'cookies',
    title: '5. Cookies and similar technologies',
    body: `We use cookies and similar technologies for essential functions, security, analytics, and (with your consent) marketing. Essential cookies are required for the Service to operate. For more details and opt-out options, please see our Cookie Policy.`
  },
  {
    id: 'retention',
    title: '6. How long we keep data (retention)',
    body: `We retain personal data only as long as necessary for the stated purposes and to comply with legal obligations:
• Order and payment records: minimum 24 months, and up to 6 years for corporate or disputed matters;
• Account and support data: as long as needed to provide Services and for legitimate business purposes;
• CV/resume drafts and files: kept only for the duration of your use, unless you save them in your account; temporary files may be deleted automatically after processing;
• Marketing data: until you withdraw consent or we no longer have a lawful basis to retain it.
When data is no longer required, we securely delete or anonymise it.`
  },
  {
    id: 'rights',
    title: '7. Your rights and how to exercise them',
    body: `Under applicable data-protection laws (including UK GDPR), you have rights to:
• Access your personal data;
• Request correction or deletion;
• Restrict processing;
• Request data portability;
• Object to certain processing (including marketing);
• Withdraw consent at any time (where processing is based on consent).
To exercise your rights, contact info@cv-makers.co.uk. We may require verification of identity. We will respond within statutory deadlines unless a lawful extension or refusal applies.`
  },
  {
    id: 'security',
    title: '8. Security measures',
    body: `We implement reasonable technical and organisational safeguards to protect personal data, including encryption in transit, access controls, secure backups, monitoring, and staff training. No system is completely secure; if a breach affects your rights, we will notify you and the regulator in line with legal obligations.`
  },
  {
    id: 'automation',
    title: '9. Automated decision-making and profiling',
    body: `We do not use automated decision-making that produces legal or similarly significant effects on you. Limited automated processing may be used for analytics or to improve Services, but this does not override your rights. You may request more information or opt out where applicable.`
  },
  {
    id: 'changes',
    title: '10. Changes to this Policy',
    body: `We may update this Privacy Policy from time to time. Significant changes will be communicated via email or a prominent notice on our website. Otherwise, the updated Policy will be posted with a new effective date.`
  },
  {
    id: 'contact',
    title: '11. Contact & complaints',
    body: `For data-protection enquiries, requests, or complaints, contact: info@cv-makers.co.uk.
If you are not satisfied with how we handle your personal data, you have the right to lodge a complaint with the UK Information Commissioner's Office (ICO).`
  },
  {
    id: 'company-details',
    title: 'Company details',
    body: `WORKING AGENT LTD
Company number: 15957326
Registered office: 31 Auctioneers Way, Northampton, United Kingdom, NN1 1HF
Email: info@cv-makers.co.uk`
  },
];

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      sections={sections}
      effectiveDate="16.09.2025"
      lastUpdated="18.09.2025"
      version="v1.0.6"
      helpEmail="info@cv-makers.co.uk"
      showRegionToggle={false}
    />
  );
}
