CREATE TABLE "destination_enrichments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "city_id" UUID NOT NULL,
  "description" TEXT,
  "wiki_url" TEXT,
  "hero_image_url" TEXT,
  "gallery" JSONB,
  "attractions" JSONB,
  "weather" JSONB,
  "budget_estimate" JSONB,
  "ai_summary" TEXT,
  "source_metadata" JSONB,
  "refreshed_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "destination_enrichments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "destination_enrichments_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "destination_enrichments_city_id_key" ON "destination_enrichments"("city_id");
CREATE INDEX "idx_destination_enrichments_refreshed_at" ON "destination_enrichments"("refreshed_at");
