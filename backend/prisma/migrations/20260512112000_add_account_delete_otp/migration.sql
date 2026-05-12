ALTER TABLE "users"
ADD COLUMN "delete_otp_hash" VARCHAR(255),
ADD COLUMN "delete_otp_expires_at" TIMESTAMP(6);
