import { PricingPlan, Testimonial, Feature, TemplateInfo } from '@/types';
import { convertToTokens, formatCurrency } from './currency';

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Quick Start',
    price: formatCurrency(5.00, 'GBP'),
    points: ['Manual token top-up', 'No subscription', 'Preview included'],
    cta: 'Buy Tokens',
    popular: false,
  },
  {
    name: 'Job Hunter',
    price: formatCurrency(15.00, 'GBP'),
    points: ['Manual token top-up', 'Branding options', 'Priority support'],
    cta: 'Buy Tokens',
    popular: true,
  },
  {
    name: 'Career Boost',
    price: formatCurrency(30.00, 'GBP'),
    points: ['Manual token top-up', 'Team access', 'Integrations roadmap'],
    cta: 'Buy Tokens',
    popular: false,
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Marta K.',
    role: 'Freelance Designer',
    text: 'Finally painless invoices. Two clicks and the client gets a VAT-correct bill.',
  },
  {
    name: 'Anders L.',
    role: 'Construction PM',
    text: "Love the live preview - it's easy to explain what's included and why.",
  },
  {
    name: 'Nicolas D.',
    role: 'IT Services',
    text: 'Saved clients & items as presets sped everything up for us.',
  },
];

export const FEATURES: Feature[] = [
  {
    id: 'singleColumn',
    title: 'Single-column form',
    description: 'Lower cognitive load, logically grouped fields.',
    metric: '-32% time to first invoice',
  },
  {
    id: 'livePreview',
    title: 'Live PDF preview',
    description: 'What you see is exactly what your client gets.',
    metric: '-18% corrections',
  },
  {
    id: 'multiCurrency',
    title: 'Multi-currency / VAT',
    description: 'Correct totals, tax breakdowns, number formats.',
    metric: '0 errors in totals (test suite)',
  },
  {
    id: 'autoSave',
    title: 'Auto-save & numbering',
    description: 'Drafts and INV-{YYYY}-{#####} sequencing.',
    metric: 'No lost drafts',
  },
];

export const TEMPLATE_CATEGORIES = [
  'Freelance',
  'Construction',
  'IT Services',
  'Consulting',
  'Retail',
  'Healthcare',
  'Education',
  'Non-profit',
];

export const TEMPLATES: TemplateInfo[] = [
  { id: 'freelance', name: 'Freelance', status: 'available', badge: 'Available', cta: 'use' },
  { id: 'construction', name: 'Construction', status: 'preview', badge: 'Coming soon', cta: 'waitlist' },
  { id: 'it', name: 'IT Services', status: 'preview', badge: 'Coming soon', cta: 'waitlist' },
  { id: 'consulting', name: 'Consulting', status: 'preview', badge: 'Coming soon', cta: 'waitlist' },
  { id: 'retail', name: 'Retail', status: 'preview', badge: 'Coming soon', cta: 'waitlist' },
  { id: 'healthcare', name: 'Healthcare', status: 'preview', badge: 'Coming soon', cta: 'waitlist' },
  { id: 'education', name: 'Education', status: 'preview', badge: 'Coming soon', cta: 'waitlist' },
  { id: 'nonprofit', name: 'Non-profit', status: 'preview', badge: 'Coming soon', cta: 'waitlist' },
];

