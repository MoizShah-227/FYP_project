create database relationApp
	
--1
create table Users(u_id int primary key identity(1,1),reg_no varchar(100) unique
,name varchar(100),father_name varchar(100),email varchar(100) unique,
password varchar(500),cnic varchar(200) unique,phoneNo varchar(100),
gender varchar(20),user_type varchar(50),dob DATE ,image varchar(300),
section varchar(50),semester int,department varchar(100),
description varchar(100),qualification varchar(100),joining_data Date,position varchar(100)
,)
	drop table users
	delete from users

	select * from users

INSERT INTO Users(reg_no,name,father_name,email,password,cnic,phoneNo,gender,user_type,dob,position,joining_data)
VALUES ('ADM-001','Muhammad Nadeem','Ghulam Abbas','nadeem.admin@college.pk','12345',
'35202-4589123-7','0306-5891234','Male','Admin','1985-04-12','Senior Administrator','2019-03-15');

INSERT INTO Users(reg_no,name,father_name,email,password,cnic,phoneNo,gender,user_type,dob,qualification,description,joining_data,department)
VALUES ('TEH-007','Samia Noor','Noor Abbas','samianoor333886@gmail.com','12345',
'37405-72455-8','03176278319','female','Teacher','2004-10-12',
'BSCS Computer Science','Expert in Software Engineering & Databases','2021-08-10','Computer Science');

INSERT INTO Users(reg_no,name,father_name,email,password,cnic,phoneNo,gender,user_type,dob,section,semester,department)
VALUES ('BSCS-23-045','Ahmed Raza','Riaz Ahmed','ahmed.raza23@students.pk','12345',
'37405-6589321-4','0345-8596321','Male','Student','2004-01-17','A',3,'Computer Science');


INSERT INTO Users(reg_no,name,father_name,email,password,cnic,phoneNo,gender,user_type,dob,image,section,semester,department,description,qualification,joining_data,position)
VALUES
('ADM-001','Nadeem','Muhammad Fazil','nadeem@gmail.com','nadeem123','43030-1233075-6','3152566048','Male','Admin','1985-03-11',NULL,NULL,NULL,'Management','Oversees administrative tasks','Masters','2020-10-09','Admin'),

('TEC-001','Umer Farooq','Muhammad Farooq','umer@gmail.com','umer123','42039-0231589-2','3160588409','Male','Teacher','1983-08-10',NULL,NULL,NULL,'Management','Teaches computer science fundamentals','PhD in CS','2008-08-09','Senior Teacher'),

('TEC-002','Shahid Jamil','Muhammad Jamil','shahid@gmail.com','shahid123','31035-1023690-5','3221506987','Male','Teacher','1987-01-19',NULL,NULL,NULL,'Management','AI and machine learning specialist','PhD in AI','2008-10-06','Senior Teacher'),

('TEC-003','Saeed Watto','Maroof Hussain','saeed@gmail.com','saeed123','37032-8920813-1','3120688999','Male','Teacher','1991-06-14',NULL,NULL,NULL,'Management','Software engineering expert','PhD in SE','2010-02-09','Senior Teacher'),

('TEC-004','Sir Hassan','Mujtaba Hussain','hassan@gmail.com','hassan123','29090-2152389-0','3360566486','Male','Teacher','1992-05-09',NULL,NULL,NULL,'Management','AI research and practical applications','PhD in AI','2013-07-21','Senior Teacher'),

('TEC-005','Zahid Ahmed','Muhammad Razzaq','zahid@gmail.com','zahid123','30730-1235489-8','3435595123','Male','Teacher','1985-05-10',NULL,NULL,NULL,'Management','Cloud computing and cybersecurity expert','PhD in CS','2015-12-17','Senior Teacher'),

('22-ARID-4213','Muhammad Ahsan','Ghulam Mustafa','ahsan@gmail.com','ahsan123','39060-0201902-1','3445467489','Male','Student','2002-04-10',NULL,'A',7,'BSCS','Active participant in coding competitions',NULL,'2022-10-03',NULL),

('21-ARID-4082','Rehan Abbasi','Wajid Hussain','rehan@gmail.com','rehan123','38030-7892802-9','3475869086','Male','Student','2003-06-22',NULL,'A',9,'BSCS','Focused on software development projects',NULL,'2021-10-01',NULL),

('22-ARID-3924','Hammad Ali','Muhammad Amjad','hammad@gmail.com','hammad123','33035-1423658-3','3229221806','Male','Student','2004-09-17',NULL,'A',7,'BSCS','AI and ML enthusiast',NULL,'2022-10-03',NULL),

