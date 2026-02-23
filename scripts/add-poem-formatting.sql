-- Add formatting column to poems table
-- Stores per-poem formatting: alignment, font, line spacing, first-line indent
-- Run this in Supabase SQL Editor

ALTER TABLE public.poems ADD COLUMN IF NOT EXISTS formatting jsonb DEFAULT NULL;

-- Example formatting value:
-- {
--   "align": "center",
--   "font": "eb-garamond",
--   "lineSpacing": "relaxed",
--   "firstLineIndent": true
-- }
