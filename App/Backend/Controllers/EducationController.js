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
    const teacherIdRaw = req.body?.teacherId ?? req.body?.teacher_id;
    const courseIdRaw = req.body?.courseId ?? req.body?.course_ids;
    const messageText = String(req.body?.messageText ?? req.body?.message ?? "").trim();
    const emojiRaw = req.body?.emoji ?? null;
    const checkEmail = !!(req.body?.checkEmail ?? req.body?.check_email);

    const teacherId = parseInt(String(teacherIdRaw), 10);
    const courseIds = (Array.isArray(courseIdRaw) ? courseIdRaw : [courseIdRaw])
      .map((x) => parseInt(String(x), 10))
      .filter((n) => Number.isFinite(n));

    if (!Number.isFinite(teacherId) || courseIds.length === 0 || !messageText) {
      return res
        .status(400)
        .json({ message: "teacherId, courseId[] and messageText are required" });
    }

    const emoji = typeof emojiRaw === "string" && emojiRaw.trim()
      ? emojiRaw.trim().slice(0, 100)
      : null;

    const pool = await poolPromise;

    const stdArray = [];
    const emails = [];

    for (const id of courseIds) {
      const studentsResult = await pool
        .request()
        .input("courseId", sql.Int, id)
        .query(`
          SELECT DISTINCT ss.student_id, u.email
          FROM Enrollments e
          JOIN StudentSemester ss ON e.student_semester_id = ss.SS_id
          JOIN users u ON u.u_id = ss.student_id
          WHERE e.course_id = @courseId
        `);
      emails.push(...studentsResult.recordset.map((s) => s.email));
      stdArray.push(...studentsResult.recordset.map((s) => s.student_id));
    }

    const uniqueArray = [...new Set(stdArray)];
    const uniqueEmails = [...new Set(emails)];

    for (const id of uniqueArray) {
      const reqMsg = pool
        .request()
        .input("senderId", sql.Int, teacherId)
        .input("receiverId", sql.Int, id)
        .input("message", sql.NVarChar(sql.MAX), messageText);

      let insertSql;
      if (emoji) {
        reqMsg.input("emoji", sql.NVarChar(100), emoji);
        insertSql = `
          INSERT INTO Messages (sender_id, receiver_id, message, emoji)
          OUTPUT INSERTED.M_id
          VALUES (@senderId, @receiverId, @message, @emoji)
        `;
      } else {
        insertSql = `
          INSERT INTO Messages (sender_id, receiver_id, message)
          OUTPUT INSERTED.M_id
          VALUES (@senderId, @receiverId, @message)
        `;
      }

      const result = await reqMsg.query(insertSql);
      const messageId = result.recordset[0].M_id;

      await pool
        .request()
        .input("userId", sql.Int, id)
        .input("type", sql.VarChar(50), "message")
        .input("referenceId", sql.Int, messageId)
        .input("content", sql.NVarChar(sql.MAX), messageText)
        .query(`
          INSERT INTO Notifications (user_id, type, reference_id, content)
          VALUES (@userId, @type, @referenceId, @content)
        `);
    }

    if (checkEmail) {
      for (const email of uniqueEmails) {
        await sendMessageEmail(email, messageText);
      }
    }

    return res.status(201).json({
      message: "Message sent to all enrolled students",
      totalStudents: uniqueArray.length,
      studentIds: uniqueArray,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};
