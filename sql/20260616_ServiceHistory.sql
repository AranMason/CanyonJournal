CREATE TABLE GearServiceRecords (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    GearItemId INT NOT NULL,
    ServiceDate DATE NOT NULL,
    ServiceType INT NOT NULL,
    Notes NVARCHAR(MAX),
    FOREIGN KEY (GearItemId) REFERENCES GearItems(Id),
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

INSERT INTO GearServiceRecords (GearItemId, UserId, ServiceDate, ServiceType, Notes)
SELECT Id, UserId, LastServicedDate, 1, 'Imported' FROM GearItems WHERE LastServicedDate IS NOT NULL;

INSERT INTO GearServiceRecords (GearItemId, UserId, ServiceDate, ServiceType, Notes)
SELECT Id, UserId, LastInspectionDate, 2, 'Imported' FROM GearItems WHERE LastInspectionDate IS NOT NULL;

ALTER TABLE GearItems DROP COLUMN LastServicedDate;
ALTER TABLE RopeItems DROP COLUMN LastServicedDate;
ALTER TABLE GearItems DROP COLUMN LastInspectionDate;
ALTER TABLE RopeItems DROP COLUMN LastInspectionDate;

SELECT * FROM GearItems;
SELECT * FROM RopeItems;
SELECT * FROM GearServiceRecords;