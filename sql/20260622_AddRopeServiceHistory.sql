CREATE TABLE RopeServiceRecords (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    RopeItemId INT NOT NULL,
    ServiceDate DATE NOT NULL,
    ServiceType INT NOT NULL,
    Notes NVARCHAR(MAX),
    FOREIGN KEY (RopeItemId) REFERENCES RopeItems(Id),
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

SELECT * FROM RopeItems;
SELECT * FROM RopeServiceRecords;
