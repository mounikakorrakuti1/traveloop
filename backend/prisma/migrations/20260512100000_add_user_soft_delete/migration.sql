ALTER TABLE "users"
ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deleted_at" TIMESTAMP(6);

CREATE INDEX "idx_users_is_deleted" ON "users"("is_deleted");
