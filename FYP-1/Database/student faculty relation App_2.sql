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
