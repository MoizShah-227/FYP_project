USE relationApp2;
GO

IF COL_LENGTH('dbo.Messages', 'event_id') IS NULL
BEGIN
  ALTER TABLE dbo.Messages ADD event_id INT NULL;
END
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Messages_Event'
)
BEGIN
  ALTER TABLE dbo.Messages ADD CONSTRAINT FK_Messages_Event
    FOREIGN KEY (event_id) REFERENCES dbo.[Event](E_id) ON DELETE SET NULL;
END
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes WHERE name = 'IX_Messages_sender_event' AND object_id = OBJECT_ID('dbo.Messages')
)
BEGIN
  CREATE INDEX IX_Messages_sender_event ON dbo.Messages(sender_id, event_id);
END
GO
