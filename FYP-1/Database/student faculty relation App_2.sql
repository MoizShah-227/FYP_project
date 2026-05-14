-- Create Database
CREATE DATABASE relationApp2;
GO
USE relationApp2;
GO

--- 1 user table
CREATE TABLE Users(
    u_id INT PRIMARY KEY IDENTITY(1,1),
    reg_no VARCHAR(100) UNIQUE,
    name VARCHAR(100),
    father_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(500),
    cnic VARCHAR(200) UNIQUE,
    phoneNo VARCHAR(100),
    gender VARCHAR(20),
    user_type VARCHAR(50),
    dob DATE,
    image VARCHAR(300),
    department VARCHAR(100),
    description VARCHAR(100),
    qualification VARCHAR(100),
    joining_date DATE,
    position VARCHAR(100)
);

--2 StudentSemester Table

CREATE TABLE StudentSemester (
    SS_id INT PRIMARY KEY IDENTITY(1,1),
    student_id INT NOT NULL,
    semester INT NOT NULL,
    section VARCHAR(10),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (student_id) REFERENCES Users(u_id) ON DELETE CASCADE
);

-- 3 Course Table

CREATE TABLE Course (
    C_id INT PRIMARY KEY IDENTITY(1,1),
    course_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    credit_hr INT NOT NULL
);

