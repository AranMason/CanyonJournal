-- Migration: Add CanyonSources table and link to Canyons

CREATE TABLE CanyonSources (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    DisplayName NVARCHAR(200)  NOT NULL,
    LogoUrl     NVARCHAR(500)  NULL,
    WebsiteUrl  NVARCHAR(500)  NULL
);

-- Seed: Canyon Journal as a default source
INSERT INTO CanyonSources (DisplayName, LogoUrl, WebsiteUrl)
VALUES ('Canyon Journal', 'https://app.canyonjournal.co.uk/favicon.svg', 'https://app.canyonjournal.co.uk');

-- Add SourceId FK to Canyons
ALTER TABLE Canyons
    ADD SourceId INT NULL REFERENCES CanyonSources(Id);
