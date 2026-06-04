ALTER TYPE "UserRole" ADD VALUE 'BRAND_CHIAPAS';

CREATE TABLE "BrandChiapasProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  "rfc" TEXT NOT NULL,
  "registrationNumber" TEXT NOT NULL,
  "municipality" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "whatsapp" TEXT NOT NULL,
  "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "verificationCode" TEXT NOT NULL DEFAULT '',
  "notifiedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BrandChiapasProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BrandProduct" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "productCategory" TEXT NOT NULL,
  "originMunicipality" TEXT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "description" TEXT NOT NULL,
  "materials" TEXT NOT NULL,
  "presentation" TEXT NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "shipping" TEXT NOT NULL,
  "whatsapp" TEXT NOT NULL,
  "paymentMethods" TEXT NOT NULL DEFAULT 'TRANSFER,CARD',
  "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "ownerId" TEXT NOT NULL,
  "brandProfileId" TEXT NOT NULL,

  CONSTRAINT "BrandProduct_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BrandProductImage" (
  "id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "alt" TEXT,
  "productId" TEXT NOT NULL,

  CONSTRAINT "BrandProductImage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BrandChiapasProfile_userId_key" ON "BrandChiapasProfile"("userId");
CREATE INDEX "BrandChiapasProfile_status_idx" ON "BrandChiapasProfile"("status");
CREATE INDEX "BrandChiapasProfile_registrationNumber_idx" ON "BrandChiapasProfile"("registrationNumber");
CREATE UNIQUE INDEX "BrandProduct_slug_key" ON "BrandProduct"("slug");
CREATE INDEX "BrandProduct_status_idx" ON "BrandProduct"("status");
CREATE INDEX "BrandProduct_productCategory_idx" ON "BrandProduct"("productCategory");
CREATE INDEX "BrandProduct_originMunicipality_idx" ON "BrandProduct"("originMunicipality");

ALTER TABLE "BrandChiapasProfile" ADD CONSTRAINT "BrandChiapasProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BrandProduct" ADD CONSTRAINT "BrandProduct_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BrandProduct" ADD CONSTRAINT "BrandProduct_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandChiapasProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BrandProductImage" ADD CONSTRAINT "BrandProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "BrandProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