('22-ARID-3215','Abrar Ahmed','Asad Nadeem','abrar@gmail.com','abrar123','36032-1233086-8','3169876542','Male','Student','2000-08-13',NULL,'B',7,'BSCS','Active in hackathons and clubs',NULL,'2022-10-03',NULL),

('22-ARID-3002','Mirza Sohaib Baig','Muhammad Farooq','sohaib@gmail.com','sohaib123','33032-2065891-2','3140566404','Male','Student','2002-11-17',NULL,'C',7,'BSSE','Networking and software engineering focused',NULL,'2022-10-03',NULL),

('22-ARID-7452','Ahmed Ali','Tariq Mehmood','ahmed@gmail.com','ahmed123','35035-1200658-4','3335305664','Male','Student','2001-04-02',NULL,'C',7,'BSAI','Works on AI research projects',NULL,'2022-10-03',NULL),

('22-ARID-4025','Muhammad Faisal','Muhammad Fazil','faisal@gmail.com','faisal123','39033-2035915-7','3125591060','Male','Student','2003-09-26',NULL,'A',7,'BSAI','Strong interest in deep learning',NULL,'2022-10-03',NULL),

('22-ARID-1102','Farhan Ali','Muhammad Bilal','farhan@gmail.com','farhan123','38032-4536980-9','3102588109','Male','Student','2002-12-08',NULL,'B',7,'BSSE','Passionate about web development',NULL,'2022-10-03',NULL),

('22-ARID-3914','Asim Ali','Muhammad Ashfaq','asim@gmail.com','asim123','37031-1554820-0','3105699405','Male','Student','2001-02-10',NULL,'A',7,'BSCS','Mobile app developer and contributor',NULL,'2022-10-03',NULL);

--2
UPDATE Users SET password = 'new_password_here' WHERE reg_no = 'BSCS-23-045'

--3
CREATE TABLE Event (
    E_id INT PRIMARY KEY IDENTITY(1,1), event_name VARCHAR(100),description VARCHAR(200),
    image VARCHAR(300),event_date DATE,created_time TIME,
	created_by INT,FOREIGN KEY (created_by) REFERENCES Users(u_id));

select * from Event
DELETE FROM users WHERE u_id=1


---4
CREATE TABLE Announcements(
    A_id INT PRIMARY KEY IDENTITY(1,1), message VARCHAR(500),image VARCHAR(300),
    type varchar(100),created_at datetime,created_by INT,FOREIGN KEY (created_by) REFERENCES Users(u_id));

select * from Announcements


INSERT INTO Announcements (message, image, type, created_at, created_by)
VALUES
-- Admin (u_id = 4)
('Semester fee submission deadline is extended till next Friday.',
 NULL,
 'general',
 GETDATE(),
 4),

('Campus will remain closed on Friday due to scheduled maintenance.',
 NULL,
 'general',
 GETDATE(),
 4),

-- Dr. Saeed Watto (u_id = 7)
('Final year project proposal submissions are due by the end of this month.',
 NULL,
 'faculty',
 GETDATE(),
 7),

('Students are advised to focus on practical implementation for better results.',
 NULL,
 'faculty',
 GETDATE(),
 7),

-- Sir Hassan (u_id = 8)
('Lab assignments must be demonstrated individually during lab hours.',
 NULL,
 'faculty',
 GETDATE(),
 8),

-- Umer Farooq (u_id = 5)
('Quiz 1 will be conducted in the next class. Topics will be shared soon.',
 NULL,
 'faculty',
 GETDATE(),
 5),

-- Zahid Ahmed (u_id = 9)
('Cloud computing seminar will be arranged next week. Details coming soon.',
 NULL,
 'faculty',
 GETDATE(),
 9),

-- Samia Noor (u_id = 20)
('Please revise database normalization before the upcoming quiz.',
 NULL,
 'faculty',
 GETDATE(),
 20);


---5
select * from users where user_type='teacher'

---6
select a.A_id,u.image,u.name, a.created_at, a.message from Announcements a join 
users u on u.u_id =a.created_by where a.type='faculty'

---emoji Table

CREATE TABLE emojis (E_id INT PRIMARY KEY IDENTITY(1,1),emoji VARCHAR(100) unique,
isEnable BIT DEFAULT 0);
INSERT INTO emojis (emoji, isEnable) VALUES
(':heart:', 1),
(':thumbsup:', 1),
(':fire:', 1),
(':joy:', 1),
(':clap:', 1),
(':smile:', 1),
(':cry:', 1),
(':angry:', 0),
(':sunglasses:', 1),
(':thinking:', 1),
(':rocket:', 1),
(':star:', 1),
(':check_mark:', 1),
(':x:', 0);

