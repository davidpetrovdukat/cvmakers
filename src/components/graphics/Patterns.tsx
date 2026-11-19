'use client';

import React from 'react';

interface PatternProps {
  className?: string;
}

export function CurrencyPatternBG({ className = '' }: PatternProps) {
  // Subtle repeated euro pattern
  return (
    <svg aria-hidden="true" className={`absolute inset-0 pointer-events-none ${className}`}>
      <defs>
        <pattern id="currencies-pattern" patternUnits="userSpaceOnUse" width="80" height="40">
          <text x="10" y="20" fontSize="16" fill="currentColor" fillOpacity="0.04">€ €</text>
          <text x="40" y="35" fontSize="16" fill="currentColor" fillOpacity="0.04">€ €</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#currencies-pattern)" />
    </svg>
  );
}

export function InvoiceNumberPatternBG({ className = '' }: PatternProps) {
  // Subtle INV-{YYYY}-{#####} repeated pattern
  const sample = 'INV-{2025}-{00001}';
  return (
    <svg aria-hidden="true" className={`absolute inset-0 pointer-events-none ${className}`}>
      <defs>
        <pattern id="invoice-pattern" patternUnits="userSpaceOnUse" width="160" height="40">
          <text x="10" y="20" fontSize="12" fill="currentColor" fillOpacity="0.04">{sample}</text>
          <text x="30" y="35" fontSize="12" fill="currentColor" fillOpacity="0.04">{sample}</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#invoice-pattern)" />
    </svg>
  );
}

export function PaperPatternBG({ className = '' }: PatternProps) {
  // Light paper-like cross grid
  return (
    <svg aria-hidden="true" className={`absolute inset-0 pointer-events-none ${className}`}>
      <defs>
        <pattern id="paper-grid-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeOpacity="0.04" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#paper-grid-pattern)" />
    </svg>
  );
}
