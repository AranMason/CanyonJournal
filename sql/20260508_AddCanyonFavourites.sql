-- Migration: Add CanyonFavourites table
-- Date: 2026-05-08

CREATE TABLE CanyonFavourites (
    Id           INT IDENTITY PRIMARY KEY,
    UserId       INT NOT NULL REFERENCES Users(Id),
    CanyonId     INT NULL REFERENCES Canyons(Id),
    UserCanyonId INT NULL REFERENCES UserCanyons(Id),
    Created      DATETIME NOT NULL DEFAULT GETDATE()
);

-- Prevent duplicate favourites per user
CREATE UNIQUE INDEX UQ_CanyonFavourites_Canyon
    ON CanyonFavourites (UserId, CanyonId)
    WHERE CanyonId IS NOT NULL;

CREATE UNIQUE INDEX UQ_CanyonFavourites_UserCanyon
    ON CanyonFavourites (UserId, UserCanyonId)
    WHERE UserCanyonId IS NOT NULL;