select * from emojis

---announcement_reaction
CREATE TABLE Announcement_Reaction (AR_id INT IDENTITY(1,1) PRIMARY KEY,
user_id INT,announcement_id INT,emoji_id INT,
reacted_at DATETIME DEFAULT GETDATE(),CONSTRAINT FK_Reaction_User FOREIGN KEY (user_id) REFERENCES Users(u_id), 
CONSTRAINT FK_Reaction_Announcement FOREIGN KEY (announcement_id) REFERENCES Announcements(A_id),
CONSTRAINT FK_Reaction_Emoji FOREIGN KEY (emoji_id) REFERENCES Emojis(E_id),
CONSTRAINT UQ_User_Announcement UNIQUE (user_id, announcement_id));

select * from Announcement_Reaction

insert into Announcement_Reaction(user_id,announcement_id,emoji_id) values()

EXEC sp_rename 'Annoucements', 'Announcements';

--reactions 
SELECT u.name,u.image,e.emoji FROM Users u JOIN Announcement_Reaction ar 
ON u.u_id = ar.user_id JOIN emojis e ON e.E_id = ar.emoji_id where ar.announcement_id=2


select * from users 
select * from Announcement_Reaction
select * from emojis 
select * from Announcements
drop table Announcement_Reaction

delete from Announcement_Reaction

--most reactions



SELECT 
    u.u_id,
    u.name,
    u.image,
    COUNT(ar.AR_id) AS total_reactions
FROM Users u
JOIN Announcements a 
    ON a.created_by = u.u_id
LEFT JOIN Announcement_Reaction ar 
    ON ar.announcement_id = a.A_id
GROUP BY u.u_id, u.name, u.image
ORDER BY total_reactions DESC;

--FAVURITET
CREATE TABLE hasfav (
    F_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT ,       
    fav_user_id INT ,   
    CONSTRAINT FK_hasfav_user FOREIGN KEY (user_id) REFERENCES users(u_id),
    CONSTRAINT FK_hasfav_fav_user FOREIGN KEY (fav_user_id) REFERENCES users(u_id),
    CONSTRAINT UQ_hasfav UNIQUE (user_id, fav_user_id)  
);

select * from messages


delete from hasfav
drop table hasfav

insert into hasfav(user_id,fav_user_id)values(6,10)

--- GET
select * from users u join hasfav hf on u.u_id=hf.fav_user_id where hf.user_id=6


CREATE TABLE Messages (
    M_id INT IDENTITY(1,1) PRIMARY KEY,
    sender_id INT ,

    receiver_id INT ,
    message VARCHAR(500),
    emoji NVARCHAR(100),
    sent_at DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Messages_Sender
        FOREIGN KEY (sender_id) REFERENCES Users(u_id),

    CONSTRAINT FK_Messages_Receiver
        FOREIGN KEY (receiver_id) REFERENCES Users(u_id),

    CONSTRAINT CHK_Sender_Receiver
        CHECK (sender_id <> receiver_id)
);

select * from users
select * from event
select * from emojis
select * from Announcements
select * from Announcement_reaction
select * from hasfav
select * from Messages


delete from Event where E_id=5


--working in office
CREATE TABLE StudentSemester (
    SS_id INT PRIMARY KEY IDENTITY(1,1),
    student_id INT NOT NULL,
    semester INT NOT NULL,
    section VARCHAR(10),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (student_id) REFERENCES Users(u_id)
);



CREATE TABLE Enrollments (
    E_id INT PRIMARY KEY IDENTITY(1,1),
    student_semester_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date DATE DEFAULT GETDATE(),
    FOREIGN KEY (student_semester_id) REFERENCES StudentSemester(SS_id),
    FOREIGN KEY (course_id) REFERENCES Course(C_id)
);

CREATE TABLE Course (
    C_id INT PRIMARY KEY IDENTITY(1,1),
    course_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    credit_hr INT NOT NULL
);









-----USER DATA START FROM HERE 
--1

INSERT INTO Users 
(reg_no, name, father_name, email, password, cnic, phoneNo, gender, user_type, dob, image, department, description, qualification, joining_date, position)
VALUES
('REG001', 'Ali Raza', 'Khalid Raza', 'ali.raza1@example.com', 'pass123', '35201-1234567-1', '03001234567', 'Male', 'Student', '2002-05-12', 'ali.jpg', 'Computer Science', 'Hardworking student', 'Intermediate', '2023-09-01', 'Student'),

