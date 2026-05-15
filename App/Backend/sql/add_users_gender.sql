-- Run once if Users.gender does not exist (male / female / m / f)
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'gender'
)
BEGIN
  ALTER TABLE Users ADD gender VARCHAR(20) NULL;
END;
