-- 1. Create table for feature usage
CREATE TABLE IF NOT EXISTS public.feature_usage (
  feature text PRIMARY KEY,
  usage_count bigint DEFAULT 0 NOT NULL
);

-- 2. Insert initial rows
INSERT INTO public.feature_usage (feature, usage_count) VALUES
  ('bibliography', 0),
  ('page_numbering', 0),
  ('bibliography_page_numbering', 0)
ON CONFLICT (feature) DO NOTHING;

-- 3. Create RPC function for atomic increment
CREATE OR REPLACE FUNCTION increment_usage(feature_name text)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.feature_usage
  SET usage_count = usage_count + 1
  WHERE feature = feature_name;
$$;
