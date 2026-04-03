import { sql, poolPromise } from "../Config/DB.js";
export const getCourses = async (req, res) => {
    const { teacherId } = req.params;
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("teacherId", teacherId)  
        .query(`
          SELECT * FROM Course c
          JOIN TeacherCourse t ON c.C_id = t.course_id
          WHERE t.teacher_id = @teacherId
        `);
      res.status(200).send(result.recordset);
    } catch (err) {
      res.status(500).send(err.message);
    }
  };