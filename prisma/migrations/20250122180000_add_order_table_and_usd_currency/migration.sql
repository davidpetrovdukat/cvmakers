-- Add USD to Currency enum (safe version with exception handling)
DO $$ BEGIN
  ALTER TYPE "Currency" ADD VALUE 'USD';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
