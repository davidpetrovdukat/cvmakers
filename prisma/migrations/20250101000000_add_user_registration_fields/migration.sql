-- AlterTable
ALTER TABLE "User" ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "dateOfBirth" TIMESTAMP(3),
ADD COLUMN "street" TEXT,
ADD COLUMN "country" TEXT,
ADD COLUMN "postalCode" TEXT;
