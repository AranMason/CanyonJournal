CREATE TABLE GearItemSet (
    Id                  INT IDENTITY PRIMARY KEY,
    UserId              INT NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    Name                NVARCHAR(255)
)

CREATE TABLE GearItemSetMember (
    SetId INT REFERENCES GearItemSet(Id) ON DELETE CASCADE,
    GearId INT REFERENCES GearItems(Id) ON DELETE CASCADE
)

