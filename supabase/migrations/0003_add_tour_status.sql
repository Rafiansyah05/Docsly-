-- 0003_add_tour_status.sql
-- Add a column to track which onboarding tours the user has completed

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tours_status JSONB DEFAULT '{}'::jsonb;
