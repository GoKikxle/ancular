-- Trip completion: explicit user action only (not deletion).
-- completed_at IS NULL → active list; IS NOT NULL → archived + stats-eligible.

ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_trips_completed_at_null
  ON trips (user_id)
  WHERE completed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_trips_completed_at
  ON trips (user_id, completed_at DESC)
  WHERE completed_at IS NOT NULL;
