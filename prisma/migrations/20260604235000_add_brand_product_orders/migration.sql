CREATE TABLE "BrandProductOrder" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL DEFAULT '',
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "total" DECIMAL(10,2) NOT NULL,
  "paymentMethod" TEXT NOT NULL DEFAULT 'CARD',
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PAID',
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "productId" TEXT NOT NULL,
  "userId" TEXT,
  CONSTRAINT "BrandProductOrder_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BrandProductOrder_code_idx" ON "BrandProductOrder"("code");
CREATE INDEX "BrandProductOrder_paymentStatus_idx" ON "BrandProductOrder"("paymentStatus");
CREATE INDEX "BrandProductOrder_createdAt_idx" ON "BrandProductOrder"("createdAt");

ALTER TABLE "BrandProductOrder" ADD CONSTRAINT "BrandProductOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "BrandProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BrandProductOrder" ADD CONSTRAINT "BrandProductOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