('REG002', 'Sara Khan', 'Imran Khan', 'sara.khan2@example.com', 'pass123', '35201-2345678-2', '03011234567', 'Female', 'Student', '2001-11-03', 'sara.jpg', 'Software Engineering', 'Creative thinker', 'Intermediate', '2023-09-01', 'Student'),

('REG003', 'Usman Tariq', 'Tariq Mehmood', 'usman.tariq3@example.com', 'pass123', '35201-3456789-3', '03021234567', 'Male', 'Teacher', '1990-02-18', 'usman.jpg', 'Mathematics', 'Loves teaching', 'MS Mathematics', '2020-08-15', 'Lecturer'),

('REG004', 'Ayesha Noor', 'Rashid Noor', 'ayesha.noor4@example.com', 'pass123', '35201-4567890-4', '03031234567', 'Female', 'Admin', '1988-07-22', 'ayesha.jpg', 'Administration', 'Office manager', 'MBA', '2018-03-10', 'Manager'),

('REG005', 'Bilal Ahmed', 'Ahmed Raza', 'bilal.ahmed5@example.com', 'pass123', '35201-5678901-5', '03041234567', 'Male', 'Student', '2003-01-09', 'bilal.jpg', 'Information Technology', 'Tech enthusiast', 'Intermediate', '2023-09-01', 'Student'),

('REG006', 'Hina Malik', 'Javed Malik', 'hina.malik6@example.com', 'pass123', '35201-6789012-6', '03051234567', 'Female', 'Teacher', '1992-09-14', 'hina.jpg', 'English', 'Book lover', 'MA English', '2021-01-05', 'Lecturer'),

('REG007', 'Zain Ali', 'Shahid Ali', 'zain.ali7@example.com', 'pass123', '35201-7890123-7', '03061234567', 'Male', 'Student', '2002-03-27', 'zain.jpg', 'Computer Science', 'Programmer', 'Intermediate', '2023-09-01', 'Student'),

('REG008', 'Fatima Zahra', 'Nadeem Zahra', 'fatima.zahra8@example.com', 'pass123', '35201-8901234-8', '03071234567', 'Female', 'Student', '2001-06-30', 'fatima.jpg', 'Artificial Intelligence', 'AI lover', 'Intermediate', '2023-09-01', 'Student'),

('REG009', 'Hamza Saeed', 'Saeed Akhtar', 'hamza.saeed9@example.com', 'pass123', '35201-9012345-9', '03081234567', 'Male', 'Teacher', '1985-12-11', 'hamza.jpg', 'Physics', 'Research oriented', 'MPhil Physics', '2017-05-20', 'Assistant Professor'),

('REG010', 'Iqra Javed', 'Javed Iqbal', 'iqra.javed10@example.com', 'pass123', '35201-1122334-0', '03091234567', 'Female', 'Student', '2002-10-05', 'iqra.jpg', 'Data Science', 'Data analyst in making', 'Intermediate', '2023-09-01', 'Student'),

('REG011', 'Omar Farooq', 'Farooq Ahmed', 'omar.farooq11@example.com', 'pass123', '35201-2233445-1', '03101234567', 'Male', 'Admin', '1987-04-19', 'omar.jpg', 'IT Support', 'System admin', 'BS IT', '2019-06-12', 'IT Officer'),

('REG012', 'Mariam Asif', 'Asif Mehmood', 'mariam.asif12@example.com', 'pass123', '35201-3344556-2', '03111234567', 'Female', 'Teacher', '1991-08-25', 'mariam.jpg', 'Chemistry', 'Lab specialist', 'MS Chemistry', '2020-02-18', 'Lecturer'),

('REG013', 'Danish Qureshi', 'Arif Qureshi', 'danish.qureshi13@example.com', 'pass123', '35201-4455667-3', '03121234567', 'Male', 'Student', '2003-07-17', 'danish.jpg', 'Cyber Security', 'Security enthusiast', 'Intermediate', '2023-09-01', 'Student'),

('REG014', 'Kiran Shah', 'Shahzad Shah', 'kiran.shah14@example.com', 'pass123', '35201-5566778-4', '03131234567', 'Female', 'Student', '2002-02-08', 'kiran.jpg', 'Software Engineering', 'UI/UX designer', 'Intermediate', '2023-09-01', 'Student'),

('REG015', 'Taha Siddiqui', 'Siddiqui Ahmed', 'taha.siddiqui15@example.com', 'pass123', '35201-6677889-5', '03141234567', 'Male', 'Teacher', '1989-11-29', 'taha.jpg', 'Computer Science', 'Full stack dev', 'MS CS', '2016-09-14', 'Associate Professor'),

