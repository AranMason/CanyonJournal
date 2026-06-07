
ALTER TABLE Canyons DROP COLUMN LastUpdated
GO

ALTER TABLE Canyons ADD LastUpdated DATETIME DEFAULT GETUTCDATE()

UPDATE Canyons SET LastUpdated = GETUTCDATE()

ALTER TABLE GoalRules DROP CONSTRAINT CK_GoalRules_RuleType;

ALTER TABLE GoalRules
ADD CONSTRAINT CK_GoalRules_RuleType
CHECK (RuleType IN (
    'canyon_type',
    'min_vertical', 'min_aquatic', 'min_commitment', 'min_star',
    'tag', 'first_time'
));