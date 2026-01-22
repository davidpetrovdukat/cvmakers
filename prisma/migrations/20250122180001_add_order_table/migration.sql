-- CreateTable Order (safe version with IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS "Order" (
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

-- CreateIndex (safe version with IF NOT EXISTS)
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderMerchantId_key" ON "Order"("orderMerchantId") WHERE "orderMerchantId" IS NOT NULL;
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;
