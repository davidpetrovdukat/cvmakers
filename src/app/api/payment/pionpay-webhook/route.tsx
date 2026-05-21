import { NextResponse } from "next/server";
import { approveAndCreditOrder } from "@/lib/payment-utils";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the webhook request (if Basic Auth headers are configured by PionPay)
    const authHeader = req.headers.get("authorization");
    const expectedPublicId = process.env.PIONPAY_PUBLIC_ID;
    const expectedApiSecret = process.env.PIONPAY_API_SECRET;

    if (expectedPublicId && expectedApiSecret && authHeader && authHeader.startsWith("Basic ")) {
      try {
        const credentials = Buffer.from(authHeader.substring(6), "base64").toString("ascii");
        const [publicId, apiSecret] = credentials.split(":");
        if (publicId !== expectedPublicId || apiSecret !== expectedApiSecret) {
          console.warn("⚠️ Unauthorized PionPay Webhook attempt: invalid credentials.");
          return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
      } catch (err) {
        console.error("❌ Failed to decode webhook Authorization header:", err);
        return NextResponse.json({ success: false, error: "Bad Request Credentials" }, { status: 400 });
      }
    }

    const body = await req.json();
    console.log("💳 Received PionPay Webhook Notification:", JSON.stringify(body, null, 2));

    // 2. Extract transaction parameters, supporting multiple formats (root fields, model, transaction wrapper)
    const invoiceId = body.invoiceId || body.orderMerchantId || body.model?.invoiceId || body.transaction?.invoiceId;
    const transactionId = body.transactionId || body.model?.transactionId || body.transaction?.id;
    const status = body.status || body.model?.status || body.transaction?.status;
    const statusCode = body.statusCode || body.model?.statusCode || body.transaction?.statusCode;
    const isSuccess = body.success === true || body.success === "true" || body.model?.success === true;

    if (!invoiceId) {
      console.warn("⚠️ Webhook received but missing invoiceId/orderMerchantId parameter.");
      return NextResponse.json({ success: false, error: "Missing invoiceId" }, { status: 400 });
    }

    // 3. Determine if the transaction state indicates completion
    const isCompleted =
      status === "Completed" ||
      status === "PayoutCompleted" ||
      statusCode === 4 ||
      statusCode === 7 ||
      (isSuccess && (status === undefined || status !== "Declined"));

    if (isCompleted) {
      console.log(`✅ Webhook confirmed success for invoice: ${invoiceId}. Crediting order...`);
      
      const result = await approveAndCreditOrder(
        invoiceId,
        transactionId || `tx_${Date.now()}`,
        body
      );

      return NextResponse.json({
        success: true,
        message: "Payment successfully processed",
        credited: !result.alreadyApproved,
      });
    } else {
      console.log(`ℹ️ Webhook received transaction state (${status || statusCode}) that does not trigger credits.`);
      return NextResponse.json({
        success: true,
        message: "Notification acknowledged",
      });
    }

  } catch (err: any) {
    console.error("❌ Error processing PionPay webhook:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
