ALTER TABLE GearServiceRecords ADD StatusCode SMALLINT DEFAULT 1
UPDATE GearServiceRecords SET StatusCode = 1

ALTER TABLE RopeServiceRecords ADD StatusCode SMALLINT DEFAULT 1
UPDATE RopeServiceRecords SET StatusCode = 1

SELECT * FROM GearServiceRecords

SELECT * FROM RopeServiceRecords