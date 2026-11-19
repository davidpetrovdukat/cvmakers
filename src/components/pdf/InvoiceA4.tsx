import React from 'react';

type Party = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  vat?: string;
  address?: string;
  city?: string;
  country?: string;
  iban?: string;
  bankName?: string;
  bic?: string;
  logoUrl?: string;
};

type InvoiceLineInput = {
  description?: string;
  desc?: string;
  quantity?: number;
  qty?: number;
  rate?: number;
  tax?: number;
};

interface InvoiceA4Props {
  title?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  invoiceDue?: string;
  currency?: string;
  items?: InvoiceLineInput[];
  subtotal?: number;
  taxTotal?: number;
  total?: number;
  sender?: Party;
  client?: Party;
  notes?: string;
  footerText?: string;
}

function formatMoney(value: number, currency: string) {
  if (!Number.isFinite(value)) return `${currency} 0.00`;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function formatDate(value?: string) {
  if (!value) return undefined;
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return value;
  }
}

export default function InvoiceA4({
  title = 'Invoice',
  invoiceNo,
  invoiceDate,
  invoiceDue,
  currency = 'EUR',
  items = [],
  subtotal,
  taxTotal,
  total,
  sender,
  client,
  notes,
  footerText,
}: InvoiceA4Props) {
  const normalizedItems = items.map((item) => ({
    description: item.description ?? item.desc ?? '',
    quantity: Number(item.quantity ?? item.qty ?? 0),
    rate: Number(item.rate ?? 0),
    tax: Number(item.tax ?? 0),
  }));

  const computedSubtotal = subtotal ?? normalizedItems.reduce((sum, line) => sum + line.quantity * line.rate, 0);
  const computedTax = taxTotal ?? normalizedItems.reduce((sum, line) => sum + line.quantity * line.rate * (line.tax / 100), 0);
  const computedTotal = total ?? computedSubtotal + computedTax;

  const invoiceDateDisplay = formatDate(invoiceDate);
  const invoiceDueDisplay = formatDate(invoiceDue);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <div className="mt-1 text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              {invoiceNo && <span>No: <b>{invoiceNo}</b></span>}
              {invoiceDateDisplay && <span>Date: <b>{invoiceDateDisplay}</b></span>}
              {invoiceDueDisplay && <span>Due: <b>{invoiceDueDisplay}</b></span>}
            </div>
          </div>
          {sender?.logoUrl ? (
            <img src={sender.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
          ) : null}
        </header>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border border-black/10 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">From</div>
            <div className="mt-1 font-medium">{sender?.company || sender?.name || '-'}</div>
            <div className="mt-1 text-slate-600 space-y-0.5">
              {sender?.address && <div>{sender.address}</div>}
              {(sender?.city || sender?.country) && <div>{[sender.city, sender.country].filter(Boolean).join(', ')}</div>}
              {sender?.email && <div>{sender.email}</div>}
              {sender?.phone && <div>{sender.phone}</div>}
              {sender?.vat && <div>VAT: {sender.vat}</div>}
            </div>
            {(sender?.iban || sender?.bankName || sender?.bic) && (
              <div className="mt-2 text-slate-600 space-y-0.5">
                <div className="text-xs uppercase tracking-wide text-slate-500">Bank details</div>
                {sender?.bankName && <div>Bank: {sender.bankName}</div>}
                {sender?.iban && <div>IBAN: {sender.iban}</div>}
                {sender?.bic && <div>BIC: {sender.bic}</div>}
              </div>
            )}
          </div>
          <div className="rounded-lg border border-black/10 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">Bill to</div>
            <div className="mt-1 font-medium">{client?.company || client?.name || '-'}</div>
            <div className="mt-1 text-slate-600 space-y-0.5">
              {client?.address && <div>{client.address}</div>}
              {(client?.city || client?.country) && <div>{[client.city, client.country].filter(Boolean).join(', ')}</div>}
              {client?.email && <div>{client.email}</div>}
              {client?.vat && <div>VAT: {client.vat}</div>}
            </div>
          </div>
        </section>

        <main className="mt-6">
          <div className="rounded-lg border border-black/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold text-right">Qty</th>
                  <th className="px-4 py-3 font-semibold text-right">Rate</th>
                  <th className="px-4 py-3 font-semibold text-right">Tax %</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {normalizedItems.length ? (
                  normalizedItems.map((line, idx) => {
                    const lineSubtotal = line.quantity * line.rate;
                    const lineTax = lineSubtotal * (line.tax / 100);
                    const lineTotal = lineSubtotal + lineTax;
                    return (
                      <tr key={idx}>
                        <td className="px-4 py-3 align-top text-slate-800">{line.description}</td>
                        <td className="px-4 py-3 align-top text-right">{line.quantity.toFixed(2)}</td>
                        <td className="px-4 py-3 align-top text-right">{formatMoney(line.rate, currency)}</td>
                        <td className="px-4 py-3 align-top text-right">{line.tax.toFixed(2)}</td>
                        <td className="px-4 py-3 align-top text-right">{formatMoney(lineTotal, currency)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      No line items available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="text-sm text-slate-600 max-w-md">
              {notes && (
                <>
                  <div className="font-semibold text-slate-700">Notes</div>
                  <div className="mt-1 whitespace-pre-wrap leading-relaxed">{notes}</div>
                </>
              )}
            </div>
            <div className="w-full md:w-80 text-sm">
              <div className="flex justify-between border-b border-black/10 py-2">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">{formatMoney(computedSubtotal, currency)}</span>
              </div>
              <div className="flex justify-between border-b border-black/10 py-2">
                <span className="text-slate-600">Tax</span>
                <span className="font-medium">{formatMoney(computedTax, currency)}</span>
              </div>
              <div className="flex justify-between py-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatMoney(computedTotal, currency)}</span>
              </div>
            </div>
          </div>
        </main>

        {footerText && (
          <footer className="mt-8 text-center text-[11px] text-slate-500">
            {footerText}
          </footer>
        )}
      </div>
    </div>
  );
}

