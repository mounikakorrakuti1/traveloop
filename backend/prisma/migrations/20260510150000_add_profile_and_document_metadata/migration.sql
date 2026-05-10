ALTER TABLE "users"
  ADD COLUMN "username" VARCHAR(40),
  ADD COLUMN "bio" TEXT,
  ADD COLUMN "preferred_budget_min" DECIMAL(10, 2),
  ADD COLUMN "preferred_budget_max" DECIMAL(10, 2),
  ADD COLUMN "travel_styles" JSONB,
  ADD COLUMN "travel_preferences" JSONB;

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

ALTER TABLE "media_uploads"
  ADD COLUMN "document_type" VARCHAR(40),
  ADD COLUMN "file_name" VARCHAR(255),
  ADD COLUMN "file_size_bytes" INTEGER,
  ADD COLUMN "mime_type" VARCHAR(120),
  ADD COLUMN "expires_at" DATE;

CREATE INDEX "idx_media_trip_media_type" ON "media_uploads"("trip_id", "media_type");
CREATE INDEX "idx_media_document_type" ON "media_uploads"("document_type");
