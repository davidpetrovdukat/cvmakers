-- EUR is the sole currency accepted for new purchases. Existing orders and
-- ledger entries deliberately retain their original currency: Corefy verifies
-- the settled payment currency against the stored order before crediting tokens.
UPDATE "User" SET "currency" = 'EUR' WHERE "currency" <> 'EUR';
ALTER TABLE "User" ALTER COLUMN "currency" SET DEFAULT 'EUR'::"Currency";
