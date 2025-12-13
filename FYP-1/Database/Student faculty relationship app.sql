create database relationApp
use relationApp
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
VALUES ('TEH-006','Moiz Hassan','Qaiser Shah','syedmoizshah227@gmail.com','12345',
'37405-7472058-9','03149510319','male','Teacher','2001-09-06',
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
CREATE TABLE Annoucements(
    A_id INT PRIMARY KEY IDENTITY(1,1), message VARCHAR(500),image VARCHAR(300),
    type varchar(100),created_at datetime,created_by INT,FOREIGN KEY (created_by) REFERENCES Users(u_id));

select * from Annoucements

---5
select * from users where user_type='teacher'