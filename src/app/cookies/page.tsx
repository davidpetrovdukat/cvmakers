import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';

export const metadata = {
  title: 'Cookies Policy - CV Makers',
  description: 'Details on how CV Makers uses cookies and similar technologies.',
};

const sections: PolicySection[] = [
  {
    id: 'overview',
    title: '1. Overview',
    body: `This Cookies Policy explains how cv-makers.co.uk, operated by WORKING AGENT LTD (Company No. 15957326, registered office: 31 Auctioneers Way, Northampton, United Kingdom, NN1 1HF), uses cookies and similar technologies (for example localStorage, sessionStorage, pixels, and other local identifiers) on our website and services. This Policy complements our Privacy Policy. By using the site or interacting with the cookie banner, you can manage or give consent to non-essential cookies as described below.`
  },
  {
    id: 'what-are-cookies',
    title: '2. What are cookies?',
    body: `Cookies are small text files or browser entries placed on your device when you visit websites. They help the site function properly (for example, keeping you logged in), remember your preferences, improve performance, and — with your consent — enable analytics and marketing features.`
  },
  {
    id: 'categories',
    title: '3. Categories of cookies we use',
    body: `We use cookies for limited purposes. Main categories include:
• Essential / Necessary — required for core platform functions (login, session management, basic security). These are strictly necessary and do not require consent.
• Functional — remember preferences and UI settings (language, layout, display options).
• Performance / Analytics — collect aggregated usage data (page views, load times, errors) to improve reliability. These may operate under legitimate interests or consent depending on the tool.
• Marketing / Advertising — used only with your consent: campaign tracking, remarketing, personalised content.
• Security / Anti-abuse — help detect suspicious activity, fraud, bots, and misuse of the site.`
  },
  {
    id: 'examples',
    title: '4. Typical cookies (examples)',
    body: `Cookie names, lifetimes, and providers may change. Current details are available in the cookie control panel on the website. Typical examples include:
Cookie name	Purpose	Category	Typical lifetime
session_id	Keeps you signed in / session	Essential	Session
csrf_token	CSRF protection	Essential	Session
cookie_consent	Stores your cookie choices	Functional	6–12 months
ui_prefs	Saves language or UI settings	Functional	~6 months
_ga, _gid	Basic aggregated analytics	Performance/Analytics	1–24 months
campaign_src	Tracks campaign attribution	Marketing	30–90 days`
  },
  {
    id: 'consent',
    title: '5. Consent and lawful basis',
    body: `• Essential cookies are used without consent because they are required for the Service to function.
• Non-essential cookies (functional, analytics, marketing) are only set after you give consent via our cookie banner or settings, except where we rely on legitimate interests for limited analytics or security.
• Legal bases include performance of contract, consent, and legitimate interests (e.g., preventing fraud, improving service, defending against disputes).`
  },
  {
    id: 'records',
    title: '6. How we record and retain consent',
    body: `When you provide consent, we record the version of the consent text shown, the timestamp, your IP address, and browser information as evidence of your choice. Consent records are kept for at least 24 months and up to 6 years for enterprise or disputed matters, consistent with our Privacy Policy.`
  },
  {
    id: 'third-parties',
    title: '7. Third parties and international transfers',
    body: `We work with third-party providers (payment processors, hosting/cloud services, analytics, marketing, customer support platforms) that may set cookies or similar identifiers. Some providers operate outside the UK/EEA. Where data is transferred internationally, we rely on safeguards such as UK adequacy decisions, Standard Contractual Clauses (SCCs), or equivalent lawful mechanisms. A list of active providers is available in the cookie settings panel.`
  },
  {
    id: 'manage',
    title: '8. How to manage or withdraw cookie consent',
    body: `• Use the cookie banner or cookie settings panel on the site to accept, decline, or customise non-essential cookies.
• You can withdraw or change consent at any time via the cookie settings link in the site footer.
• You can also clear cookies through your browser or use private/incognito mode. Please note: disabling some cookies may reduce functionality (for example, you may be logged out or preferences may not be saved).`
  },
  {
    id: 'changes',
    title: '9. Changes to this Policy',
    body: `We may update this Cookies Policy from time to time (for example, if new tools are integrated). Material changes will be communicated by a notice on the website or by email to registered users. The effective date will always be updated accordingly.`
  },
  {
    id: 'contact',
    title: '10. Contact',
    body: `If you have questions about cookies or this Policy, contact us at:
📧 info@cv-makers.co.uk
📍 WORKING AGENT LTD, 31 Auctioneers Way, Northampton, United Kingdom, NN1 1HF`
  },
];

export default function CookiesPage() {
  return (
    <PolicyPage
      title="Cookies Policy"
      sections={sections}
      effectiveDate="01.09.2025"
      lastUpdated="18.09.2025"
      version="v1.0.6"
      helpEmail="info@cv-makers.co.uk"
      showRegionToggle={false}
    />
  );
}
