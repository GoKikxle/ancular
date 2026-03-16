-- ============================================================
-- Migration: add event_date to timeline_items
-- ============================================================
-- Run once in the Supabase SQL Editor (or via the Supabase CLI).
-- This script is idempotent — safe to run multiple times.
--
-- Why:
--   The `time` column stores HH:MM (text) which is only meaningful
--   within a single day. To sort items across multiple trip days we
--   need a proper DATE column.
--
-- Backward compatibility:
--   The column is nullable so existing rows are unaffected.
--   Rows without a date will sort AFTER dated rows (NULLS LAST).
-- ============================================================

ALTER TABLE timeline_items
  ADD COLUMN IF NOT EXISTS event_date DATE NULL;

-- Compound index covers the three-level sort used by getTimelineItemsForTrip:
--   ORDER BY event_date ASC NULLS LAST, time ASC, sort_order ASC NULLS LAST
CREATE INDEX IF NOT EXISTS idx_timeline_items_date_time
  ON timeline_items (trip_id, event_date, time);

-- Optional: backfill existing rows by deriving event_date from created_at.
-- Uncomment if you want legacy items to appear in date order rather than
-- falling to the bottom of every trip's timeline.
--
-- UPDATE timeline_items
-- SET event_date = created_at::date
-- WHERE event_date IS NULL;
