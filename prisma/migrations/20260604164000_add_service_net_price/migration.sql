ALTER TABLE "Service" ADD COLUMN "netPrice" DECIMAL(10,2);

UPDATE "Service"
SET "netPrice" = ROUND(("price" * 0.85)::numeric, 2)
WHERE "netPrice" IS NULL;

ALTER TABLE "Service" ALTER COLUMN "netPrice" SET NOT NULL;
