'use client';

import { SelectHTMLAttributes } from 'react';

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  uiSize?: 'sm' | 'md' | 'lg';
};

export default function Select({ className = '', uiSize = 'md', ...props }: Props) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-xl',
    md: 'px-3 py-2 text-sm rounded-xl',
    lg: 'px-4 py-3 text-base rounded-xl',
  } as const;

  return (
    <select
      {...props}
      className={`w-full border border-[#E2E8F0] bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/20 ${sizeClasses[uiSize]} ${className}`}
    />
  );
}
