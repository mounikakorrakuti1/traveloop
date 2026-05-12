ALTER TABLE community_place_messages
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE community_place_messages
  ADD COLUMN IF NOT EXISTS author_alias VARCHAR(80) NULL;

ALTER TABLE community_place_messages
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE community_place_messages
SET author_alias = CONCAT('Traveler ', UPPER(SUBSTRING(REPLACE(user_id::text, '-', ''), 1, 6)))
WHERE author_alias IS NULL
  AND user_id IS NOT NULL;
