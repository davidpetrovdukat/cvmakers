-- Link orders to users and record what was bought
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "kind" TEXT NOT NULL DEFAULT 'TOKENS';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "productId" TEXT;

CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");

ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill owners of existing orders by email
UPDATE "Order" o
SET "userId" = u."id"
FROM "User" u
WHERE o."userId" IS NULL
  AND o."userEmail" IS NOT NULL
  AND lower(o."userEmail") = lower(u."email");
