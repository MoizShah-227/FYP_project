import { poolPromise, sql } from "../Config/DB.js";

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
    const { teacherId, courseId, messageText } = req.body;
    const pool = await poolPromise;

    const stdArray =[]
    
    for(var id of courseId){
      const studentsResult = await pool.request()
      .input('courseId', id)
      .query(`
        SELECT DISTINCT ss.student_id
        FROM Enrollments e
        JOIN StudentSemester ss 
          ON e.student_semester_id = ss.SS_id
        WHERE e.course_id = @courseId
      `);  
         stdArray.push(...studentsResult.recordset.map(s => s.student_id));
    }

    const uniqueArray = [...new Set(stdArray)];

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
        console.log();
        
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

    res.status(201).json({
      message: "Message sent to all enrolled students",
      totalStudents: uniqueArray
    });

  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
