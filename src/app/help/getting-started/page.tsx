'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { SERVICE_COSTS } from '@/lib/currency';

const STEP_CONFIG = [
  {
    id: 'create-account',
    title: 'Create your account',
    description: 'Sign up with email and password, then verify your account.',
    details: [
      'Enter your email address and create a secure password',
      'Check your email for verification link',
      'Complete your profile setup'
    ],
    cta: 'Sign up now',
    ctaLink: '/auth/signin',
    tip: 'Use a business email for better organization',
    icon: '👤'
  },
  {
    id: 'company-settings',
    title: 'Add your details',
    description: 'Configure your personal information for professional CV and resume.',
    details: [
      'Add your details',
      'Name',
      'Surname',
      'E-mail',
      'Phone'
    ],
    cta: 'Open your settings',
    ctaLink: '/dashboard',
    tip: 'You can update these details anytime',
    icon: '🧾'
  },
  {
    id: 'top-up-tokens',
    title: 'Top up tokens',
    description: 'Purchase tokens and create your dream CV and resume.',
    details: [
      'Choose from £/€5, £/€15, £/€30 or custom amount',
      'Tokens never expire - use them when needed',
      'VAT is calculated at checkout based on your location',
      'Manual billing handled by support'
    ],
    cta: 'Buy tokens',
    ctaLink: '/pricing',
    tip: 'Previewing CV and resume is completely free',
    icon: '💳'
  },
  {
    id: 'first-invoice',
    title: 'Create your first CV or resume',
    description: 'Build your CV or resume with structured sections.',
    details: [
      'Add your information (name, surname, email, phone)',
      'Enter your personal details',
      'Add summary, experience, education and skills',
      'Preview your CV or resume',
      'Save draft before generating PDF or DOCX files'
    ],
    cta: 'Create CV or resume',
    ctaLink: '/create-cv',
    tip: 'You can revisit drafts anytime before exporting.',
    icon: '📝'
  },
  {
    id: 'send-download',
    title: 'Download or Edit',
    description: 'Decide whether to keep editing or export your finished document.',
    details: [
      'Create an editable Draft',
      'Generate PDF or DOCX file',
      'Use AI to upgrade your CV or resume',
      'Use personal manager assistance to upgrade your CV or resume'
    ],
    cta: 'Create CV or resume',
    ctaLink: '/create-cv',
    note: `Creating a PDF or resume deducts ${SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF} tokens from your balance`,
    icon: '📤'
  }
];

export default function GettingStartedPage() {
  const { data: session } = useSession();
  const steps = useMemo(() => {
    const base = STEP_CONFIG.map(step => ({ ...step }));
    base[1] = { ...base[1], ctaLink: session ? '/dashboard' : '/auth/signin?mode=login' };
    return base;
  }, [session]);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Track step view
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'gs_step_view', {
        step_id: steps[activeStep].id,
        step_number: activeStep + 1,
      });
    }
  }, [activeStep, steps]);

  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex);
  };

  const handleCtaClick = (stepId: string, ctaText: string) => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'gs_cta_click', {
        step_id: stepId,
        cta_text: ctaText,
      });
    }
  };

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sticky TOC */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Getting Started</h2>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>Progress</span>
                    <span>{activeStep + 1} of {steps.length}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <motion.div
                      className="bg-emerald-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Step Navigation */}
                <nav className="space-y-2">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                        activeStep === index
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{step.icon}</span>
                        <div>
                          <div className="font-medium">{step.title}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            Step {index + 1}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Hero */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Get started in 5 minutes
              </h1>
              <p className="text-lg text-slate-600 mb-8">
                Follow these simple steps to create your first professional CV or resume
              </p>
              
              {/* Mini Checklist */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 max-w-2xl mx-auto">
                <h3 className="font-semibold text-slate-900 mb-4">Quick checklist</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        completedSteps.has(index) 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {completedSteps.has(index) ? 'вњ“' : index + 1}
                      </div>
                      <span className="text-slate-700">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Step */}
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-8">
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-4xl">{steps[activeStep].icon}</div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {steps[activeStep].title}
                      </h2>
                      <p className="text-lg text-slate-600 mb-4">
                        {steps[activeStep].description}
                      </p>
                    </div>
                  </div>

                  {/* Step Details */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-900 mb-3">What you'll do:</h3>
                    <ul className="space-y-2">
                      {steps[activeStep].details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-slate-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tips and Notes */}
                  {steps[activeStep].tip && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="text-indigo-600 font-semibold text-sm">💡 Tip</div>
                        <p className="text-indigo-800 text-sm">{steps[activeStep].tip}</p>
                      </div>
                    </div>
                  )}

                  {steps[activeStep].note && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="text-amber-600 font-semibold text-sm">📌 Note</div>
                        <p className="text-amber-800 text-sm">{steps[activeStep].note}</p>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="flex gap-4">
                    <Button
                      href={steps[activeStep].ctaLink}
                      size="lg"
                      onClick={() => handleCtaClick(steps[activeStep].id, steps[activeStep].cta)}
                    >
                      {steps[activeStep].cta}
                    </Button>
                    
                    {activeStep < steps.length - 1 && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setCompletedSteps(prev => new Set([...prev, activeStep]));
                          setActiveStep(activeStep + 1);
                        }}
                      >
                        Mark as complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === activeStep
                        ? 'bg-emerald-500'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                disabled={activeStep === steps.length - 1}
              >
                Next
              </Button>
            </div>

            {/* Next Steps */}
            {activeStep === steps.length - 1 && (
              <div className="mt-12 text-center">
                <Card className="bg-gradient-to-r from-emerald-50 to-indigo-50 border-emerald-200">
                  <div className="p-8">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">
                      рџЋ‰ Congratulations! You're all set
                    </h3>
                    <p className="text-slate-600 mb-6">
                      You now know how to create professional CV and resume. 
                      Need help with billing or have questions? Check out our resources below.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button href="/help/billing-tokens" size="lg">
                        Next: Billing & Tokens
                      </Button>
                      <Button href="/create-cv" variant="outline" size="lg">
                        Create CV or resume
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}




