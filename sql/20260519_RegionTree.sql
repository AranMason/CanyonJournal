-- Migration: Replace flat Region INT enum with a hierarchical Regions table
-- Creates Regions + RegionTranslations, seeds initial data, migrates Canyons and UserCanyons.

-- ─── 1. Create Regions table ─────────────────────────────────────────────────

CREATE TABLE Regions (
    Id        INT IDENTITY PRIMARY KEY,
    ParentId  INT NULL REFERENCES Regions(Id),
    Slug      NVARCHAR(100) NOT NULL,
    Symbol    NVARCHAR(20) NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive  BIT NOT NULL DEFAULT 1,
    CONSTRAINT UQ_Regions_Slug UNIQUE (Slug)
);

-- ─── 3. Seed region tree ─────────────────────────────────────────────────────
-- Insert continents first, then countries, then UK sub-regions.
-- Region display names are managed via JSON localisation files (src/locales/*/regions.json),
-- keyed by slug. The DB stores only structure (hierarchy, symbol, sort order).

-- Continents
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (NULL, 'europe',        N'🌍', 10);
DECLARE @EuropeId INT = SCOPE_IDENTITY();

INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (NULL, 'north-america', N'🌎', 20);
DECLARE @NorthAmericaId INT = SCOPE_IDENTITY();

INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (NULL, 'south-america', N'🌎', 30);
DECLARE @SouthAmericaId INT = SCOPE_IDENTITY();

INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (NULL, 'asia',          N'🌏', 40);
DECLARE @AsiaId INT = SCOPE_IDENTITY();

INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (NULL, 'oceania',       N'🌏', 50);
DECLARE @OceaniaId INT = SCOPE_IDENTITY();

INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (NULL, 'africa',        N'🌍', 60);
DECLARE @AfricaId INT = SCOPE_IDENTITY();

-- Europe: UK (parent) and its sub-regions (map to old enum values 1–5)
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'united-kingdom', N'🇬🇧', 5);
DECLARE @UkId INT = SCOPE_IDENTITY();

INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@UkId, 'scotland',         N'🏴󠁧󠁢󠁳󠁣󠁴󠁿', 1);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@UkId, 'england',          N'🏴󠁧󠁢󠁥󠁮󠁧󠁿', 2);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@UkId, 'wales',            N'🏴󠁧󠁢󠁷󠁬󠁳󠁿', 3);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@UkId, 'northern-ireland', N'🇬🇧', 4);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@UkId, 'isle-of-man',      N'🇮🇲', 5);

-- Europe: other countries (alphabetical)
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'albania',         N'🇦🇱', 10);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'andorra',         N'🇦🇩', 20);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'austria',         N'🇦🇹', 30);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'bulgaria',        N'🇧🇬', 40);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'croatia',         N'🇭🇷', 50);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'france',          N'🇫🇷', 60);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'germany',         N'🇩🇪', 70);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'greece',          N'🇬🇷', 80);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'iceland',         N'🇮🇸', 90);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'ireland',         N'🇮🇪', 100);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'italy',           N'🇮🇹', 110);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'montenegro',      N'🇲🇪', 120);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'north-macedonia', N'🇲🇰', 130);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'norway',          N'🇳🇴', 140);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'poland',          N'🇵🇱', 150);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'portugal',        N'🇵🇹', 160);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'slovakia',        N'🇸🇰', 170);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'slovenia',        N'🇸🇮', 180);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'spain',           N'🇪🇸', 190);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'switzerland',     N'🇨🇭', 200);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@EuropeId, 'turkey',          N'🇹🇷', 210);

-- North America (enum values 9–11, 27)
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@NorthAmericaId, 'canada',     N'🇨🇦', 10);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@NorthAmericaId, 'costa-rica', N'🇨🇷', 20);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@NorthAmericaId, 'mexico',     N'🇲🇽', 30);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@NorthAmericaId, 'usa',        N'🇺🇸', 40);

-- South America (enum values 22–25)
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@SouthAmericaId, 'argentina', N'🇦🇷', 10);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@SouthAmericaId, 'brazil',    N'🇧🇷', 20);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@SouthAmericaId, 'chile',     N'🇨🇱', 30);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@SouthAmericaId, 'peru',      N'🇵🇪', 40);

-- Asia (enum values 21, 32, 33)
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@AsiaId, 'china', N'🇨🇳', 10);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@AsiaId, 'japan', N'🇯🇵', 20);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@AsiaId, 'nepal', N'🇳🇵', 30);

-- Oceania (enum values 12–13)
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@OceaniaId, 'australia',  N'🇦🇺', 10);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@OceaniaId, 'new-zealand', N'🇳🇿', 20);

-- Africa (enum values 19, 35)
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@AfricaId, 'morocco',     N'🇲🇦', 10);
INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder) VALUES (@AfricaId, 'south-africa', N'🇿🇦', 20);

-- ─── 4. Add RegionId FK to Canyons and UserCanyons ───────────────────────────

ALTER TABLE Canyons
    ADD RegionId INT NULL REFERENCES Regions(Id);

ALTER TABLE UserCanyons
    ADD RegionId INT NULL REFERENCES Regions(Id);

-- ─── 5. Migrate existing Region INT values → RegionId ────────────────────────
-- Maps old enum integers to the new Regions.Id values via slug lookup.

-- Build a one-off mapping CTE and update in a single pass.
-- Old enum: Scotland=1, England=2, Wales=3, NorthernIreland=4, IsleOfMan=5,
--           Spain=6, France=7, Italy=8, USA=9, Canada=10, Mexico=11,
--           Australia=12, NewZealand=13, Switzerland=14, Austria=15,
--           Norway=16, Portugal=17, Greece=18, Morocco=19, Nepal=21,
--           Brazil=22, Argentina=23, Chile=24, Peru=25, CostaRica=27,
--           Iceland=28, Germany=31, China=32, Japan=33, Turkey=34, SouthAfrica=35

WITH EnumMap AS (
    SELECT enumVal, r.Id AS NewRegionId FROM (VALUES
        (1,  'scotland'),
        (2,  'england'),
        (3,  'wales'),
        (4,  'northern-ireland'),
        (5,  'isle-of-man'),
        (6,  'spain'),
        (7,  'france'),
        (8,  'italy'),
        (9,  'usa'),
        (10, 'canada'),
        (11, 'mexico'),
        (12, 'australia'),
        (13, 'new-zealand'),
        (14, 'switzerland'),
        (15, 'austria'),
        (16, 'norway'),
        (17, 'portugal'),
        (18, 'greece'),
        (19, 'morocco'),
        (21, 'nepal'),
        (22, 'brazil'),
        (23, 'argentina'),
        (24, 'chile'),
        (25, 'peru'),
        (27, 'costa-rica'),
        (28, 'iceland'),
        (31, 'germany'),
        (32, 'china'),
        (33, 'japan'),
        (34, 'turkey'),
        (35, 'south-africa')
    ) AS m(enumVal, slug)
    JOIN Regions r ON r.Slug = m.slug
)
UPDATE Canyons
    SET RegionId = em.NewRegionId
FROM Canyons c
JOIN EnumMap em ON em.enumVal = c.Region
WHERE c.Region IS NOT NULL AND c.Region != 0;

WITH EnumMap AS (
    SELECT enumVal, r.Id AS NewRegionId FROM (VALUES
        (1,  'scotland'),
        (2,  'england'),
        (3,  'wales'),
        (4,  'northern-ireland'),
        (5,  'isle-of-man'),
        (6,  'spain'),
        (7,  'france'),
        (8,  'italy'),
        (9,  'usa'),
        (10, 'canada'),
        (11, 'mexico'),
        (12, 'australia'),
        (13, 'new-zealand'),
        (14, 'switzerland'),
        (15, 'austria'),
        (16, 'norway'),
        (17, 'portugal'),
        (18, 'greece'),
        (19, 'morocco'),
        (21, 'nepal'),
        (22, 'brazil'),
        (23, 'argentina'),
        (24, 'chile'),
        (25, 'peru'),
        (27, 'costa-rica'),
        (28, 'iceland'),
        (31, 'germany'),
        (32, 'china'),
        (33, 'japan'),
        (34, 'turkey'),
        (35, 'south-africa')
    ) AS m(enumVal, slug)
    JOIN Regions r ON r.Slug = m.slug
)
UPDATE UserCanyons
    SET RegionId = em.NewRegionId
FROM UserCanyons uc
JOIN EnumMap em ON em.enumVal = uc.Region
WHERE uc.Region IS NOT NULL AND uc.Region != 0;

-- ─── 7. Retire old Region INT columns (renamed for recovery, not dropped) ────
-- Use sp_rename to preserve data while making clear these columns are no longer active.

EXEC sp_rename 'Canyons.Region',     'zzz_Region_Legacy', 'COLUMN';
EXEC sp_rename 'UserCanyons.Region', 'zzz_Region_Legacy', 'COLUMN';