('REG016', 'Laiba Noor', 'Noor ul Hasan', 'laiba.noor16@example.com', 'pass123', '35201-7788990-6', '03151234567', 'Female', 'Student', '2001-12-21', 'laiba.jpg', 'Information Technology', 'Networking lover', 'Intermediate', '2023-09-01', 'Student'),

('REG017', 'Saad Malik', 'Malik Rafiq', 'saad.malik17@example.com', 'pass123', '35201-8899001-7', '03161234567', 'Male', 'Admin', '1986-03-03', 'saad.jpg', 'HR Department', 'HR manager', 'MBA HR', '2015-07-01', 'HR Manager'),

('REG018', 'Anaya Iqbal', 'Iqbal Hussain', 'anaya.iqbal18@example.com', 'pass123', '35201-9900112-8', '03171234567', 'Female', 'Student', '2003-09-09', 'anaya.jpg', 'Data Science', 'ML beginner', 'Intermediate', '2023-09-01', 'Student'),

('REG019', 'Farhan Ali', 'Ali Nawaz', 'farhan.ali19@example.com', 'pass123', '35201-1011121-9', '03181234567', 'Male', 'Teacher', '1993-05-16', 'farhan.jpg', 'Statistics', 'Data researcher', 'MS Statistics', '2022-01-10', 'Lecturer'),

('REG020', 'Noor Fatima', 'Ghulam Mustafa', 'noor.fatima20@example.com', 'pass123', '35201-2122232-0', '03191234567', 'Female', 'Student', '2002-04-01', 'noor.jpg', 'Artificial Intelligence', 'Deep learning fan', 'Intermediate', '2023-09-01', 'Student');

--2

INSERT INTO StudentSemester (student_id, semester, section, start_date, end_date) VALUES
(1, 1, 'A', '2023-09-01', '2024-01-15'),
(2, 1, 'B', '2023-09-01', '2024-01-15'),
(3, 3, 'A', '2023-09-01', '2024-01-15'),
(4, 5, 'C', '2023-09-01', '2024-01-15'),
(5, 1, 'A', '2023-09-01', '2024-01-15'),

(6, 2, 'B', '2024-02-01', '2024-06-15'),
(7, 1, 'C', '2023-09-01', '2024-01-15'),
(8, 2, 'A', '2024-02-01', '2024-06-15'),
(9, 4, 'B', '2024-02-01', '2024-06-15'),
(10, 1, 'A', '2023-09-01', '2024-01-15'),

(11, 6, 'C', '2024-02-01', '2024-06-15'),
(12, 3, 'A', '2023-09-01', '2024-01-15'),
(13, 1, 'B', '2023-09-01', '2024-01-15'),
(14, 2, 'C', '2024-02-01', '2024-06-15'),
(15, 7, 'A', '2024-02-01', '2024-06-15'),

(16, 1, 'B', '2023-09-01', '2024-01-15'),
(17, 8, 'C', '2024-02-01', '2024-06-15'),
(18, 2, 'A', '2024-02-01', '2024-06-15'),
(19, 3, 'B', '2023-09-01', '2024-01-15'),
(20, 1, 'A', '2023-09-01', '2024-01-15');
--3
INSERT INTO TeacherCourse (teacher_id, course_id) VALUES
(3, 1),
(3, 2),

(6, 5),
(6, 15),

(9, 14),
(9, 13),

(12, 11),
(12, 12),

(15, 3),
(15, 4),
(15, 8),

(19, 16),
(19, 17),

(3, 6),
(6, 7),

(9, 18),
(12, 9),

(15, 10),
(19, 20),
(3, 11);

--4
INSERT INTO Enrollments (student_semester_id, course_id, enrollment_date) VALUES
(1, 1, '2023-09-02'),
(1, 2, '2023-09-02'),
(1, 3, '2023-09-02'),

(2, 1, '2023-09-02'),
(2, 4, '2023-09-02'),

(3, 2, '2023-09-02'),
(3, 5, '2023-09-02'),

(4, 6, '2023-09-02'),
(4, 7, '2023-09-02'),

(5, 1, '2023-09-02'),
(5, 3, '2023-09-02'),

(6, 8, '2024-02-03'),
(6, 9, '2024-02-03'),

(7, 2, '2023-09-02'),
(7, 10, '2023-09-02'),

(8, 11, '2024-02-03'),
(8, 12, '2024-02-03'),

