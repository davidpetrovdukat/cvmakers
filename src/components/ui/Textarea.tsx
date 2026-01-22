'use client';

import { motion } from 'framer-motion';
import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="grid gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[#475569]">
            {label}
          </label>
        )}
        <motion.textarea
          ref={ref}
          className={`rounded-xl border border-[#E2E8F0] px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-600/20 transition-all duration-200 resize-none ${className}`}
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

Textarea.displayName = 'Textarea';

export default Textarea;
