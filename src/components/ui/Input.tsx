'use client';

import { motion } from 'framer-motion';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', wrapperClassName = '', ...props }, ref) => {
    return (
      <div className={`grid gap-1.5 ${wrapperClassName}`}>
        {label && (
          <label className="text-xs text-[#475569] font-medium">
            {label}
          </label>
        )}
        <motion.input
          ref={ref}
          className={`w-full rounded-lg border border-[#E2E8F0] px-2.5 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-600/20 transition-all duration-200 ${className}`}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          {...(props as any)}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