(9, 13, '2024-02-03'),
(10, 14, '2023-09-02'),
(10, 15, '2023-09-02');
--5
INSERT INTO Course (course_code, name, credit_hr) VALUES
('CS101', 'Introduction to Computing', 3),
('CS102', 'Programming Fundamentals', 4),
('CS201', 'Object Oriented Programming', 4),
('CS202', 'Data Structures', 4),
('CS301', 'Database Systems', 3),
('CS302', 'Operating Systems', 4),
('CS303', 'Computer Networks', 3),
('CS304', 'Software Engineering', 3),
('CS305', 'Artificial Intelligence', 3),
('CS306', 'Web Development', 3),

('MTH101', 'Calculus I', 3),
('MTH102', 'Linear Algebra', 3),
('MTH201', 'Discrete Mathematics', 3),
('PHY101', 'Applied Physics', 3),
('ENG101', 'English Composition', 2),

('STAT201', 'Probability and Statistics', 3),
('IT201', 'Human Computer Interaction', 3),
('SE301', 'Software Project Management', 3),
('AI401', 'Machine Learning', 3),
('CS401', 'Final Year Project', 6);


--6
INSERT INTO Event (event_name, description, image, event_date, created_time, created_by) VALUES
('Orientation Day', 'Welcome session for new students', 'orientation.jpg', '2024-09-01', '10:00:00', 4),
('Tech Seminar', 'Latest trends in AI and ML', 'tech_seminar.jpg', '2024-10-12', '11:30:00', 3),
('Sports Gala', 'Annual university sports event', 'sports_gala.jpg', '2024-11-05', '09:00:00', 17),
('Career Fair', 'Meet recruiters from top companies', 'career_fair.jpg', '2024-12-02', '10:30:00', 11),
('Workshop on Cyber Security', 'Hands-on security training', 'cyber_workshop.jpg', '2024-10-25', '01:00:00', 15),

('Science Exhibition', 'Student science projects display', 'science_expo.jpg', '2024-11-20', '10:00:00', 12),
('Alumni Meetup', 'Reconnect with alumni network', 'alumni.jpg', '2024-12-15', '05:00:00', 4),
('Coding Competition', 'Inter-department coding contest', 'coding_comp.jpg', '2024-10-18', '09:30:00', 3),
('Debate Competition', 'Inter-university debate event', 'debate.jpg', '2024-11-08', '11:00:00', 6),
('Art & Culture Day', 'Cultural performances and art', 'culture_day.jpg', '2024-12-10', '02:00:00', 17),

('Research Conference', 'Faculty research presentations', 'research_conf.jpg', '2024-10-30', '10:00:00', 9),
('Guest Lecture', 'Industry expert guest session', 'guest_lecture.jpg', '2024-09-20', '12:00:00', 15),
('Blood Donation Camp', 'Community service event', 'blood_donation.jpg', '2024-11-25', '09:00:00', 11),
('Entrepreneurship Seminar', 'Startup guidance session', 'entrepreneur.jpg', '2024-12-05', '11:00:00', 3),
('Annual Dinner', 'University annual dinner night', 'annual_dinner.jpg', '2024-12-28', '07:00:00', 4),

('Photography Contest', 'Campus photography competition', 'photo_contest.jpg', '2024-10-22', '01:00:00', 6),
('Robotics Workshop', 'Build your first robot', 'robotics.jpg', '2024-11-18', '10:30:00', 15),
('Environmental Awareness Day', 'Tree plantation drive', 'environment.jpg', '2024-09-28', '09:00:00', 17),
('Math Olympiad', 'Mathematics competition', 'math_olympiad.jpg', '2024-10-14', '10:00:00', 12),
('Farewell Party', 'Goodbye event for graduates', 'farewell.jpg', '2024-12-22', '06:00:00', 4);
--7
INSERT INTO Announcements (message, image, type, created_at, created_by) VALUES
('Midterm exams will start from 15th March.', 'exam.jpg', 'Exams', '2024-03-01 10:00:00', 4),
('New library books have arrived for all departments.', 'library.jpg', 'Library', '2024-02-20 09:30:00', 3),
('Guest lecture on AI scheduled on 10th April.', 'guest_lecture.jpg', 'Seminar', '2024-04-01 11:00:00', 6),
('University sports week starts from 5th May.', 'sports_week.jpg', 'Sports', '2024-05-01 08:00:00', 17),
('Annual cultural fest registration is open.', 'culture_fest.jpg', 'Event', '2024-06-10 12:00:00', 4),

('Lab sessions will be conducted online this week.', 'lab_online.jpg', 'Lab', '2024-03-15 09:00:00', 12),
('Scholarship applications due by 20th March.', 'scholarship.jpg', 'Scholarship', '2024-03-05 10:30:00', 15),
('Hackathon registration starts from 1st April.', 'hackathon.jpg', 'Competition', '2024-04-01 10:00:00', 3),
('University will remain closed on 23rd March.', 'holiday.jpg', 'Holiday', '2024-03-20 08:00:00', 4),
('Final project submission deadline extended to 30th May.', 'project.jpg', 'Deadline', '2024-05-15 09:00:00', 6),

