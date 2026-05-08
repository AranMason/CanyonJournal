-- Migration: Add TripRating column to CanyonRecords
-- Date: 2026-05-08

ALTER TABLE CanyonRecords ADD TripRating INT NULL;
