-- Migration: Add UserCanyons table and UserCanyonId FK on CanyonRecords
-- Date: 2026-05-07

CREATE TABLE UserCanyons (
    Id               INT IDENTITY PRIMARY KEY,
    UserId           INT NOT NULL REFERENCES Users(Id),
    Name             NVARCHAR(200) NOT NULL,
    Url              NVARCHAR(255) NULL,
    Region           INT NULL,
    CanyonType       INT NULL,
    AquaticRating    INT NOT NULL DEFAULT 0,
    VerticalRating   INT NOT NULL DEFAULT 0,
    CommitmentRating INT NOT NULL DEFAULT 0,
    StarRating       INT NOT NULL DEFAULT 0,
    IsUnrated        BIT NOT NULL DEFAULT 1,
    Notes            NVARCHAR(1000) NULL,
    Created          DATETIME NOT NULL DEFAULT GETDATE(),
    Updated          DATETIME NOT NULL DEFAULT GETDATE()
);

ALTER TABLE CanyonRecords
ADD UserCanyonId INT NULL REFERENCES UserCanyons(Id);
