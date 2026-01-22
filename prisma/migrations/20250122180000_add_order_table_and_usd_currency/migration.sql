-- Add USD to Currency enum
ALTER TYPE "Currency" ADD VALUE IF NOT EXISTS 'USD';

-- CreateTable Order
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL,
    "description" TEXT,
    "tokens" INTEGER,
    "orderMerchantId" TEXT,
    "orderSystemId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderMerchantId_key" ON "Order"("orderMerchantId") WHERE "orderMerchantId" IS NOT NULL;
