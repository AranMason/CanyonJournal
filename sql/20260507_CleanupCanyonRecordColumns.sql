-- Cleanup: Remove Name, Url, Region from CanyonRecords now that every record
-- is linked to a Canyon (via CanyonId) or UserCanyon (via UserCanyonId).
-- These fields are now returned as derived values via JOIN in the API.
-- Date: 2026-05-07
-- ⚠️ Run AFTER 20260507_MigrateUserCanyons.sql

ALTER TABLE CanyonRecords DROP COLUMN Name;
ALTER TABLE CanyonRecords DROP COLUMN Url;
ALTER TABLE CanyonRecords DROP COLUMN Region;
