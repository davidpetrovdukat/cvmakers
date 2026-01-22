import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderMerchantId } = await req.json();
    if (!orderMerchantId)
      return NextResponse.json({ ok: false, error: "Missing orderMerchantId" }, { status: 400 });

    // 🔹 Знаходимо ордер
    const order = await prisma.order.findFirst({ where: { orderMerchantId } });
    if (!order)
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });

    // 🔹 Примусово оновлюємо статус як APPROVED
    await prisma.order.updateMany({
      where: { orderMerchantId },
      data: { status: "APPROVED", response: { forced: true } },
    });

    // 🔹 Отримуємо користувача
    const userEmail = order.userEmail ?? undefined;
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user)
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    // 🔹 Розрахунок токенів
    const baseAmount = order.amount || 0; // ❗ тільки order.amount
    const tokenRate = order.currency === "EUR" ? 110 : 100; // приклад коефіцієнта
    const tokensToAdd = order.tokens ?? Math.round(baseAmount * tokenRate);

    const newBalance = (user.tokenBalance ?? 0) + tokensToAdd;

    // 🔹 Оновлення балансу
    await prisma.user.update({
      where: { id: user.id },
      data: { tokenBalance: newBalance },
    });

    // 🔹 Створюємо запис у Ledger (без metadata)
    await prisma.ledgerEntry.create({
      data: {
        userId: user.id,
        type: "Top-up",
        delta: tokensToAdd,
        balanceAfter: newBalance,
        currency: order.currency === "EUR" ? "EUR" : "GBP",
        amount: Math.round(baseAmount * 100),
        receiptUrl: `order:${orderMerchantId}`,
      },
    });

    console.log(`✅ Order ${orderMerchantId} credited +${tokensToAdd} tokens to ${user.email}`);

    // 🔹 Відповідь
    return NextResponse.json({
      ok: true,
      state: "APPROVED",
      credited: true,
      tokenBalance: newBalance,
      tokensAdded: tokensToAdd,
    });
  } catch (err: any) {
    console.error("❌ Forced credit error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
