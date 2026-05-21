"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, CreditCard, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CheckoutClient() {
  const router = useRouter();
  const [checkout, setCheckout] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load checkout details from localStorage
  useEffect(() => {
    const data = localStorage.getItem("checkoutData");
    if (!data) {
      router.push("/pricing");
    } else {
      setCheckout(JSON.parse(data));
    }
  }, [router]);

  if (!checkout) return null;

  // Handle Checkout submission and redirect
  const handleProceedToPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: checkout.email,
          amount: checkout.amount,
          currency: checkout.currency,
          tokens: checkout.tokens,
          planId: checkout.planId,
          description: checkout.description,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to initiate payment redirect.");
      }

      // Store orderMerchantId for status checking on return
      if (data.orderMerchantId) {
        localStorage.setItem("orderMerchantId", data.orderMerchantId);
      }

      // Clear the local checkout data since payment is now pending/in-progress
      localStorage.removeItem("checkoutData");

      // Redirect user's browser to the hosted PionPay payment link
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      console.error("❌ Payment redirection failed:", err);
      setError(err.message || "Something went wrong while redirecting to the payment gateway.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 grid md:grid-cols-12 overflow-hidden transform transition duration-500 hover:scale-[1.01]">
        
        {/* Left Side: Checkout overview */}
        <div className="p-8 md:p-12 md:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm tracking-wide uppercase">
              <ShieldCheck className="h-5 w-5" />
              Secure Checkout
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-6">
              Confirm your order
            </h1>

            <p className="text-gray-600 leading-relaxed mb-8">
              We are transferring you to our secure payment gateway partner, <strong>PionPay</strong>, to safely handle your transaction. No card details are processed or stored on our servers.
            </p>

            <div className="space-y-6">
              {/* Receipt info */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <Mail className="h-6 w-6 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Email Receipt</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    A confirmation invoice will be sent to:
                  </p>
                  <p className="text-sm font-semibold text-indigo-600 mt-1">
                    {checkout.email}
                  </p>
                </div>
              </div>

              {/* Secure payment info */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                <CreditCard className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-emerald-800">PCI-DSS Compliant</h3>
                  <p className="text-sm text-emerald-600 mt-0.5">
                    Payments are fully encrypted and protected using industry-standard SSL security protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600 font-medium">
                ⚠️ {error}
              </div>
            )}

            <Button
              onClick={handleProceedToPayment}
              className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl shadow-lg flex justify-center items-center gap-2 group transition-all duration-300"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Redirecting to PionPay...
                </>
              ) : (
                <>
                  Proceed to Payment
                  <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-8 md:p-12 md:col-span-5 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Plan Description</span>
                <span className="font-semibold text-gray-800">{checkout.planId}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-gray-800">
                  {checkout.amount.toFixed(2)} {checkout.currency}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Tokens Included</span>
                <span className="font-bold text-indigo-600">
                  +{checkout.tokens.toLocaleString()} tokens
                </span>
              </div>
              
              <div className="border-t border-slate-100 my-4"></div>
              
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs text-gray-400 block uppercase font-bold tracking-wider">Total Due</span>
                  <span className="text-2xl font-black text-gray-900 leading-none">
                    {checkout.total.toFixed(2)} {checkout.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>

      </div>
    </div>
  );
}
