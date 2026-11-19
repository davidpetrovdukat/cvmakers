'use client';

import { motion } from 'framer-motion';

export default function InvoiceForm() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <label className="text-xs text-slate-600 font-medium">Currency</label>
          <div className="rounded-lg border border-black/10 px-2.5 py-2 text-sm bg-slate-50 text-slate-700">
            EUR
          </div>
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs text-slate-600 font-medium">Language</label>
          <div className="rounded-lg border border-black/10 px-2.5 py-2 text-sm bg-slate-50 text-slate-700">
            EN / DE / LV
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <label className="text-xs text-slate-600 font-medium">Company (From)</label>
          <div className="rounded-lg border border-black/10 px-2.5 py-2 text-sm bg-slate-50 text-slate-700">
            Acme Ltd
          </div>
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs text-slate-600 font-medium">VAT/Reg</label>
          <div className="rounded-lg border border-black/10 px-2.5 py-2 text-sm bg-slate-50 text-slate-700">
            GB123456789
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <label className="text-xs text-slate-600 font-medium">Client (Bill To)</label>
          <div className="rounded-lg border border-black/10 px-2.5 py-2 text-sm bg-slate-50 text-slate-700">
            Client GmbH
          </div>
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs text-slate-600 font-medium">VAT/Reg</label>
          <div className="rounded-lg border border-black/10 px-2.5 py-2 text-sm bg-slate-50 text-slate-700">
            DE123456789
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-1.5">
          <label className="text-xs text-slate-600 font-medium">Number</label>
          <div className="rounded-lg border border-black/10 px-2.5 py-2 text-sm bg-slate-50 text-slate-700">
            INV-2025-000245
          </div>
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs text-slate-600 font-medium">Date</label>
          <div className="rounded-lg border border-black/10 px-2.5 py-2 text-sm bg-slate-50 text-slate-700">
            02 Sep 2025
          </div>
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs text-slate-600 font-medium">Due</label>
          <div className="rounded-lg border border-black/10 px-2.5 py-2 text-sm bg-slate-50 text-slate-700">
            16 Sep 2025
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-slate-600">Line items</div>
        <div className="space-y-2">
          <motion.div
            className="grid grid-cols-12 gap-1 text-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="col-span-5 rounded-lg border border-black/10 px-2 py-1.5 bg-slate-50 text-slate-700">
              Service #1
            </div>
            <div className="col-span-2 rounded-lg border border-black/10 px-2 py-1.5 bg-slate-50 text-slate-700">
              1
            </div>
            <div className="col-span-3 rounded-lg border border-black/10 px-2 py-1.5 bg-slate-50 text-slate-700">
              €100.00
            </div>
            <div className="col-span-2 rounded-lg border border-black/10 px-2 py-1.5 bg-slate-50 text-slate-700">
              0%
            </div>
          </motion.div>
          <motion.div
            className="grid grid-cols-12 gap-1 text-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="col-span-5 rounded-lg border border-black/10 px-2 py-1.5 bg-slate-50 text-slate-700">
              Service #2
            </div>
            <div className="col-span-2 rounded-lg border border-black/10 px-2 py-1.5 bg-slate-50 text-slate-700">
              1
            </div>
            <div className="col-span-3 rounded-lg border border-black/10 px-2 py-1.5 bg-slate-50 text-slate-700">
              €100.00
            </div>
            <div className="col-span-2 rounded-lg border border-black/10 px-2 py-1.5 bg-slate-50 text-slate-700">
              0%
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-1.5">
          <label className="text-xs text-slate-600 font-medium">Discount %</label>
          <div className="rounded-lg border border-black/10 px-2.5 py-2 text-sm bg-slate-50 text-slate-700">
            0
          </div>
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs text-slate-600 font-medium">Shipping</label>
          <div className="rounded-lg border border-black/10 px-2.5 py-2 text-sm bg-slate-50 text-slate-700">
            0.00
          </div>
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs text-slate-600 font-medium">Tax total</label>
          <div className="rounded-lg border border-black/10 px-2.5 py-2 text-sm bg-slate-50 text-slate-700">
            auto
          </div>
        </div>
      </div>

      <div className="pt-2">
        <p className="text-xs text-slate-500">
          This is a preview. Full functionality available after registration.
        </p>
      </div>
    </div>
  );
}

