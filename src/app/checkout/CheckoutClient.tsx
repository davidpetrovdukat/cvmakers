"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useLocale } from "@/i18n/LocaleProvider";
import { localizePath } from "@/i18n/config";

const COPY = {
  en: {
    orderSummary: 'Order Summary',
    plan: 'Plan',
    price: 'Price',
    total: 'Total',
    invoice: 'Invoice will be sent to',
    redirecting: 'Redirecting to payment gateway...',
    processing: 'Processing...',
    pay: 'Proceed to Payment',
    failed: 'Payment initiation failed. Please try again.',
  },
  tr: {
    orderSummary: 'Sipariş Özeti',
    plan: 'Plan',
    price: 'Fiyat',
    total: 'Toplam',
    invoice: 'Fatura şu adrese gönderilecek:',
    redirecting: 'Ödeme sayfasına yönlendiriliyor...',
    processing: 'İşleniyor...',
    pay: 'Ödemeye Geç',
    failed: 'Ödeme başlatılamadı. Lütfen tekrar deneyin.',
  },
  ja: {
    orderSummary: '注文概要',
    plan: 'プラン',
    price: '価格',
    total: '合計',
    invoice: '請求書は以下の宛先に送信されます：',
    redirecting: '決済ページへリダイレクトしています...',
    processing: '処理中です...',
    pay: '決済へ進む',
    failed: '決済の開始に失敗しました。もう一度お試しください。',
  },
} as const;

export default function CheckoutClient() {
  const router = useRouter();
  const locale = useLocale();
  const copy = COPY[locale];
  const [checkout, setCheckout] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("checkoutData");
    if (!data) router.push(localizePath("/pricing", locale));
    else setCheckout(JSON.parse(data));
  }, [router, locale]);

  if (!checkout) return null;

  const handlePayment = async () => {
    try {
      setLoading(true);
      const payload = { ...checkout, locale };
      const res = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.ok || !data.redirectUrl) {
        alert(data.error || copy.failed);
        return;
      }

      // Save orderMerchantId for status polling on return
      localStorage.setItem("orderMerchantId", data.orderMerchantId);
      localStorage.removeItem("checkoutData");

      // Redirect to PionPay hosted payment page
      setRedirecting(true);
      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error("Payment error:", err);
      alert(copy.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">{copy.orderSummary}</h1>

        <div className="space-y-3 text-gray-700 mb-8">
          <div className="flex justify-between">
            <span>{copy.plan}</span>
            <span className="font-medium">{checkout.planId}</span>
          </div>
          <div className="flex justify-between">
            <span>{copy.price}</span>
            <span>{checkout.amount.toFixed(2)} {checkout.currency}</span>
          </div>
          <div className="border-t border-gray-200 my-3" />
          <div className="flex justify-between font-semibold text-lg">
            <span>{copy.total}</span>
            <span>{checkout.total.toFixed(2)} {checkout.currency}</span>
          </div>
        </div>

        <p className="mb-6 text-sm text-gray-500">
          {copy.invoice} <b>{checkout.email}</b>.
        </p>

        {redirecting ? (
          <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium">
            <Loader2 className="h-5 w-5 animate-spin" />
            {copy.redirecting}
          </div>
        ) : (
          <Button
            type="button"
            className="w-full flex justify-center items-center gap-2"
            size="lg"
            disabled={loading}
            onClick={handlePayment}
          >
            {loading
              ? <><Loader2 className="h-5 w-5 animate-spin" />{copy.processing}</>
              : <>{copy.pay} — {checkout.total.toFixed(2)} {checkout.currency}</>
            }
          </Button>
        )}
      </div>
    </div>
  );
}
