'use client';

import { ReactNode } from 'react';

type Option = { label: ReactNode; value: string };

interface SegmentedProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function Segmented({ options, value, onChange, className = '' }: SegmentedProps) {
  return (
    <div className={`inline-flex rounded-xl border border-[#E2E8F0] bg-white p-1 ${className}`}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-sm rounded-lg ${value === o.value ? 'bg-indigo-600 text-white' : 'text-[#475569] hover:bg-[#E2E8F0]'}`}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
