-- Add Japanese yen to Currency enum.
DO $$ BEGIN
  ALTER TYPE "Currency" ADD VALUE 'JPY';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
