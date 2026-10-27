import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settleOrder } from "@/lib/payment-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Polled by /payment/processing after the customer returns from the payment page.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const { orderMerchantId } = await req.json().catch(() => ({}));
    if (!orderMerchantId || typeof orderMerchantId !== "string") {
      return NextResponse.json({ ok: false, error: "Missing orderMerchantId" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { orderMerchantId } });
    const ownsOrder =
      order &&
      (order.userId === userId ||
        (!order.userId && !!order.userEmail && order.userEmail === session.user.email));
    if (!order || !ownsOrder) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    try {
      const result = await settleOrder(order);
      return NextResponse.json({
        ok: true,
        state: result.state,
        tokensAdded: result.tokensAdded,
        tokenBalance: result.newBalance,
        invoiceCreated: result.invoiceCreated,
        invoiceSent: result.invoiceSent,
      });
    } catch (apiError: any) {
      // Corefy unreachable: keep polling rather than failing immediately
      console.warn(`⚠️ Could not verify Corefy status for ${orderMerchantId}:`, apiError.message);
      return NextResponse.json({ ok: true, state: "PROCESSING" });
    }
  } catch (err: any) {
    console.error("❌ Corefy status check error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to check order status" },
      { status: 500 }
    );
  }
}
