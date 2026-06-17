"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "@/i18n/LocaleProvider";
import { localizePath } from "@/i18n/config";

const COPY = {
  en: {
    checking: 'Checking payment...',
    orderMissing: 'Order ID not found.',
    success: 'Payment successful!',
    processing: 'Processing...',
    failed: 'Payment failed or cancelled.',
    error: 'Error while checking payment.',
    title: 'Payment Status',
    orderId: 'Order ID',
    pending: "Don't close this page - checking transaction...",
    redirecting: 'Redirecting to dashboard...',
    backToPricing: 'Back to Pricing',
  },
  tr: {
    checking: 'Ödeme kontrol ediliyor...',
    orderMissing: 'Sipariş ID bulunamadı.',
    success: 'Ödeme başarılı!',
    processing: 'İşleniyor...',
    failed: 'Ödeme başarısız veya iptal edildi.',
    error: 'Ödeme kontrol edilirken hata oluştu.',
    title: 'Ödeme Durumu',
    orderId: 'Sipariş ID',
    pending: 'Bu sayfayı kapatmayın - işlem kontrol ediliyor...',
    redirecting: 'Dashboard sayfasına yönlendiriliyor...',
    backToPricing: 'Fiyatlandırmaya Dön',
  },
  ja: {
    checking: 'お支払いを確認しています...',
    orderMissing: '注文IDが見つかりません。',
    success: 'お支払いが完了しました！',
    processing: '処理中です...',
    failed: 'お支払いに失敗したか、キャンセルされました。',
    error: 'お支払いの確認中にエラーが発生しました。',
    title: 'お支払いステータス',
    orderId: '注文ID',
    pending: 'このページを閉じないでください — 取引を確認しています...',
    redirecting: 'ダッシュボードへリダイレクトしています...',
    backToPricing: '料金ページへ戻る',
  },
} as const;

/**
 * PionPay HTML-encodes "&" to "&amp;" in redirect URLs.
 * This causes query params like "status" to arrive as "amp;status".
 * We parse the raw search string to handle both cases.
 */
function getRawParam(search: string, key: string): string | null {
  // Remove leading "?"
  const qs = search.startsWith("?") ? search.slice(1) : search;
  for (const part of qs.split("&")) {
    // Decode the part key — handles "amp;status" → strip "amp;" prefix
    const [rawKey, ...rest] = part.split("=");
    const normalizedKey = decodeURIComponent(rawKey).replace(/^amp;/, "");
    if (normalizedKey === key) {
      return rest.length > 0 ? decodeURIComponent(rest.join("=")) : "";
    }
  }
  return null;
}

export default function PaymentProcessingClient() {
  const router = useRouter();
  const params = useSearchParams();
  const locale = useLocale();
  const copy = COPY[locale];

  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<"checking" | "pending" | "approved" | "failed" | "error">("checking");
  const [message, setMessage] = useState<string>(copy.checking);

  useEffect(() => {
    // 1. Get orderMerchantId from URL or localStorage
    const rawSearch = window.location.search;
    const paramId =
      getRawParam(rawSearch, "orderMerchantId") ||
      getRawParam(rawSearch, "orderId") ||
      getRawParam(rawSearch, "order") ||
      params.get("orderMerchantId") ||
      params.get("orderId") ||
      params.get("order");
    const storedId = localStorage.getItem("orderMerchantId");
    const finalId = paramId || storedId;

    if (!finalId) {
      setStatus("failed");
      setMessage(copy.orderMissing);
      return;
    }

    setOrderId(finalId);

    // 2. Read status returned by PionPay in the redirect URL
    // PionPay encodes "&" as "&amp;" so "status" arrives as "amp;status"
    const pionStatus =
      getRawParam(rawSearch, "status") ||
      params.get("status");

    console.log("🔍 PionPay redirect status:", pionStatus, "| orderId:", finalId);

    if (pionStatus === "failure" || pionStatus === "cancel") {
      // Immediate failure — no need to poll
      setStatus("failed");
      setMessage(copy.failed);
      localStorage.removeItem("orderMerchantId");
      return;
    }

    if (pionStatus === "success" || pionStatus === "pending" || !pionStatus) {
      // Poll the credit endpoint to confirm token crediting
      setStatus("pending");
      setMessage(copy.processing);
      pollStatus(finalId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pollStatus(id: string, attempt = 0) {
    const MAX_ATTEMPTS = 12; // ~30 seconds total
    try {
      const res = await fetch("/api/payment/credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderMerchantId: id }),
      });
      const data = await res.json();

      if (data.state === "APPROVED") {
        setStatus("approved");
        setMessage(copy.success);
        localStorage.removeItem("orderMerchantId");
        setTimeout(() => router.push(localizePath("/dashboard", locale)), 2000);
      } else if (data.state === "DECLINED") {
        setStatus("failed");
        setMessage(copy.failed);
        localStorage.removeItem("orderMerchantId");
      } else if (attempt < MAX_ATTEMPTS) {
        // Still processing — retry
        setTimeout(() => pollStatus(id, attempt + 1), 2500);
      } else {
        setStatus("error");
        setMessage(copy.error);
      }
    } catch (err) {
      console.error("Error checking payment:", err);
      if (attempt < MAX_ATTEMPTS) {
        setTimeout(() => pollStatus(id, attempt + 1), 2500);
      } else {
        setStatus("error");
        setMessage(copy.error);
      }
    }
  }

  const iconMap = {
    checking: "⏳",
    pending:  "⏳",
    approved: "✅",
    failed:   "❌",
    error:    "⚠️",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">{iconMap[status]}</div>
        <h2 className="text-2xl font-semibold mb-2">{copy.title}</h2>
        <p className="mb-3 text-gray-700">{message}</p>

        {orderId && (
          <p className="text-xs text-gray-400 mb-4">
            {copy.orderId}: <b>{orderId}</b>
          </p>
        )}

        {(status === "pending" || status === "checking") && (
          <div className="mt-2 text-gray-500 text-sm animate-pulse">{copy.pending}</div>
        )}

        {status === "approved" && (
          <div className="mt-2 text-green-600 text-sm">{copy.redirecting}</div>
        )}

        {(status === "failed" || status === "error") && (
          <button
            onClick={() => router.push(localizePath("/pricing", locale))}
            className="mt-6 inline-block px-6 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            {copy.backToPricing}
          </button>
        )}
      </div>
    </div>
  );
}
