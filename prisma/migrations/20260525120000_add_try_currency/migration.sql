-- Add Turkish lira to Currency enum.
DO $$ BEGIN
  ALTER TYPE "Currency" ADD VALUE 'TRY';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
