-- ONE-TIME MIGRATION: remove the tier/badge gamification column from profiles
-- Run this once in the Supabase SQL Editor against your existing project.
-- Bronze/Silver/Gold/Platinum/Diamond tier UI has been removed from the app;
-- total_orders is kept (still shown as a plain stat on the profile page).

alter table public.profiles drop column if exists tier;
