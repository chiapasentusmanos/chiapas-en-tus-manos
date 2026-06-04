CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID');

ALTER TABLE "ReservationRequest" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "ReservationRequest" ADD COLUMN "paidAt" TIMESTAMP(3);

CREATE INDEX "ReservationRequest_paymentStatus_idx" ON "ReservationRequest"("paymentStatus");
