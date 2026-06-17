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
  },
} as const;

export default function PaymentProcessingClient() {
  const router = useRouter();
  const params = useSearchParams();
  const locale = useLocale();
  const copy = COPY[locale];
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState<string>(copy.checking);

  useEffect(() => {
    setMessage(copy.checking);
  }, [copy.checking]);

  useEffect(() => {
    const paramId = params.get("order") || params.get("orderId") || params.get("orderMerchantId");
    const storedId = typeof window !== "undefined" ? localStorage.getItem("orderMerchantId") : null;
    const finalId = paramId || storedId;
    if (finalId) {
      setOrderId(finalId);
    } else {
      setStatus("failed");
      setMessage(copy.orderMissing);
    }
  }, [params, copy.orderMissing]);

  useEffect(() => {
    if (!orderId) return;

    async function checkStatus() {
      try {
        const res = await fetch("/api/payment/credit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderMerchantId: orderId }),
        });
        const data = await res.json();

        if (data.state === "APPROVED") {
          setStatus("approved");
          setMessage(copy.success);
          localStorage.removeItem("orderMerchantId");
          setTimeout(() => router.push(localizePath("/dashboard", locale)), 2000);
        } else if (data.state === "PROCESSING") {
          setStatus("pending");
          setMessage(copy.processing);
          setTimeout(checkStatus, 2500);
        } else {
          setStatus("failed");
          setMessage(copy.failed);
        }
      } catch (err) {
        console.error("Error checking payment:", err);
        setStatus("failed");
        setMessage(copy.error);
      }
    }

    checkStatus();
  }, [orderId, router, locale, copy]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-semibold mb-2">{copy.title}</h2>
        <p className="mb-3">{message}</p>
        {orderId && <p className="text-xs text-gray-500">{copy.orderId}: <b>{orderId}</b></p>}
        {status === "pending" && <div className="mt-4 text-gray-500 text-sm">{copy.pending}</div>}
      </div>
    </div>
  );
}
