-- Migration: add document_id to timeline_items
-- Run once in Supabase SQL Editor or via supabase db push.
--
-- Purpose:
--   Allows each timeline item to reference a specific trip document.
--   ON DELETE SET NULL ensures that deleting a document from the vault
--   silently unlinks it from any timeline items rather than blocking
--   the delete or creating orphaned rows.

ALTER TABLE timeline_items
  ADD COLUMN IF NOT EXISTS document_id UUID NULL
  REFERENCES documents(id) ON DELETE SET NULL;

-- Sparse index — only indexes rows that actually have a linked document.
CREATE INDEX IF NOT EXISTS idx_timeline_items_document_id
  ON timeline_items (document_id)
  WHERE document_id IS NOT NULL;
