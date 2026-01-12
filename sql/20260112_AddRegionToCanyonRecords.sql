-- Migration: Add Region column to CanyonRecords table
-- Date: 2026-01-12

ALTER TABLE CanyonRecords
ADD Region INT NULL DEFAULT 0;

-- Optionally set a default value for existing records
-- UPDATE CanyonRecords SET Region = 0 WHERE Region IS NULL;
