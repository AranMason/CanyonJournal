-- Is Retired
ALTER TABLE GearItems ADD IsRetired BIT DEFAULT 0;
ALTER TABLE RopeItems ADD IsRetired BIT DEFAULT 0;

-- Manufacturer
ALTER TABLE GearItems ADD Manufacturer NVARCHAR(255);
ALTER TABLE RopeItems ADD Manufacturer NVARCHAR(255);
ALTER TABLE GearItems ADD ManufactureDate DATE;
ALTER TABLE RopeItems ADD ManufactureDate DATE;

ALTER TABLE GearItems ADD InServiceDate DATE;
ALTER TABLE RopeItems ADD InServiceDate DATE;

ALTER TABLE GearItems ADD RetirementDate DATE;
ALTER TABLE RopeItems ADD RetirementDate DATE;

ALTER TABLE GearItems ADD SerialNumber NVARCHAR(255);
ALTER TABLE RopeItems ADD SerialNumber NVARCHAR(255);

ALTER TABLE GearItems ADD Model NVARCHAR(255);
ALTER TABLE RopeItems ADD Model NVARCHAR(255);

ALTER TABLE GearItems ADD LastInspectionDate DATE;
ALTER TABLE RopeItems ADD LastInspectionDate DATE;

ALTER TABLE GearItems ADD LastServicedDate DATE;
ALTER TABLE RopeItems ADD LastServicedDate DATE;

ALTER TABLE GearItems ADD WeightGrams FLOAT;
ALTER TABLE RopeItems ADD WeightGrams FLOAT;

ALTER TABLE RopeItems ADD ParentRopeItemsId INT NULL;
ALTER TABLE RopeItems ADD CONSTRAINT FK_RopeItems_ParentRopeItemsId FOREIGN KEY (ParentRopeItemsId) REFERENCES RopeItems(Id);

