CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "Provider" ADD COLUMN "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Provider" ADD COLUMN "verificationCode" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Provider" ADD COLUMN "notifiedAt" TIMESTAMP(3);
ALTER TABLE "Provider" ADD COLUMN "reviewedAt" TIMESTAMP(3);

ALTER TABLE "Agency" ADD COLUMN "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Agency" ADD COLUMN "verificationCode" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Agency" ADD COLUMN "notifiedAt" TIMESTAMP(3);
ALTER TABLE "Agency" ADD COLUMN "reviewedAt" TIMESTAMP(3);
