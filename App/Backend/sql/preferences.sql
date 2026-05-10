-- Optional reference DDL (run manually if the table does not exist yet)
/*
CREATE TABLE Preferences (
    p_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    private_status BIT DEFAULT 1,
    includes VARCHAR(500) NULL,
    CONSTRAINT FK_UserPreferences_User FOREIGN KEY (user_id) REFERENCES Users(u_id) ON DELETE CASCADE
);
*/