('Internship applications open for summer 2024.', 'internship.jpg', 'Internship', '2024-03-25 10:00:00', 9),
('Campus Wi-Fi maintenance scheduled on 18th March.', 'wifi.jpg', 'Maintenance', '2024-03-15 08:30:00', 12),
('Blood donation camp organized on 12th April.', 'blood_donation.jpg', 'Event', '2024-04-01 09:00:00', 15),
('Math Olympiad registration open till 5th May.', 'math_olympiad.jpg', 'Competition', '2024-04-20 10:00:00', 17),
('Workshop on Cybersecurity on 28th March.', 'cyber_workshop.jpg', 'Workshop', '2024-03-15 11:00:00', 3),

('Library timings extended during exams.', 'library_exam.jpg', 'Library', '2024-03-10 09:00:00', 4),
('Faculty meeting scheduled on 18th March.', 'faculty_meeting.jpg', 'Meeting', '2024-03-12 08:30:00', 6),
('Photography contest submissions open till 20th April.', 'photography.jpg', 'Competition', '2024-03-25 10:00:00', 12),
('New parking rules effective from 1st April.', 'parking.jpg', 'Notice', '2024-03-28 09:30:00', 15),
('Farewell party for graduates on 30th May.', 'farewell.jpg', 'Event', '2024-05-01 11:00:00', 4);

--8


-- Allow explicit ID insertion
SET IDENTITY_INSERT Emojis ON;

INSERT INTO Emojis (E_id, emoji, isEnable) VALUES
(1, ':heart:', 1),
(2, ':thumbsup:', 1),
(3, ':fire:', 1),
(4, ':joy:', 1),
(5, ':clap:', 1),
(6, ':smile:', 1),
(7, ':cry:', 0),
(8, ':angry:', 0),
(9, ':sunglasses:', 1),
(10, ':thinking:', 1),
(11, ':rocket:', 1),
(12, ':star:', 1),
(13, ':party:', 1),
(14, ':wave:', 1),
(15, ':ok_hand:', 1),
(16, ':pray:', 1),
(17, ':muscle:', 1),
(18, ':confetti_ball:', 1),
(19, ':sparkles:', 1),
(20, ':sleeping:', 0);


 select * from Emojis

 --9
INSERT INTO Announcement_Reaction (user_id, announcement_id, emoji_id) VALUES
(1, 1, 3),
(1, 2, 4),
(2, 1, 5),
(2, 3, 6),
(3, 2, 7),
(3, 3, 8),
(4, 1, 9),
(4, 4, 10),
(5, 2, 11),
(5, 5, 12),
(6, 1, 13),
(6, 3, 14),
(7, 2, 15),
(7, 4, 16),
(8, 3, 17),
(8, 5, 18),
(9, 1, 19),
(9, 2, 20)

--10
INSERT INTO Messages (sender_id, receiver_id, message, emoji) VALUES
(1, 2, 'Hey! How are you?', ':smile:'),
(2, 1, 'I am good, thanks!', ':thumbsup:'),
(3, 4, 'Did you check the new update?', ':rocket:'),
(4, 3, 'Yes, it works perfectly!', ':clap:'),
(5, 6, 'Are you coming to the meetup?', ':party:'),
(6, 5, 'Sure, see you there!', ':wave:'),
(7, 8, 'Happy Birthday!', ':sparkles:'),
(8, 7, 'Thank you so much!', ':heart:'),
(9, 10, 'Can you help me with the project?', ':thinking:'),
(10, 9, 'Absolutely, send me the details.', ':ok_hand:'),
(1, 3, 'Check this out!', ':fire:'),
(3, 1, 'Wow, that’s awesome!', ':star:'),
(2, 4, 'Let’s meet tomorrow.', ':pray:'),
(4, 2, 'Sure thing.', ':muscle:'),
(5, 7, 'Good luck for your exam!', ':confetti_ball:'),
(7, 5, 'Thanks a lot!', ':joy:'),
(6, 8, 'Did you watch the game?', ':sunglasses:'),
(8, 6, 'Yes, it was amazing!', ':clap:'),
(9, 1, 'Reminder: submit your report.', ':thinking:'),
(1, 9, 'Done, thanks for reminding!', ':smile:');

--11

