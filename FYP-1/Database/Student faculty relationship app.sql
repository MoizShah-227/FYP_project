create database relationApp
use relationApp
--1
create table Users(u_id int primary key identity(1,1),reg_no varchar(100) unique
,name varchar(100),father_name varchar(100),email varchar(100) unique,
password varchar(500),cnic varchar(200) unique,phoneNo varchar(100),
gender varchar(20),user_type varchar(50),dob DATE ,image VARBINARY(MAX) ,
section varchar(50),semester int,department varchar(100),
description varchar(100),qualification varchar(100),joining_data Date,position varchar(100)
,)

	select * from users

INSERT INTO Users(reg_no,name,father_name,email,password,cnic,phoneNo,gender,user_type,dob,position,joining_data)
VALUES ('ADM-001','Muhammad Nadeem','Ghulam Abbas','nadeem.admin@college.pk','12345',
'35202-4589123-7','0306-5891234','Male','Admin','1985-04-12','Senior Administrator','2019-03-15');

INSERT INTO Users(reg_no,name,father_name,email,password,cnic,phoneNo,gender,user_type,dob,qualification,description,joining_data,department)
VALUES ('TCH-101','Ayesha Khan','Farooq Khan','ayesha.khan@college.pk','12345',
'61101-9874521-5','0312-7458961','Female','Teacher','1990-09-22',
'M.Phil Computer Science','Expert in Software Engineering & Databases','2021-08-10','Computer Science');

INSERT INTO Users(reg_no,name,father_name,email,password,cnic,phoneNo,gender,user_type,dob,section,semester,department)
VALUES ('BSCS-23-045','Ahmed Raza','Riaz Ahmed','ahmed.raza23@students.pk','12345',
'37405-6589321-4','0345-8596321','Male','Student','2004-01-17','A',3,'Computer Science');
