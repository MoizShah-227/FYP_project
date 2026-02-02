import { poolPromise, sql } from "../Config/DB.js";
import { sendAnnouncementEmail, sendMessageEmail } from "../Lib/Mailer.js";

export const ShowCourses = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result =await pool.request().query("select * from Course");
    res.status(201).send(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendMessageToCourse = async (req, res) => {
  try {
    const { teacherId, courseId, messageText,checkEmail} = req.body;
    const pool = await poolPromise;

    const stdArray =[]
    const emails =[]
    
    for(var id of courseId){
      const studentsResult = await pool.request()
      .input('courseId', id)
      .query(`
        SELECT DISTINCT ss.student_id,u.email
        FROM Enrollments e
        JOIN StudentSemester ss 
          ON e.student_semester_id = ss.SS_id join users u on u.u_id=ss.student_id
        WHERE e.course_id = @courseId
      `);  
      emails.push(...studentsResult.recordset.map(s => s.email));
      stdArray.push(...studentsResult.recordset.map(s => s.student_id));
    }

    const uniqueArray = [...new Set(stdArray)];
    const uniqueEmails = [...new Set(emails)];

    for (const id of uniqueArray) {
     const result = await pool.request()
      .input('senderId', teacherId)
      .input('receiverId', id)
      .input('message', messageText)
      .query(`
        INSERT INTO Messages (sender_id, receiver_id, message)
        OUTPUT INSERTED.M_id
        VALUES (@senderId, @receiverId, @message)
      `);
        
        const messageId=result.recordset[0].M_id
        ///this will save the notification
        await pool.request()
        .input('userId',id)
        .input('type', 'message')
        .input('referenceId', messageId)
        .input('content', messageText)
        .query(`
          INSERT INTO Notifications (user_id, type, reference_id, content)
          VALUES (@userId, @type, @referenceId, @content)
          `);
}

  ///this will work if checkEmail is true
  if(checkEmail){
      for(var email of uniqueEmails){
        await sendMessageEmail(email, messageText);
      }
  }
  res.status(201).json({
      message: "Message sent to all enrolled students",
      totalStudents: uniqueArray
    });

  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
