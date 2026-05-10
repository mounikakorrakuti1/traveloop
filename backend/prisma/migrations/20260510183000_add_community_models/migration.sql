-- Create community tables for backend-driven social feed.
CREATE TABLE "community_posts" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "trip_id" UUID,
  "title" VARCHAR(180) NOT NULL,
  "content" TEXT NOT NULL,
  "hero_image_url" TEXT,
  "destination_name" VARCHAR(120),
  "budget_inr" DECIMAL(10,2),
  "is_published" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "community_comments" (
  "id" UUID NOT NULL,
  "post_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "body" TEXT NOT NULL,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "community_likes" (
  "id" UUID NOT NULL,
  "post_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "community_likes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "community_bookmarks" (
  "id" UUID NOT NULL,
  "post_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "community_bookmarks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_community_posts_created_at" ON "community_posts"("created_at");
CREATE INDEX "idx_community_posts_destination" ON "community_posts"("destination_name");
CREATE INDEX "idx_community_comments_post_id" ON "community_comments"("post_id");
CREATE INDEX "idx_community_likes_post_id" ON "community_likes"("post_id");
CREATE INDEX "idx_community_bookmarks_post_id" ON "community_bookmarks"("post_id");
CREATE UNIQUE INDEX "uq_community_like_post_user" ON "community_likes"("post_id", "user_id");
CREATE UNIQUE INDEX "uq_community_bookmark_post_user" ON "community_bookmarks"("post_id", "user_id");

ALTER TABLE "community_posts"
  ADD CONSTRAINT "community_posts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_posts"
  ADD CONSTRAINT "community_posts_trip_id_fkey"
  FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "community_comments"
  ADD CONSTRAINT "community_comments_post_id_fkey"
  FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_comments"
  ADD CONSTRAINT "community_comments_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_likes"
  ADD CONSTRAINT "community_likes_post_id_fkey"
  FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_likes"
  ADD CONSTRAINT "community_likes_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_bookmarks"
  ADD CONSTRAINT "community_bookmarks_post_id_fkey"
  FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_bookmarks"
  ADD CONSTRAINT "community_bookmarks_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
