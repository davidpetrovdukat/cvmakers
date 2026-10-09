import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corefyClient } from "@/lib/corefy";
import { approveAndCreditOrder } from "@/lib/payment-utils";

export async function POST(req: Request) {
  try {
    const { orderMerchantId } = await req.json();
    if (!orderMerchantId) {
      return NextResponse.json({ ok: false, error: "Missing orderMerchantId" }, { status: 400 });
    }

    // 1. Check local order status
    const order = await prisma.order.findUnique({
      where: { orderMerchantId },
    });

    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    // 2. Return immediately if already approved to prevent duplicate processing
    if (order.status === "APPROVED") {
      return NextResponse.json({
        ok: true,
        state: "APPROVED",
        tokensAdded: order.tokens,
      });
    }

    if (order.status === "DECLINED" || order.status === "FAILED") {
      return NextResponse.json({
        ok: true,
        state: "DECLINED",
      });
    }

    // 3. If order has a Corefy invoice ID (orderSystemId), check status with Corefy
    if (order.orderSystemId) {
      try {
        const corefyData = await corefyClient.getInvoice(order.orderSystemId);
        const invoiceAttributes = corefyData?.data?.attributes || {};
        const invoiceStatus = invoiceAttributes.status;

        console.log(`🔍 Corefy invoice status for order ${orderMerchantId}:`, invoiceStatus);

        if (invoiceStatus === "processed") {
          // Order completed successfully: run credit logic
          const result = await approveAndCreditOrder(
            orderMerchantId,
            order.orderSystemId,
            corefyData
          );

          return NextResponse.json({
            ok: true,
            state: "APPROVED",
            tokensAdded: result.tokensAdded,
            tokenBalance: result.newBalance,
            invoiceCreated: result.invoiceCreated,
            invoiceSent: result.invoiceSent,
          });
        }

        if (invoiceStatus === "process_failed" || invoiceStatus === "authorize_failed") {
          console.log(`❌ Corefy rejected payment for order ${orderMerchantId}`);

          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "DECLINED",
              response: {
                corefyDetails: corefyData,
                timestamp: new Date().toISOString(),
              },
            },
          });

          return NextResponse.json({
            ok: true,
            state: "DECLINED",
          });
        }
      } catch (apiError: any) {
        console.warn(`⚠️ Could not verify Corefy status via API for ${orderMerchantId}:`, apiError.message);
        // Continue polling rather than failing immediately
      }
    }

    // Still processing / waiting for webhook
    return NextResponse.json({
      ok: true,
      state: "PROCESSING",
    });

  } catch (err: any) {
    console.error("❌ Corefy status check error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to check order status" },
      { status: 500 }
    );
  }
}
