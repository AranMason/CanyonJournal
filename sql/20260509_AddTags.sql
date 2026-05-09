CREATE TABLE Tags (
    Id     INT IDENTITY PRIMARY KEY,
    UserId INT NOT NULL REFERENCES Users(Id),
    Name   NVARCHAR(100) NOT NULL,
    CONSTRAINT UQ_Tags_UserName UNIQUE (UserId, Name)
);

CREATE TABLE CanyonRecordTags (
    CanyonRecordId INT NOT NULL REFERENCES CanyonRecords(Id),
    TagId          INT NOT NULL REFERENCES Tags(Id),
    PRIMARY KEY (CanyonRecordId, TagId)
);
