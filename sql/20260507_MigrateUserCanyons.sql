-- Migration: Populate UserCanyons from existing freeform CanyonRecords
-- Deduplicates by (UserId, LOWER(Name)), taking the most recent Url and Region per group.
-- Date: 2026-05-07

-- Step 1: Insert one UserCanyon per unique (UserId, lower-cased Name) from freeform records.
INSERT INTO UserCanyons (UserId, Name, Url, Region)
SELECT
    cr.UserId,
    -- Use the Name from the most recent record in the group to preserve original casing
    MAX(cr.Name) AS Name,
    MAX(cr.Url) AS Url,
    MAX(cr.Region) AS Region
FROM CanyonRecords cr
WHERE cr.CanyonId IS NULL
GROUP BY cr.UserId, LOWER(cr.Name);

-- Step 2: Back-fill UserCanyonId on existing freeform CanyonRecords.
UPDATE cr
SET cr.UserCanyonId = uc.Id
FROM CanyonRecords cr
JOIN UserCanyons uc
    ON uc.UserId = cr.UserId
    AND LOWER(uc.Name) = LOWER(cr.Name)
WHERE cr.CanyonId IS NULL;
