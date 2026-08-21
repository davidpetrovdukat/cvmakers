-- Replace the enum after normalising unavailable currencies in existing records.
CREATE TYPE "Currency_new" AS ENUM ('GBP', 'EUR', 'USD');

ALTER TABLE "User" ALTER COLUMN "currency" DROP DEFAULT;

ALTER TABLE "User"
  ALTER COLUMN "currency" TYPE "Currency_new"
  USING (CASE WHEN "currency"::text IN ('TRY', 'JPY') THEN 'GBP' ELSE "currency"::text END)::"Currency_new";

ALTER TABLE "Invoice"
  ALTER COLUMN "currency" TYPE "Currency_new"
  USING (CASE WHEN "currency"::text IN ('TRY', 'JPY') THEN 'GBP' ELSE "currency"::text END)::"Currency_new";

ALTER TABLE "Order"
  ALTER COLUMN "currency" TYPE "Currency_new"
  USING (CASE WHEN "currency"::text IN ('TRY', 'JPY') THEN 'GBP' ELSE "currency"::text END)::"Currency_new";

ALTER TABLE "LedgerEntry"
  ALTER COLUMN "currency" TYPE "Currency_new"
  USING (CASE WHEN "currency" IS NULL THEN NULL WHEN "currency"::text IN ('TRY', 'JPY') THEN 'GBP' ELSE "currency"::text END)::"Currency_new";

ALTER TYPE "Currency" RENAME TO "Currency_old";
ALTER TYPE "Currency_new" RENAME TO "Currency";
DROP TYPE "Currency_old";

ALTER TABLE "User" ALTER COLUMN "currency" SET DEFAULT 'GBP'::"Currency";
