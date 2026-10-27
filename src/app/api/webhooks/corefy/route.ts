import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corefyClient } from "@/lib/corefy";
import { settleOrder } from "@/lib/payment-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const incomingSig =
      req.headers.get("x-signature") ||
      req.headers.get("signature") ||
      req.headers.get("http_x_signature");

    // 1. Verify HMAC-SHA256 signature
    const isValid = corefyClient.verifySignature(rawBody, incomingSig);
    if (!isValid) {
      console.warn("⚠️ Corefy Webhook signature mismatch.");
      return NextResponse.json({ error: "Signature mismatch" }, { status: 403 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.log("💳 Received Corefy Webhook Notification:", JSON.stringify(payload, null, 2));

    const invoiceData = payload?.data;
    const attributes = invoiceData?.attributes || {};
    const invoiceId = invoiceData?.id;
    const referenceId = attributes.reference_id || attributes.metadata?.order_id;

    if (!referenceId && !invoiceId) {
      console.warn("⚠️ Webhook received without reference_id or invoice id.");
      return NextResponse.json({ status: "ok" });
    }

    // 2. Find the order
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(referenceId ? [{ orderMerchantId: referenceId }] : []),
          ...(invoiceId ? [{ orderSystemId: invoiceId }] : []),
        ],
      },
    });

    if (!order) {
      console.warn(`⚠️ Order not found for referenceId: ${referenceId}, invoiceId: ${invoiceId}`);
      return NextResponse.json({ status: "ok" });
    }

    // 3. The webhook only triggers a check: the status comes from the Corefy API
    const result = await settleOrder(order);
    console.log(`💳 Corefy webhook settled order ${order.orderMerchantId}: ${result.state}`);

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("❌ Error in Corefy webhook handler:", err);
    return NextResponse.json(
      { error: err.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
