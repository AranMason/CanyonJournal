-- Migration: Expand Comments column from NVARCHAR(1000) to NVARCHAR(MAX)
-- Date: 2026-01-12

ALTER TABLE CanyonRecords
ALTER COLUMN Comments NVARCHAR(MAX) NULL;
