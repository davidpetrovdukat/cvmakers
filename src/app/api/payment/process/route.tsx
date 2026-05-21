import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PionPayClient } from "@/lib/pionpay";
import { Currency } from "@/lib/currency";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.email || !body.amount || !body.currency || !body.tokens) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create unique orderMerchantId
    const orderMerchantId = `order_${Date.now()}`;

    console.log("💳 Creating order for redirect payment:", orderMerchantId);

    // Find the user to ensure account exists
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Determine target currency format for database schema matching
    let dbCurrency: "GBP" | "EUR" | "USD" = "GBP";
    if (body.currency === "EUR") dbCurrency = "EUR";
    if (body.currency === "USD") dbCurrency = "USD";

    // Create the order in the database with status PROCESSING
    await prisma.order.create({
      data: {
        userEmail: body.email,
        amount: body.amount,
        currency: dbCurrency,
        description: body.description || `Top-up: ${body.planId || "Payment"}`,
        tokens: body.tokens ?? 0,
        orderMerchantId,
        status: "PROCESSING",
        response: {
          method: "pionpay_redirect",
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Build the success, failure, pending, and cancel return URLs
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
    const successUrl = `${appUrl}/payment/processing?orderMerchantId=${orderMerchantId}&status=success`;
    const failureUrl = `${appUrl}/payment/processing?orderMerchantId=${orderMerchantId}&status=failure`;
    const pendingUrl = `${appUrl}/payment/processing?orderMerchantId=${orderMerchantId}&status=pending`;
    const cancelUrl = `${appUrl}/payment/processing?orderMerchantId=${orderMerchantId}&status=cancel`;

    // Instantiate PionPayClient and generate redirect URL
    const pionPay = new PionPayClient();
    const redirectUrl = pionPay.getRedirectUrl({
      amount: body.amount,
      description: body.description || `Top-up: ${body.planId || "Payment"}`,
      currency: body.currency,
      invoiceId: orderMerchantId,
      accountId: body.email,
      successUrl,
      failureUrl,
      pendingUrl,
      cancelUrl,
      locale: body.locale || "en_US",
    });

    console.log(`🔗 Constructed PionPay redirect URL: ${redirectUrl}`);

    return NextResponse.json({
      ok: true,
      orderMerchantId,
      redirectUrl,
    });
  } catch (err: any) {
    console.error("❌ Payment redirect initiation error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Failed to initiate payment redirect",
      },
      { status: 500 }
    );
  }
}
