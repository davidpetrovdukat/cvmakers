import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Валидация обязательных полей
    if (!body.email || !body.amount || !body.currency || !body.tokens) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Создаем orderMerchantId
    const orderMerchantId = `order_${Date.now()}`;

    console.log("💳 Processing payment:", orderMerchantId);

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Создаем заказ со статусом APPROVED
    const order = await prisma.order.create({
      data: {
        userEmail: body.email,
        amount: body.amount,
        currency: body.currency,
        description: body.description || `Top-up: ${body.planId || "Payment"}`,
        tokens: body.tokens ?? 0,
        orderMerchantId,
        status: "APPROVED",
        response: {
          processed: true,
          method: "temporary_auto_approve",
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Зачисляем токены пользователю
    const tokensToAdd = body.tokens ?? 0;
    const newBalance = (user.tokenBalance ?? 0) + tokensToAdd;

    await prisma.user.update({
      where: { id: user.id },
      data: { tokenBalance: newBalance },
    });

    // Создаем запись в Ledger
    await prisma.ledgerEntry.create({
      data: {
        userId: user.id,
        type: "Top-up",
        delta: tokensToAdd,
        balanceAfter: newBalance,
        currency: body.currency,
        amount: Math.round(body.amount * 100),
        receiptUrl: `order:${orderMerchantId}`,
      },
    });

    console.log(`✅ Payment approved: ${orderMerchantId}, +${tokensToAdd} tokens to ${user.email}`);

    return NextResponse.json({
      ok: true,
      orderMerchantId,
      state: "APPROVED",
      tokensAdded: tokensToAdd,
      tokenBalance: newBalance,
    });
  } catch (err: any) {
    console.error("❌ Payment processing error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Payment processing failed" },
      { status: 500 }
    );
  }
}
