-- Migration: Add display_order column to administration_routes
-- Date: 2025-11-24

BEGIN;

-- Add display_order column
ALTER TABLE administration_routes
  ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0 NOT NULL;

-- Create index for display_order
CREATE INDEX IF NOT EXISTS idx_administration_routes_display_order
  ON administration_routes(display_order);

COMMIT;
