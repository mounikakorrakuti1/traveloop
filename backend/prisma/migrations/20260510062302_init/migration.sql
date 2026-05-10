-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "avatar_url" TEXT,
    "traveler_profile" VARCHAR(20) NOT NULL DEFAULT 'solo',
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "otp_hash" VARCHAR(255),
    "otp_expires_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "cover_photo_url" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "trip_type" VARCHAR(30) NOT NULL,
    "budget_cap_usd" DECIMAL(10,2),
    "vibe" VARCHAR(20),
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "public_slug" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL DEFAULT 'planning',
    "deleted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100),
    "country" VARCHAR(100) NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "cost_index" VARCHAR(10),
    "area_type" VARCHAR(20),
    "best_season" VARCHAR(100),
    "is_regional_gem" BOOLEAN NOT NULL DEFAULT false,
    "thumbnail_url" TEXT,
    "region" VARCHAR(50),
    "search_vector" tsvector,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stops" (
    "id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "city_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,
    "arrival_date" DATE NOT NULL,
    "departure_date" DATE NOT NULL,
    "notes" TEXT,
    "accommodation_name" VARCHAR(255),
    "accommodation_cost" DECIMAL(8,2),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL,
    "city_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "trip_type_tags" JSONB NOT NULL,
    "estimated_cost_usd" DECIMAL(8,2) NOT NULL,
    "duration_hours" DECIMAL(4,1) NOT NULL,
    "description" TEXT,
    "image_url" TEXT,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stop_activities" (
    "id" UUID NOT NULL,
    "stop_id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "scheduled_time" TIME(6),
    "actual_cost_usd" DECIMAL(8,2),
    "is_completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "stop_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packing_items" (
    "id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "is_packed" BOOLEAN NOT NULL DEFAULT false,
    "ai_suggested" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "packing_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_notes" (
    "id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "stop_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "note_type" VARCHAR(20) NOT NULL,
    "is_important" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "trip_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_uploads" (
    "id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "stop_id" UUID,
    "user_id" UUID NOT NULL,
    "media_type" VARCHAR(10) NOT NULL,
    "cloudinary_url" TEXT NOT NULL,
    "cloudinary_id" VARCHAR(255) NOT NULL,
    "caption" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_otps" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "otp_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "trips_public_slug_key" ON "trips"("public_slug");

-- CreateIndex
CREATE INDEX "idx_trips_user_id" ON "trips"("user_id");

-- CreateIndex
CREATE INDEX "idx_trips_public_slug" ON "trips"("public_slug");

-- CreateIndex
CREATE INDEX "idx_trips_status" ON "trips"("status");

-- CreateIndex
CREATE INDEX "idx_cities_country_code" ON "cities"("country_code");

-- CreateIndex
CREATE INDEX "idx_stops_trip_id" ON "stops"("trip_id");

-- CreateIndex
CREATE INDEX "idx_stops_city_id" ON "stops"("city_id");

-- CreateIndex
CREATE INDEX "idx_activities_city_id" ON "activities"("city_id");

-- CreateIndex
CREATE INDEX "idx_sa_stop_id" ON "stop_activities"("stop_id");

-- CreateIndex
CREATE INDEX "idx_packing_trip_id" ON "packing_items"("trip_id");

-- CreateIndex
CREATE INDEX "idx_notes_trip_id" ON "trip_notes"("trip_id");

-- CreateIndex
CREATE INDEX "idx_media_trip_id" ON "media_uploads"("trip_id");

-- CreateIndex
CREATE INDEX "idx_password_otps_user_id" ON "password_reset_otps"("user_id");

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stops" ADD CONSTRAINT "stops_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stops" ADD CONSTRAINT "stops_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stop_activities" ADD CONSTRAINT "stop_activities_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "stops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stop_activities" ADD CONSTRAINT "stop_activities_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packing_items" ADD CONSTRAINT "packing_items_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_notes" ADD CONSTRAINT "trip_notes_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_notes" ADD CONSTRAINT "trip_notes_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_uploads" ADD CONSTRAINT "media_uploads_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_uploads" ADD CONSTRAINT "media_uploads_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_uploads" ADD CONSTRAINT "media_uploads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_otps" ADD CONSTRAINT "password_reset_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
