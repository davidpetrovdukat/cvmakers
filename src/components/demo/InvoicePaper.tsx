'use client';

import { motion } from 'framer-motion';

export default function InvoicePaper() {
  return (
    <motion.div
      className="w-full h-[520px] rounded-xl bg-white border border-black/10 shadow-sm p-6 overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between">
        <motion.div
          className="h-10 w-10 rounded-lg bg-slate-200"
          whileHover={{ rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        />
        <div className="text-right text-xs text-slate-600">
          <div>Invoice #000245</div>
          <div>Date: 02 Sep 2025</div>
          <div>Due: 16 Sep 2025</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-6 text-xs">
        <div>
          <div className="font-semibold">From</div>
          <div>Acme Ltd</div>
          <div>VAT GB123456789</div>
          <div>London, United Kingdom</div>
        </div>
        <div>
          <div className="font-semibold">Bill To</div>
          <div>Client GmbH</div>
          <div>VAT DE123456789</div>
          <div>Berlin, Germany</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-12 gap-1 text-xs font-medium border-b border-black/10 pb-2">
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-3 text-right">Rate</div>
          <div className="col-span-2 text-right">Tax</div>
        </div>

        {[1, 2].map((i) => (
          <motion.div
            key={i}
            className="grid grid-cols-12 gap-1 text-xs py-2 border-b border-black/5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="col-span-5 truncate">Service #{i}</div>
            <div className="col-span-2 text-right">1</div>
            <div className="col-span-3 text-right">€100.00</div>
            <div className="col-span-2 text-right">0%</div>
          </motion.div>
        ))}

        <motion.div
          className="mt-4 flex justify-end"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="w-64 text-xs space-y-1">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="font-mono">€200.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span>VAT</span>
              <span className="font-mono">€0.00</span>
            </div>
            <div className="flex justify-between items-center font-semibold border-t border-black/10 pt-1">
              <span>Total</span>
              <span className="font-mono">€200.00</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-4 text-[11px] text-slate-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Payment within 14 days. IBAN: GB00BANK0000000000
        </motion.div>
      </div>
    </motion.div>
  );
}