-- 4️ Enrollments Table
CREATE TABLE Enrollments (
    E_id INT PRIMARY KEY IDENTITY(1,1),
    student_semester_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date DATE DEFAULT GETDATE(),
    FOREIGN KEY (student_semester_id) REFERENCES StudentSemester(SS_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(C_id) ON DELETE CASCADE
);

-- 5️⃣ TeacherCourse Table
CREATE TABLE TeacherCourse (
    TC_id INT PRIMARY KEY IDENTITY(1,1),
    teacher_id INT NOT NULL,
    course_id INT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES Users(u_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(C_id) ON DELETE CASCADE
);

-- 6️ Event Table
CREATE TABLE Event (
    E_id INT PRIMARY KEY IDENTITY(1,1),
    event_name VARCHAR(100),
    description VARCHAR(200),
    image VARCHAR(300),
    event_date DATE,
    created_time TIME,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES Users(u_id) ON DELETE SET NULL
);

-- 7️ Announcements Table
CREATE TABLE Announcements(
    A_id INT PRIMARY KEY IDENTITY(1,1),
    message VARCHAR(500),
    image VARCHAR(300),
    type VARCHAR(100),
    created_at DATETIME,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES Users(u_id) ON DELETE SET NULL
);

-- 8️ Emojis Table
CREATE TABLE Emojis (
    E_id INT PRIMARY KEY IDENTITY(1,1),
    emoji VARCHAR(100) UNIQUE,
    isEnable BIT DEFAULT 0
);

-- 9️ Announcement_Reaction Table
CREATE TABLE Announcement_Reaction (
    AR_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    announcement_id INT,
    emoji_id INT,
    reacted_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Reaction_User FOREIGN KEY (user_id) REFERENCES Users(u_id) ON DELETE CASCADE,
    CONSTRAINT FK_Reaction_Announcement FOREIGN KEY (announcement_id) REFERENCES Announcements(A_id) ON DELETE CASCADE,
    CONSTRAINT FK_Reaction_Emoji FOREIGN KEY (emoji_id) REFERENCES Emojis(E_id) ON DELETE SET NULL,
    CONSTRAINT UQ_User_Announcement UNIQUE (user_id, announcement_id)
);

-- 10 Messages Table
CREATE TABLE Messages (
    M_id INT IDENTITY(1,1) PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    message VARCHAR(500),
    emoji NVARCHAR(100),
    sent_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Messages_Sender FOREIGN KEY (sender_id) REFERENCES Users(u_id) ON DELETE CASCADE,
    CONSTRAINT FK_Messages_Receiver FOREIGN KEY (receiver_id) REFERENCES Users(u_id) ON DELETE NO ACTION,
    CONSTRAINT CHK_Sender_Receiver CHECK (sender_id <> receiver_id)
);


-- 1️1️ hasfav Table
CREATE TABLE hasfav (
    F_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    fav_user_id INT,
    CONSTRAINT FK_hasfav_user FOREIGN KEY (user_id) REFERENCES Users(u_id) ON DELETE CASCADE,
    CONSTRAINT FK_hasfav_fav_user FOREIGN KEY (fav_user_id) REFERENCES Users(u_id) ON DELETE NO ACTION,
    CONSTRAINT UQ_hasfav UNIQUE (user_id, fav_user_id)
);


--12 message_Reaction table
CREATE TABLE Message_Reaction (
    MR_id INT IDENTITY(1,1) PRIMARY KEY,   -- Unique ID for each reaction
    user_id INT NOT NULL,                   -- Who reacted
    message_id INT NOT NULL,                -- Which message
    emoji_id INT NULL,                      -- Which emoji (nullable for SET NULL)
    reacted_at DATETIME DEFAULT GETDATE(),  -- Reaction timestamp

    -- Foreign keys
    CONSTRAINT FK_MessageReaction_User FOREIGN KEY (user_id) REFERENCES Users(u_id) ON DELETE CASCADE,
    CONSTRAINT FK_MessageReaction_Message FOREIGN KEY (message_id) REFERENCES Messages(M_id) ON DELETE NO ACTION,
    CONSTRAINT FK_MessageReaction_Emoji FOREIGN KEY (emoji_id) REFERENCES Emojis(E_id) ON DELETE SET NULL,

    CONSTRAINT UQ_User_Message_Emoji UNIQUE (user_id, message_id, emoji_id)
);




--13 preference Table
CREATE TABLE Preferences (
    p_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    private_status BIT DEFAULT 1,
    includes VARCHAR(500) NULL,  -- comma-separated list of user_ids allowed to reach
    CONSTRAINT FK_UserPreferences_User FOREIGN KEY (user_id) REFERENCES Users(u_id) ON DELETE CASCADE
);

--14 UserBlocked Table
CREATE TABLE UserBlocked (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,          -- The user who is blocking
    blocked_user_id INT NOT NULL,  -- The user being blocked
    blocked_at DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_UserBlocked_User FOREIGN KEY (user_id) REFERENCES Users(u_id) ON DELETE CASCADE,
    CONSTRAINT FK_UserBlocked_BlockedUser FOREIGN KEY (blocked_user_id) REFERENCES Users(u_id) ON DELETE NO ACTION,
    CONSTRAINT UQ_User_Blocked UNIQUE (user_id, blocked_user_id)  -- prevent duplicate blocks
);

---15 Notification
CREATE TABLE Notifications (
    N_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,           -- Who receives the notification
    type VARCHAR(50) NOT NULL,      -- 'message', 'announcement', 'event', etc.
    reference_id INT NULL,          -- ID of the related record (e.g., message_id, A_id, E_id)
    content VARCHAR(500) NULL,      -- Optional content snippet
    is_read BIT DEFAULT 0,          -- Whether the notification has been read
    created_at DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Notifications_User FOREIGN KEY (user_id) REFERENCES Users(u_id) ON DELETE CASCADE
);


select * from Users


UPDATE Users SET reg_no = '2022-ARID-1111' WHERE u_id = 1;  -- Ali Raza
UPDATE Users SET reg_no = '2023-ARID-4214' WHERE u_id = 2;  -- Sara Khan
UPDATE Users SET reg_no = '2023-ARID-4215' WHERE u_id = 5;  -- Bilal Ahmed
UPDATE Users SET reg_no = '2021-ARID-4216' WHERE u_id = 7;  -- Zain Ali
UPDATE Users SET reg_no = '2023-ARID-4217' WHERE u_id = 8;  -- Fatima Zahra
UPDATE Users SET reg_no = '2023-ARID-4218' WHERE u_id = 10; -- Iqra Javed
UPDATE Users SET reg_no = '2024-ARID-4219' WHERE u_id = 13; -- Danish Qureshi
UPDATE Users SET reg_no = '2019-ARID-4220' WHERE u_id = 14; -- Kiran Shah
UPDATE Users SET reg_no = '2023-ARID-4221' WHERE u_id = 16; -- Laiba Noor
UPDATE Users SET reg_no = '2022-ARID-4222' WHERE u_id = 18; -- Anaya Iqbal
UPDATE Users SET reg_no = '2023-ARID-4223' WHERE u_id = 20; -- Noor Fatima




---NEED TO UPDATE DATABASE



UPDATE Users SET reg_no = '2022-BIIT-2222' WHERE u_id = 3;  -- Usman Tariq
UPDATE Users SET reg_no = '2021-BIIT-4502' WHERE u_id = 6;  -- Hina Malik
UPDATE Users SET reg_no = '2017-BIIT-4503' WHERE u_id = 9;  -- Hamza Saeed
UPDATE Users SET reg_no = '2020-BIIT-4504' WHERE u_id = 12; -- Mariam Asif
UPDATE Users SET reg_no = '2016-BIIT-4505' WHERE u_id = 15; -- Taha Siddiqui
UPDATE Users SET reg_no = '2022-BIIT-4506' WHERE u_id = 19; -- Farhan Ali

UPDATE Users SET reg_no = '2022-BIIT-3333' WHERE u_id = 4;  -- Ayesha Noor
UPDATE Users SET reg_no = '2019-BIIT-4602' WHERE u_id = 11; -- Omar Farooq
UPDATE Users SET reg_no = '2015-BIIT-4603' WHERE u_id = 17; -- Saad Malik

select * from users


ALTER TABLE Announcements
ADD 
    from_date DATE NULL,
    to_date DATE NULL,
    is_active BIT DEFAULT 1;


INSERT INTO hasfav (user_id, fav_user_id)
VALUES (1, 3);

select * from hasfav

UPDATE Users
SET dob = CAST(GETDATE() AS DATE)
WHERE u_id = 3;

ALTER TABLE Messages ADD birthday_wish BIT NOT NULL CONSTRAINT DF_Messages_birthday_wish DEFAULT 0;

select * from Users
select * from hasfav

select * from event
select * from Messages

SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Messages'
  AND COLUMN_NAME IN ('birthday_wish', 'event_id');



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
  SELECT 1 FROM sys.indexes
  WHERE name = 'IX_Messages_sender_event' AND object_id = OBJECT_ID('dbo.Messages')
)
BEGIN
  CREATE INDEX IX_Messages_sender_event ON dbo.Messages(sender_id, event_id);
END
GO


select * from Emojis



-- =====================================================
-- STEP 1: Emojis table mein keywords column add karo
-- =====================================================
 
ALTER TABLE Emojis
ADD keywords VARCHAR(300) NULL;
 
-- =====================================================
-- STEP 2: Har emoji ke liye keywords update karo
-- (Apne actual emojis ke mutabiq update karo)
-- =====================================================
 
-- Happy / Love emojis
-- =====================================================
-- STEP 3: Index banao searching ke liye (optional)
-- =====================================================
 
CREATE INDEX IX_Emojis_keywords ON Emojis(keywords);
CREATE INDEX IX_Emojis_isEnable  ON Emojis(isEnable);
 
-- =====================================================
-- STEP 4: Check karo
-- =====================================================
 select * from Emojis

SELECT E_id, emoji, keywords, isEnable
FROM Emojis

ORDER BY E_id;




select * from users
UPDATE users
SET 
    name = CASE 
        WHEN u_id = 4  THEN 'Nadia Arif'

        WHEN u_id = 5  THEN 'Hussnain Qureshi'
        WHEN u_id = 6  THEN 'Beenish Abbasi'
        WHEN u_id = 7  THEN 'Muhammad Qasim'
        WHEN u_id = 8  THEN 'Muhammad Faisal'
        WHEN u_id = 9  THEN 'Saeed Watto'
        WHEN u_id = 10 THEN 'Samia Noor'
        WHEN u_id = 11 THEN 'Nadeem'
        WHEN u_id = 12 THEN 'Summaiya Islam'
        WHEN u_id = 13 THEN 'Abid Ali'
        WHEN u_id = 14 THEN 'Aleena Wahid'
        WHEN u_id = 15 THEN 'Shahid Jameel'
        WHEN u_id = 16 THEN 'Sara Arooj'
        WHEN u_id = 17 THEN 'Sohaib Mughal'
        WHEN u_id = 18 THEN 'Anum Noor'
        WHEN u_id = 19 THEN 'Zeeshan Muzaffar'
        WHEN u_id = 20 THEN 'Raja Fahad'
        ELSE name 
    END,
    image = CASE 
        WHEN u_id = 4  THEN 'Nadia.hpeg'
        WHEN u_id = 5  THEN 'Hussnain.jpeg'
        WHEN u_id = 6  THEN 'Beenish.jpeg'
        WHEN u_id = 7  THEN 'Qasim.jpeg'
        WHEN u_id = 8  THEN 'Faisal.jpeg'
        WHEN u_id = 9  THEN 'saeed.jpeg'
        WHEN u_id = 10 THEN 'samia.jpeg'
        WHEN u_id = 11 THEN 'Nadeem.jpeg'
        WHEN u_id = 12 THEN 'summaiya.jpeg'
        WHEN u_id = 13 THEN 'Abid.jpeg'
        WHEN u_id = 14 THEN 'Aleena.jpeg'
        WHEN u_id = 15 THEN 'shahid.jpeg'
        WHEN u_id = 16 THEN 'sara.jpeg'
        WHEN u_id = 17 THEN 'sohaib.jpeg'
        WHEN u_id = 18 THEN 'Anum.jpeg'
        WHEN u_id = 19 THEN 'zeeshan.jpeg'
        WHEN u_id = 20 THEN 'Fahad.jpeg'
        ELSE image 
    END
WHERE u_id BETWEEN 4 AND 20;

UPDATE users 
SET 
    name = 'Noor ul Ain',
    image = 'Noor.jpeg'
WHERE u_id = 12
sle