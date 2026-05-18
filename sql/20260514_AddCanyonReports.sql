-- CanyonReports: stores user-submitted issues about verified canyons
CREATE TABLE CanyonReports (
    Id                INT IDENTITY(1,1) PRIMARY KEY,
    CanyonId          INT NOT NULL REFERENCES Canyons(Id),
    UserId            INT NOT NULL REFERENCES Users(Id),
    IssueType         INT NOT NULL,           -- 1=BrokenLink, 2=IncorrectData, 3=Other
    Description       NVARCHAR(1000) NULL,
    Status            INT NOT NULL DEFAULT 0, -- 0=Pending, 1=TBD, 2=Reviewed, 3=Rejected
    AdminNotes        NVARCHAR(1000) NULL,
    ReviewedAt        DATETIME NULL,
    ReviewedByUserId  INT NULL REFERENCES Users(Id),
    CreatedAt         DATETIME NOT NULL DEFAULT GETDATE()
);
