ALTER TABLE "User" ADD COLUMN "status" "VerificationStatus" NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "User" ADD COLUMN "verificationCode" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "authProvider" TEXT;
ALTER TABLE "User" ADD COLUMN "providerAccountId" TEXT;
ALTER TABLE "User" ADD COLUMN "reviewedAt" TIMESTAMP(3);

CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "User_authProvider_providerAccountId_idx" ON "User"("authProvider", "providerAccountId");
