"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CheckoutClient() {
  const router = useRouter();
  const [checkout, setCheckout] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 🧾 Завантаження даних із localStorage
  useEffect(() => {
    const data = localStorage.getItem("checkoutData");
    if (!data) router.push("/pricing");
    else setCheckout(JSON.parse(data));
  }, [router]);

  if (!checkout) return null;

  // ✅ Валідація форми
  const validationSchema = Yup.object({
    cardNumber: Yup.string()
      .matches(/^[0-9 ]+$/, "Only digits allowed")
      .min(19, "Invalid card number")
      .required("Required"),
    expiry: Yup.string()
      .matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "MM/YY")
      .required("Required"),
    cvv: Yup.string().matches(/^[0-9]{3,4}$/, "Invalid CVV").required("Required"),
    name: Yup.string().required("Required"),
    address: Yup.string().required("Required"),
    city: Yup.string().required("Required"),
    postalCode: Yup.string().required("Required"),
  });

  // 🔢 Форматування
  const formatCardNumber = (value: string) =>
    value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();

  const formatExpiry = (value: string) =>
    value.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(?=\d)/, "$1/").trim();

  // 💳 Надсилання форми
  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      setLoading(true);
      const payload = { ...checkout, card: values };

      const res = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.ok) {
        alert(data.error || "Payment failed. Please try again.");
        return;
      }

      // Платеж успешно обработан
      console.log("✅ Payment approved:", data.orderMerchantId);
      
      // Сохраняем orderMerchantId для истории
      if (data.orderMerchantId) {
        localStorage.setItem("orderMerchantId", data.orderMerchantId);
      }

      // Показываем сообщение об успехе
      setSuccess(true);
      
      // Очищаем данные checkout
      localStorage.removeItem("checkoutData");

      // Редирект на dashboard через 2 секунды
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("❌ Payment error:", err);
      alert("Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // 🧾 UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100 grid md:grid-cols-2 overflow-hidden">
        {/* 💳 Payment Form */}
        <div className="p-8 md:p-10">
          <h1 className="text-2xl font-semibold text-gray-800 mb-8">Payment details</h1>
          <Formik
            initialValues={{
              cardNumber: "",
              expiry: "",
              cvv: "",
              name: "",
              address: "",
              city: "",
              postalCode: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form className="space-y-5">
                <div>
                  <label className="text-sm text-gray-600">Card number</label>
                  <Field
                    name="cardNumber"
                    value={values.cardNumber}
                    onChange={(e: any) =>
                      setFieldValue("cardNumber", formatCardNumber(e.target.value))
                    }
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="border border-gray-300 p-3 mt-1 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <ErrorMessage name="cardNumber" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">Expiry</label>
                    <Field
                      name="expiry"
                      value={values.expiry}
                      onChange={(e: any) =>
                        setFieldValue("expiry", formatExpiry(e.target.value))
                      }
                      placeholder="MM/YY"
                      maxLength={5}
                      className="border border-gray-300 p-3 mt-1 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <ErrorMessage name="expiry" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">CVV</label>
                    <Field
                      name="cvv"
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      className="border border-gray-300 p-3 mt-1 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <ErrorMessage name="cvv" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                </div>

                <Field
                  name="name"
                  placeholder="John Doe"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                />
                <Field
                  name="address"
                  placeholder="123 Main Street"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                />
                <div className="flex gap-4">
                  <Field
                    name="city"
                    placeholder="London"
                    className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <Field
                    name="postalCode"
                    placeholder="E1 6AN"
                    className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                {success ? (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-green-800 font-semibold">✅ Payment successful!</p>
                    <p className="text-green-600 text-sm mt-1">Redirecting to dashboard...</p>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 mt-4"
                    size="lg"
                    disabled={isSubmitting || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Pay {checkout.total.toFixed(2)} {checkout.currency}</>
                    )}
                  </Button>
                )}
              </Form>
            )}
          </Formik>
        </div>

        {/* 🧾 Summary */}
        <div className="bg-gray-50 border-l border-gray-100 p-8 md:p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between"><span>Plan</span><span className="font-medium">{checkout.planId}</span></div>
              <div className="flex justify-between"><span>Price</span><span>{checkout.amount.toFixed(2)} {checkout.currency}</span></div>
              <div className="flex justify-between"><span>VAT ({checkout.vatRate}%)</span><span>{checkout.vatAmount.toFixed(2)} {checkout.currency}</span></div>
              <div className="border-t border-gray-300 my-3"></div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{checkout.total.toFixed(2)} {checkout.currency}</span>
              </div>
            </div>
            <p className="mt-5 text-sm text-gray-500">
              Invoice will be sent to <b>{checkout.email}</b>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
