-- Add TRY to Currency enum (safe version with exception handling)
DO $$ BEGIN
  ALTER TYPE "Currency" ADD VALUE 'TRY';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
