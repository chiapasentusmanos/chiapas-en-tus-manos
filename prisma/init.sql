CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'PROVIDER', 'AGENCY', 'GUIDE', 'BRAND_CHIAPAS', 'ADMIN');
CREATE TYPE "ServiceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "ReservationStatus" AS ENUM ('NEW', 'CONTACTED', 'CONFIRMED', 'CANCELLED');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
  "phone" TEXT,
  "status" "VerificationStatus" NOT NULL DEFAULT 'APPROVED',
  "verificationCode" TEXT NOT NULL DEFAULT '',
  "authProvider" TEXT,
  "providerAccountId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "User_authProvider_providerAccountId_idx" ON "User"("authProvider", "providerAccountId");

CREATE TABLE "Provider" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "businessName" TEXT NOT NULL,
  "rfc" TEXT NOT NULL DEFAULT '',
  "rnt" TEXT NOT NULL DEFAULT '',
  "rfcDocumentUrl" TEXT NOT NULL DEFAULT '',
  "rntDocumentUrl" TEXT NOT NULL DEFAULT '',
  "ineDocumentUrl" TEXT NOT NULL DEFAULT '',
  "fiscalAddressProofUrl" TEXT NOT NULL DEFAULT '',
  "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "verificationCode" TEXT NOT NULL DEFAULT '',
  "notifiedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "municipality" TEXT,
  "description" TEXT,
  "whatsapp" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Agency" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "agencyName" TEXT NOT NULL,
  "rfc" TEXT NOT NULL DEFAULT '',
  "rnt" TEXT NOT NULL DEFAULT '',
  "rfcDocumentUrl" TEXT NOT NULL DEFAULT '',
  "rntDocumentUrl" TEXT NOT NULL DEFAULT '',
  "ineDocumentUrl" TEXT NOT NULL DEFAULT '',
  "fiscalAddressProofUrl" TEXT NOT NULL DEFAULT '',
  "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "verificationCode" TEXT NOT NULL DEFAULT '',
  "notifiedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "contactName" TEXT,
  "whatsapp" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Guide" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
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
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "Guide_status_idx" ON "Guide"("status");
CREATE INDEX "Guide_guideType_idx" ON "Guide"("guideType");
CREATE INDEX "Guide_scope_idx" ON "Guide"("scope");

CREATE TABLE "BrandChiapasProfile" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
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
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "BrandChiapasProfile_status_idx" ON "BrandChiapasProfile"("status");
CREATE INDEX "BrandChiapasProfile_registrationNumber_idx" ON "BrandChiapasProfile"("registrationNumber");

CREATE TABLE "Category" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE
);

CREATE TABLE "Service" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "municipality" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "netPrice" DECIMAL(10,2) NOT NULL,
  "adminNetPrice" DECIMAL(10,2) NOT NULL,
  "agencyDiscount" DECIMAL(5,2) NOT NULL DEFAULT 25,
  "adminDiscount" DECIMAL(5,2) NOT NULL DEFAULT 35,
  "description" TEXT NOT NULL,
  "schedules" TEXT NOT NULL,
  "includes" TEXT NOT NULL,
  "excludes" TEXT NOT NULL,
  "policies" TEXT NOT NULL,
  "whatsapp" TEXT NOT NULL,
  "paymentMethods" TEXT NOT NULL DEFAULT 'TRANSFER,CARD',
  "latitude" DECIMAL(10,7),
  "longitude" DECIMAL(10,7),
  "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "ownerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "providerId" TEXT REFERENCES "Provider"("id") ON DELETE SET NULL,
  "categoryId" TEXT NOT NULL REFERENCES "Category"("id")
);

CREATE INDEX "Service_status_idx" ON "Service"("status");
CREATE INDEX "Service_municipality_idx" ON "Service"("municipality");
CREATE INDEX "Service_categoryId_idx" ON "Service"("categoryId");

CREATE TABLE "Image" (
  "id" TEXT PRIMARY KEY,
  "url" TEXT NOT NULL,
  "alt" TEXT,
  "serviceId" TEXT NOT NULL REFERENCES "Service"("id") ON DELETE CASCADE
);

CREATE TABLE "BrandProduct" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
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
  "ownerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "brandProfileId" TEXT NOT NULL REFERENCES "BrandChiapasProfile"("id") ON DELETE CASCADE
);

CREATE INDEX "BrandProduct_status_idx" ON "BrandProduct"("status");
CREATE INDEX "BrandProduct_productCategory_idx" ON "BrandProduct"("productCategory");
CREATE INDEX "BrandProduct_originMunicipality_idx" ON "BrandProduct"("originMunicipality");

CREATE TABLE "BrandProductImage" (
  "id" TEXT PRIMARY KEY,
  "url" TEXT NOT NULL,
  "alt" TEXT,
  "productId" TEXT NOT NULL REFERENCES "BrandProduct"("id") ON DELETE CASCADE
);

CREATE TABLE "ReservationRequest" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL DEFAULT '',
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "message" TEXT NOT NULL,
  "travelDate" TIMESTAMP(3),
  "people" INTEGER NOT NULL DEFAULT 1,
  "paymentMethod" TEXT NOT NULL DEFAULT 'TRANSFER',
  "status" "ReservationStatus" NOT NULL DEFAULT 'NEW',
  "isAgency" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "serviceId" TEXT NOT NULL REFERENCES "Service"("id") ON DELETE CASCADE,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "ReservationRequest_status_idx" ON "ReservationRequest"("status");
CREATE INDEX "ReservationRequest_createdAt_idx" ON "ReservationRequest"("createdAt");
CREATE INDEX "ReservationRequest_code_idx" ON "ReservationRequest"("code");
