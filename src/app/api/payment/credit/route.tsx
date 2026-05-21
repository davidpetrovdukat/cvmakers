import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PionPayClient } from "@/lib/pionpay";
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

    // 2. Return immediately if already approved to prevent double processing
    if (order.status === "APPROVED") {
      return NextResponse.json({
        ok: true,
        state: "APPROVED",
        tokensAdded: order.tokens,
      });
    }

    // 3. Check transaction status on PionPay API
    const pionPay = new PionPayClient();
    let pionPayStatusResponse;
    try {
      pionPayStatusResponse = await pionPay.checkStatusInvoice(orderMerchantId);
    } catch (apiError: any) {
      console.error(`❌ Error querying PionPay API for invoice ${orderMerchantId}:`, apiError);
      return NextResponse.json({
        ok: false,
        error: "Failed to check payment status with the gateway",
      }, { status: 502 });
    }

    // 4. Verify transaction states
    const transactions = pionPayStatusResponse?.transactions || [];
    const successfulTx = transactions.find(
      (tx: any) => tx.status === "Completed" || tx.statusCode === 4
    );
    const failedTx = transactions.find(
      (tx: any) => tx.status === "Declined" || tx.statusCode === 99
    );

    if (successfulTx) {
      // Order completed successfully: run credit logic
      const result = await approveAndCreditOrder(
        orderMerchantId,
        successfulTx.transactionId,
        successfulTx
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

    if (failedTx) {
      console.log(`❌ PionPay declined payment for order ${orderMerchantId}: ${failedTx.reason || "Declined"}`);
      
      // Update local order status to DECLINED
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "DECLINED",
          orderSystemId: String(failedTx.transactionId),
          response: {
            pionPayDetails: failedTx,
            timestamp: new Date().toISOString(),
          },
        },
      });

      return NextResponse.json({
        ok: true,
        state: "DECLINED",
      });
    }

    // Still processing
    return NextResponse.json({
      ok: true,
      state: "PROCESSING",
    });

  } catch (err: any) {
    console.error("❌ Polling status check error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
