-- Cleanup duplicate poems in Supabase
-- Run this in your Supabase SQL Editor (Database > SQL Editor)

-- Step 1: Preview duplicates (run this first to see what will be deleted)
SELECT
  collection_id,
  title,
  COUNT(*) as duplicate_count,
  ARRAY_AGG(id ORDER BY created_at ASC) as poem_ids,
  ARRAY_AGG(created_at ORDER BY created_at ASC) as created_dates
FROM poems
GROUP BY collection_id, title
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Delete duplicates, keeping the earliest created one
-- UNCOMMENT THE LINES BELOW TO RUN THE DELETE

-- DELETE FROM poems
-- WHERE id IN (
--   SELECT id FROM (
--     SELECT
--       id,
--       ROW_NUMBER() OVER (
--         PARTITION BY collection_id, title
--         ORDER BY created_at ASC
--       ) as row_num
--     FROM poems
--   ) ranked
--   WHERE row_num > 1
-- );

-- Alternative: If you want to see exactly what will be deleted before running:
-- SELECT * FROM poems
-- WHERE id IN (
--   SELECT id FROM (
--     SELECT
--       id,
--       ROW_NUMBER() OVER (
--         PARTITION BY collection_id, title
--         ORDER BY created_at ASC
--       ) as row_num
--     FROM poems
--   ) ranked
--   WHERE row_num > 1
-- );
