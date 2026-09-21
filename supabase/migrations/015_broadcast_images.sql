-- ============================================
-- BIZORA: Broadcast message photos
-- Run this in Supabase SQL Editor (or via migration runner).
-- Safe to run multiple times.
-- ============================================

ALTER TABLE customer_broadcasts
  ADD COLUMN IF NOT EXISTS image_url TEXT;
