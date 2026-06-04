ALTER TYPE "UserRole" ADD VALUE 'GUIDE';

CREATE TABLE "Guide" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "guideType" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "certificationNumber" TEXT NOT NULL,
  "certificationDocumentUrl" TEXT NOT NULL DEFAULT '',
  "ineDocumentUrl" TEXT NOT NULL DEFAULT '',
  "languages" TEXT NOT NULL,
  "municipalities" TEXT NOT NULL,
  "yearsExperience" INTEGER NOT NULL DEFAULT 0,
  "bio" TEXT NOT NULL,
  "whatsapp" TEXT NOT NULL,
  "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "verificationCode" TEXT NOT NULL DEFAULT '',
  "notifiedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Guide_userId_key" ON "Guide"("userId");
CREATE INDEX "Guide_status_idx" ON "Guide"("status");
CREATE INDEX "Guide_guideType_idx" ON "Guide"("guideType");
CREATE INDEX "Guide_scope_idx" ON "Guide"("scope");

ALTER TABLE "Guide" ADD CONSTRAINT "Guide_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
