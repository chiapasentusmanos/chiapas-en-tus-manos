ALTER TABLE "Service" ADD COLUMN "adminNetPrice" DECIMAL(10,2);
ALTER TABLE "Service" ADD COLUMN "agencyDiscount" DECIMAL(5,2) NOT NULL DEFAULT 25;
ALTER TABLE "Service" ADD COLUMN "adminDiscount" DECIMAL(5,2) NOT NULL DEFAULT 35;

UPDATE "Service"
SET
  "agencyDiscount" = 25,
  "adminDiscount" = 35,
  "netPrice" = ROUND(("price" * 0.75)::numeric, 2),
  "adminNetPrice" = ROUND(("price" * 0.65)::numeric, 2);

ALTER TABLE "Service" ALTER COLUMN "adminNetPrice" SET NOT NULL;
