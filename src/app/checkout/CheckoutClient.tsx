"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useLocale } from "@/i18n/LocaleProvider";
import { localizePath } from "@/i18n/config";

const COPY = {
  en: {
    paymentDetails: 'Payment details',
    cardNumber: 'Card number',
    expiry: 'Expiry',
    cvv: 'CVV',
    namePlaceholder: 'John Doe',
    addressPlaceholder: '123 Main Street',
    cityPlaceholder: 'London',
    postalPlaceholder: 'E1 6AN',
    success: 'Payment successful!',
    redirecting: 'Redirecting to dashboard...',
    processing: 'Processing...',
    pay: 'Pay',
    orderSummary: 'Order Summary',
    plan: 'Plan',
    price: 'Price',
    total: 'Total',
    invoice: 'Invoice will be sent to',
    failed: 'Payment failed. Please try again.',
    processingFailed: 'Payment processing failed. Please try again.',
    validation: {
      digits: 'Only digits allowed',
      card: 'Invalid card number',
      required: 'Required',
      expiry: 'MM/YY',
      cvv: 'Invalid CVV',
    },
  },
  tr: {
    paymentDetails: 'Ödeme bilgileri',
    cardNumber: 'Kart numarası',
    expiry: 'Son kullanma',
    cvv: 'CVV',
    namePlaceholder: 'Ad Soyad',
    addressPlaceholder: 'Adres',
    cityPlaceholder: 'Şehir',
    postalPlaceholder: 'Posta kodu',
    success: 'Ödeme başarılı!',
    redirecting: 'Dashboard sayfasına yönlendiriliyor...',
    processing: 'İşleniyor...',
    pay: 'Öde',
    orderSummary: 'Sipariş Özeti',
    plan: 'Plan',
    price: 'Fiyat',
    total: 'Toplam',
    invoice: 'Fatura şu adrese gönderilecek:',
    failed: 'Ödeme başarısız. Lütfen tekrar deneyin.',
    processingFailed: 'Ödeme işlenemedi. Lütfen tekrar deneyin.',
    validation: {
      digits: 'Yalnızca rakam kullanılabilir',
      card: 'Geçersiz kart numarası',
      required: 'Zorunlu',
      expiry: 'AA/YY',
      cvv: 'Geçersiz CVV',
    },
  },
} as const;

export default function CheckoutClient() {
  const router = useRouter();
  const locale = useLocale();
  const copy = COPY[locale];
  const [checkout, setCheckout] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("checkoutData");
    if (!data) router.push(localizePath("/pricing", locale));
    else setCheckout(JSON.parse(data));
  }, [router, locale]);

  if (!checkout) return null;

  const validationSchema = Yup.object({
    cardNumber: Yup.string().matches(/^[0-9 ]+$/, copy.validation.digits).min(19, copy.validation.card).required(copy.validation.required),
    expiry: Yup.string().matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, copy.validation.expiry).required(copy.validation.required),
    cvv: Yup.string().matches(/^[0-9]{3,4}$/, copy.validation.cvv).required(copy.validation.required),
    name: Yup.string().required(copy.validation.required),
    address: Yup.string().required(copy.validation.required),
    city: Yup.string().required(copy.validation.required),
    postalCode: Yup.string().required(copy.validation.required),
  });

  const formatCardNumber = (value: string) => value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  const formatExpiry = (value: string) => value.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(?=\d)/, "$1/").trim();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      setLoading(true);
      const payload = { ...checkout, card: values, locale };
      const res = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) {
        alert(data.error || copy.failed);
        return;
      }
      if (data.orderMerchantId) localStorage.setItem("orderMerchantId", data.orderMerchantId);
      setSuccess(true);
      localStorage.removeItem("checkoutData");
      setTimeout(() => router.push(localizePath("/dashboard", locale)), 2000);
    } catch (err) {
      console.error("Payment error:", err);
      alert(copy.processingFailed);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100 grid md:grid-cols-2 overflow-hidden">
        <div className="p-8 md:p-10">
          <h1 className="text-2xl font-semibold text-gray-800 mb-8">{copy.paymentDetails}</h1>
          <Formik
            initialValues={{ cardNumber: "", expiry: "", cvv: "", name: "", address: "", city: "", postalCode: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form className="space-y-5">
                <div>
                  <label className="text-sm text-gray-600">{copy.cardNumber}</label>
                  <Field name="cardNumber" value={values.cardNumber} onChange={(e: any) => setFieldValue("cardNumber", formatCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} className="border border-gray-300 p-3 mt-1 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition" />
                  <ErrorMessage name="cardNumber" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">{copy.expiry}</label>
                    <Field name="expiry" value={values.expiry} onChange={(e: any) => setFieldValue("expiry", formatExpiry(e.target.value))} placeholder="MM/YY" maxLength={5} className="border border-gray-300 p-3 mt-1 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition" />
                    <ErrorMessage name="expiry" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">{copy.cvv}</label>
                    <Field name="cvv" type="password" placeholder="123" maxLength={4} className="border border-gray-300 p-3 mt-1 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition" />
                    <ErrorMessage name="cvv" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                </div>

                <Field name="name" placeholder={copy.namePlaceholder} className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition" />
                <Field name="address" placeholder={copy.addressPlaceholder} className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition" />
                <div className="flex gap-4">
                  <Field name="city" placeholder={copy.cityPlaceholder} className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition" />
                  <Field name="postalCode" placeholder={copy.postalPlaceholder} className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition" />
                </div>

                {success ? (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-green-800 font-semibold">{copy.success}</p>
                    <p className="text-green-600 text-sm mt-1">{copy.redirecting}</p>
                  </div>
                ) : (
                  <Button type="submit" className="w-full flex justify-center items-center gap-2 mt-4" size="lg" disabled={isSubmitting || loading}>
                    {loading ? <><Loader2 className="h-5 w-5 animate-spin" />{copy.processing}</> : <>{copy.pay} {checkout.total.toFixed(2)} {checkout.currency}</>}
                  </Button>
                )}
              </Form>
            )}
          </Formik>
        </div>

        <div className="bg-gray-50 border-l border-gray-100 p-8 md:p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">{copy.orderSummary}</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between"><span>{copy.plan}</span><span className="font-medium">{checkout.planId}</span></div>
              <div className="flex justify-between"><span>{copy.price}</span><span>{checkout.amount.toFixed(2)} {checkout.currency}</span></div>
              <div className="border-t border-gray-300 my-3" />
              <div className="flex justify-between font-semibold text-lg"><span>{copy.total}</span><span>{checkout.total.toFixed(2)} {checkout.currency}</span></div>
            </div>
            <p className="mt-5 text-sm text-gray-500">{copy.invoice} <b>{checkout.email}</b>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
