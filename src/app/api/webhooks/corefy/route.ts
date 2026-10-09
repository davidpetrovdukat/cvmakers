import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corefyClient } from "@/lib/corefy";
import { approveAndCreditOrder } from "@/lib/payment-utils";

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
    const status = attributes.status;

    if (!referenceId && !invoiceId) {
      console.warn("⚠️ Webhook received without reference_id or invoice id.");
      return NextResponse.json({ status: "ok" });
    }

    // Find the order
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

    // Handle statuses
    if (status === "processed") {
      console.log(`✅ Corefy confirmed payment for order ${order.orderMerchantId}. Crediting tokens...`);
      await approveAndCreditOrder(
        order.orderMerchantId!,
        invoiceId || `tx_${Date.now()}`,
        payload
      );
    } else if (status === "process_failed" || status === "authorize_failed") {
      console.log(`❌ Corefy payment failed/rejected for order ${order.orderMerchantId}`);
      if (order.status !== "APPROVED") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "DECLINED",
            orderSystemId: invoiceId ? String(invoiceId) : order.orderSystemId,
            response: {
              corefyDetails: payload,
              timestamp: new Date().toISOString(),
            },
          },
        });
      }
    } else if (status === "expired") {
      console.log(`⌛ Corefy invoice expired for order ${order.orderMerchantId}`);
      if (order.status !== "APPROVED") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "EXPIRED",
            response: {
              corefyDetails: payload,
              timestamp: new Date().toISOString(),
            },
          },
        });
      }
    } else if (status === "refunded") {
      console.log(`↩️ Corefy invoice refunded for order ${order.orderMerchantId}`);
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "REFUNDED",
          response: {
            corefyDetails: payload,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("❌ Error in Corefy webhook handler:", err);
    return NextResponse.json(
      { error: err.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
