ALTER TABLE "ReservationRequest" ADD COLUMN "code" TEXT NOT NULL DEFAULT '';
CREATE INDEX "ReservationRequest_code_idx" ON "ReservationRequest"("code");
