import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { corefyClient } from "@/lib/corefy";
import { CheckoutError, resolveCheckoutItem } from "@/lib/checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const body = await req.json().catch(() => ({}));

    // Price and token count are computed here; amounts sent by the browser are ignored.
    let item;
    try {
      item = await resolveCheckoutItem({
        planId: body.planId,
        customAmount: body.customAmount,
        currency: body.currency,
      });
    } catch (err) {
      if (err instanceof CheckoutError) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
      }
      throw err;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const orderMerchantId = `ord_${randomUUID().replace(/-/g, "")}`;

    console.log("💳 Creating order for Corefy HPP payment:", orderMerchantId);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        kind: item.kind,
        productId: item.productId,
        amount: item.amount,
        currency: item.currency,
        description: item.description,
        tokens: item.tokens,
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
      user.email.split("@")[0];

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
      amount: item.amount,
      currency: item.currency,
      description: item.description,
      returnUrl: successUrl,
      returnUrls: {
        success: successUrl,
        pending: pendingUrl,
        fail: failureUrl,
      },
      callbackUrl,
      customer: {
        reference_id: `cust_${user.id}`,
        email: user.email,
        name: customerName,
        first_name: user.firstName || undefined,
        surname: user.lastName || undefined,
        address: customerAddress,
      },
      metadata: {
        order_id: orderMerchantId,
        user_id: user.id,
        tokens: item.tokens,
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