INSERT INTO hasfav (user_id, fav_user_id) VALUES
(1, 2),
(1, 3),
(2, 1),
(2, 4),
(3, 1),
(3, 5),
(4, 2),
(4, 6),
(5, 3),
(5, 7),
(6, 4),
(6, 8),
(7, 5),
(7, 9),
(8, 6),
(8, 10),
(9, 7),
(9, 1),
(10, 8),
(10, 2);
--12
INSERT INTO Message_Reaction (user_id, message_id, emoji_id) VALUES
(1, 1, 3),
(2, 1, 4),
(3, 2, 5),
(4, 2, 6),
(5, 3, 7),
(6, 3, 8),
(7, 4, 9),
(8, 4, 10),
(9, 5, 11),
(10, 5, 12),
(1, 6, 13),
(2, 6, 14),
(3, 7, 15),
(4, 7, 16),
(5, 8, 17),
(6, 8, 18),
(7, 9, 19)
--13
INSERT INTO Preferences (user_id, start_time, end_time, private_status, includes) VALUES
(1, '08:00:00', '20:00:00', 1, '2,3'),
(2, '09:00:00', '18:00:00', 0, NULL),
(3, '07:30:00', '22:00:00', 1, '1,4'),
(4, '10:00:00', '19:00:00', 0, NULL),
(5, '06:00:00', '23:00:00', 1, '2,3,6'),
(6, '08:30:00', '17:30:00', 1, '1'),
(7, '09:00:00', '21:00:00', 0, NULL),
(8, '07:00:00', '20:00:00', 1, '5,6,7'),
(9, '08:00:00', '18:00:00', 0, NULL),
(10, '06:30:00', '22:30:00', 1, '1,2,3'),
(1, '07:00:00', '19:00:00', 0, NULL),
(2, '08:00:00', '20:00:00', 1, '3,4,5'),
(3, '06:30:00', '21:00:00', 1, '2,6'),
(4, '09:00:00', '18:30:00', 0, NULL),
(5, '07:30:00', '22:30:00', 1, '1,4,7'),
(6, '08:15:00', '19:15:00', 1, '5'),
(7, '06:45:00', '20:45:00', 0, NULL),
(8, '09:30:00', '18:00:00', 1, '2,3,10'),
(9, '07:00:00', '21:00:00', 0, NULL),
(10, '08:00:00', '19:30:00', 1, '1,6,8');
select * from Preferences
--14

INSERT INTO UserBlocked (user_id, blocked_user_id) VALUES
(1, 2),
(1, 3),
(2, 1),
(2, 4),
(3, 5),
(3, 6),
(4, 2),
(4, 7),
(5, 3),
(5, 8),
(6, 4),
(6, 9),
(7, 5),
(7, 10),
(8, 6),
(8, 1),
(9, 7),
(9, 2),
(10, 8),
(10, 3);
--15
INSERT INTO Notifications (user_id, type, reference_id, content) VALUES
(1, 'message', 1, 'New message from user 2'),
(2, 'message', 2, 'New message from user 1'),
(3, 'announcement', 1, 'New feature released!'),
(4, 'announcement', 2, 'Scheduled maintenance this Sunday'),
(5, 'event', NULL, 'Join our annual meetup next month'),
(6, 'message', 6, 'Reminder: project update needed'),
(7, 'message', 7, 'New message from user 5'),
(8, 'announcement', 3, 'Holiday notice for 25th December'),
(9, 'message', 9, 'Can you help with the task?'),
(10, 'message', 10, 'Thanks for your support!'),
(1, 'announcement', 4, 'Security update: change your password'),
(2, 'announcement', 5, 'Bug fix deployed'),
(3, 'event', NULL, 'Survey invitation: give feedback'),
(4, 'announcement', 6, 'New contest available!'),
(5, 'message', 15, 'Happy Birthday!'),
(6, 'message', 16, 'Did you watch the game?'),
(7, 'announcement', 7, 'Policy update now live'),
(8, 'message', 18, 'Check out the new feature'),
(9, 'event', NULL, 'Newsletter: weekly highlights'),
(10, 'announcement', 10, 'App update available');






select * from Announcements

UPDATE Announcements
SET type = 'public'
WHERE type = 'general';

UPDATE Announcements
SET type = CASE
    -- Faculty-only related types
    WHEN type IN ('Lab', 'Internship', 'Workshop') THEN 'faculty'
    
    -- Public/general types
    WHEN type IN ('Seminar', 'Sports', 'Event', 'Scholarship', 'Competition', 
                  'Holiday', 'Deadline', 'Maintenance', 'Library', 'Meeting', 'Notice') 
        THEN 'public'
    
    -- Default fallback
    ELSE 'public'
END;

select * from Announcements
select * from Event