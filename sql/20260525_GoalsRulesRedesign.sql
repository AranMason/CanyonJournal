-- Goals feature: migrate from flat filter columns + GoalTags to a flexible GoalRules table.
-- Since the Goals feature is not yet live, this replaces the 20260523_Goals.sql schema entirely.

-- ─── 1. Drop old bridge table ───────────────────────────────────────────────
DROP TABLE IF EXISTS GoalTags;

-- ─── 2. Alter Goals table ───────────────────────────────────────────────────

-- Remove flat rating filter columns (replaced by GoalRules)
ALTER TABLE Goals DROP COLUMN MinVerticalRating;
ALTER TABLE Goals DROP COLUMN MinAquaticRating;
ALTER TABLE Goals DROP COLUMN MinCommitmentRating;

-- MinCount is nullable for 'all_in_region' mode where the target is dynamic
ALTER TABLE Goals ALTER COLUMN MinCount INT NULL;

-- Region scope for 'all_in_region' (and optional filter for other modes)
ALTER TABLE Goals ADD RegionId INT NULL REFERENCES Regions(Id);

-- Rolling time window (days): mutually exclusive with StartDate
ALTER TABLE Goals ADD RollingDays INT NULL;

-- Drop the auto-generated CountMode CHECK constraint (name varies by environment)
DECLARE @constraintName NVARCHAR(200);
SELECT @constraintName = name FROM sys.check_constraints
  WHERE parent_object_id = OBJECT_ID('Goals') AND definition LIKE '%CountMode%';
IF @constraintName IS NOT NULL
  EXEC('ALTER TABLE Goals DROP CONSTRAINT [' + @constraintName + ']');

ALTER TABLE Goals ADD CONSTRAINT CK_Goals_CountMode
    CHECK (CountMode IN (
        'records',
        'days',
        'distinct_canyons',
        'distinct_regions',
        'all_in_region'
    ));

-- ─── 3. Create GoalRules table ──────────────────────────────────────────────
-- Each row is one filter condition applied to trips before they are counted.
-- IsExclusion = 0 → trip must match; IsExclusion = 1 → trip must NOT match.
CREATE TABLE GoalRules (
    Id          INT IDENTITY PRIMARY KEY,
    GoalId      INT NOT NULL REFERENCES Goals(Id) ON DELETE CASCADE,

    -- Rule type determines which fields are used:
    --   'canyon_type'     → IntValues = comma-separated CanyonTypeEnum values (e.g. '1,2')
    --   'min_vertical'    → IntValue  = minimum vertical rating (1–7)
    --   'min_aquatic'     → IntValue  = minimum aquatic rating (1–7)
    --   'min_commitment'  → IntValue  = minimum commitment rating (0–6)
    --   'tag'             → IntValues = comma-separated tagIds (AND semantics)
    --   'first_time'      → no values (trip must be user's first visit to that canyon)
    -- Note: region scope is stored as Goals.RegionId (not a rule row)
    RuleType    NVARCHAR(30) NOT NULL
                CONSTRAINT CK_GoalRules_RuleType CHECK (RuleType IN (
                    'canyon_type',
                    'min_vertical', 'min_aquatic', 'min_commitment',
                    'tag', 'first_time'
                )),

    IntValue    INT NULL,            -- single integer value
    IntValues   NVARCHAR(500) NULL,  -- comma-separated list for multi-value rules

    IsExclusion BIT NOT NULL DEFAULT 0
);
