CREATE TABLE IF NOT EXISTS community_place_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES users(id) ON DELETE CASCADE,
  city_id UUID NULL REFERENCES cities(id) ON DELETE SET NULL,
  destination_name VARCHAR(120) NOT NULL,
  author_alias VARCHAR(80) NULL,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  body TEXT NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_place_messages_city_created
  ON community_place_messages(city_id, created_at);

CREATE INDEX IF NOT EXISTS idx_place_messages_destination_created
  ON community_place_messages(destination_name, created_at);
