'use client';

import { ReactNode } from 'react';

type Variant = 'info' | 'success' | 'error';

interface AlertProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

const styles: Record<Variant, string> = {
  info: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-rose-50 border-rose-200 text-rose-800',
};

export default function Alert({ variant = 'info', children, className = '' }: AlertProps) {
  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${styles[variant]} ${className}`}>
      {children}
    </div>
  );
}

