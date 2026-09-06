ALTER TABLE CanyonSources ADD IsEnabled BIT DEFAULT 0

UPDATE CanyonSources SET IsEnabled=1

SELECT * FROM CanyonSources