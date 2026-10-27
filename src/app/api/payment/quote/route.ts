import { NextResponse } from "next/server";
import { CheckoutError, resolveCheckoutItem } from "@/lib/checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns the exact amount and token count the server will charge for a checkout choice.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  try {
    const item = await resolveCheckoutItem({
      planId: body.planId,
      customAmount: body.customAmount,
      currency: body.currency,
    });
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    console.error("❌ Checkout quote error:", err);
    return NextResponse.json({ ok: false, error: "Failed to price checkout" }, { status: 500 });
  }
}
