-- Goals: user-configurable goals for guide training and personal targets
CREATE TABLE Goals (
    Id                  INT IDENTITY PRIMARY KEY,
    UserId              INT NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    Label               NVARCHAR(200) NOT NULL,
    MinCount            INT NOT NULL DEFAULT 1,
    MinVerticalRating   INT NULL,
    MinAquaticRating    INT NULL,
    MinCommitmentRating INT NULL,
    -- 'records'          = count individual CanyonRecord rows
    -- 'days'             = count distinct calendar dates (canyoning days)
    -- 'distinct_canyons' = count distinct canyons visited; official and user canyons
    --                      are namespaced ('c'/'u' prefix) to avoid integer Id collisions
    CountMode           NVARCHAR(20) NOT NULL DEFAULT 'records'
                        CHECK (CountMode IN ('records', 'days', 'distinct_canyons')),
    StartDate           DATE NULL,       -- if set, only records on/after this date count
    CompletedAt         DATETIME2 NULL,  -- soft-delete: set by 'Mark Complete', null = active
    SortOrder           INT NOT NULL DEFAULT 0
);

-- Tag filter: AND semantics — a record must have ALL listed tags to count
CREATE TABLE GoalTags (
    RequirementId INT NOT NULL REFERENCES Goals(Id) ON DELETE CASCADE,
    TagId         INT NOT NULL REFERENCES Tags(Id) ON DELETE CASCADE,
    PRIMARY KEY (RequirementId, TagId)
);

