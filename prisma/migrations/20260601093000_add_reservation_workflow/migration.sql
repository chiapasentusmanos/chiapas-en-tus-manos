CREATE TYPE "ReservationStatus" AS ENUM ('NEW', 'CONTACTED', 'CONFIRMED', 'CANCELLED');

ALTER TABLE "ReservationRequest" ADD COLUMN "travelDate" TIMESTAMP(3);
ALTER TABLE "ReservationRequest" ADD COLUMN "people" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "ReservationRequest" ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'TRANSFER';
ALTER TABLE "ReservationRequest" ADD COLUMN "status" "ReservationStatus" NOT NULL DEFAULT 'NEW';

CREATE INDEX "ReservationRequest_status_idx" ON "ReservationRequest"("status");
CREATE INDEX "ReservationRequest_createdAt_idx" ON "ReservationRequest"("createdAt");
