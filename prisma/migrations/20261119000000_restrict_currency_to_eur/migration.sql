-- EUR is the only supported purchase and invoice currency.
-- Legacy currency labels are normalised without changing the stored amounts.
CREATE TYPE "Currency_new" AS ENUM ('EUR');

ALTER TABLE "User" ALTER COLUMN "currency" DROP DEFAULT;

ALTER TABLE "User"
  ALTER COLUMN "currency" TYPE "Currency_new"
  USING 'EUR'::"Currency_new";

ALTER TABLE "Invoice"
  ALTER COLUMN "currency" TYPE "Currency_new"
  USING 'EUR'::"Currency_new";

ALTER TABLE "Order"
  ALTER COLUMN "currency" TYPE "Currency_new"
  USING 'EUR'::"Currency_new";

ALTER TABLE "LedgerEntry"
  ALTER COLUMN "currency" TYPE "Currency_new"
  USING (CASE WHEN "currency" IS NULL THEN NULL ELSE 'EUR' END)::"Currency_new";

ALTER TYPE "Currency" RENAME TO "Currency_old";
ALTER TYPE "Currency_new" RENAME TO "Currency";
DROP TYPE "Currency_old";

ALTER TABLE "User" ALTER COLUMN "currency" SET DEFAULT 'EUR'::"Currency";
