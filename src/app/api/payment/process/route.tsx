import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corefyClient } from "@/lib/corefy";

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

    console.log("💳 Creating order for Corefy HPP payment:", orderMerchantId);

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
    const order = await prisma.order.create({
      data: {
        userEmail: body.email,
        amount: body.amount,
        currency: dbCurrency,
        description: body.description || `Top-up: ${body.planId || "Payment"}`,
        tokens: body.tokens ?? 0,
        orderMerchantId,
        status: "PROCESSING",
        response: {
          method: "corefy_hpp",
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Corefy strictly requires valid public domain URLs (rejects localhost)
    const baseDomain = (process.env.NEXT_PUBLIC_APP_URL || "https://cv-makers.co.uk")
      .replace(/\/+$/, "")
      .replace(/^http:\/\//, "https://");
    const domainUrl = baseDomain.includes("localhost") ? "https://cv-makers.co.uk" : baseDomain;

    const successUrl = `${domainUrl}/payment/processing?orderMerchantId=${orderMerchantId}&status=success`;
    const failureUrl = `${domainUrl}/payment/processing?orderMerchantId=${orderMerchantId}&status=failure`;
    const pendingUrl = `${domainUrl}/payment/processing?orderMerchantId=${orderMerchantId}&status=pending`;
    const callbackUrl = `${domainUrl}/api/webhooks/corefy`;

    // Customer details
    const customerName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.name ||
      body.name ||
      body.email.split("@")[0];

    const customerAddress =
      user.street || user.city || user.country
        ? {
            country: user.country || undefined,
            city: user.city || undefined,
            street: user.street || undefined,
            post_code: user.postalCode || undefined,
          }
        : undefined;

    // Call Sterling Pay / Corefy API to create Payment Invoice (HPP)
    const invoiceResult = await corefyClient.createPaymentInvoice({
      referenceId: orderMerchantId,
      amount: Number(body.amount),
      currency: body.currency,
      description: body.description || `Top-up: ${body.planId || "Payment"}`,
      returnUrl: successUrl,
      returnUrls: {
        success: successUrl,
        pending: pendingUrl,
        fail: failureUrl,
      },
      callbackUrl,
      customer: {
        reference_id: `cust_${user.id}`,
        email: user.email || body.email,
        name: customerName,
        first_name: user.firstName || undefined,
        surname: user.lastName || undefined,
        address: customerAddress,
        metadata: {
          shop: "workingagent",
        },
      },
      metadata: {
        order_id: orderMerchantId,
        user_id: user.id,
        shop: "workingagent",
        tokens: body.tokens,
      },
    });

    // Update order with the Corefy invoice ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        orderSystemId: invoiceResult.invoiceId,
        response: {
          method: "corefy_hpp",
          invoiceId: invoiceResult.invoiceId,
          timestamp: new Date().toISOString(),
        },
      },
    });

    console.log(`🔗 Created Corefy HPP URL for order ${orderMerchantId}: ${invoiceResult.redirectUrl}`);

    return NextResponse.json({
      ok: true,
      orderMerchantId,
      redirectUrl: invoiceResult.redirectUrl,
      invoiceId: invoiceResult.invoiceId,
    });
  } catch (err: any) {
    console.error("❌ Corefy payment initiation error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Failed to initiate Corefy payment",
      },
      { status: 500 }
    );
  }
}
