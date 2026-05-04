import { sql, poolPromise } from "../Config/DB.js";
import {sendAnnouncementEmail} from  '../Lib/Mailer.js'

/** Parse optional body date (YYYY-MM-DD or ISO); null if empty / invalid */
const parseBodyDate = (v) => {
    if (v == null || v === "") return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
};

export const PublicAnnoucement = async (req, res) => {
    const { message, image, type, created_at, created_by, from_date, to_date } = req.body;
    const fromD = parseBodyDate(from_date);
    const toD = parseBodyDate(to_date);
    if (fromD && toD && fromD > toD) {
        return res.status(400).json({ message: "from_date must be on or before to_date" });
    }
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("message",sql.VarChar(500), message)
        .input("image",sql.VarChar(500), image)
        .input("type",sql.VarChar(200), type)
        .input("created_at", sql.VarChar(200),created_at)
        .input("created_by",sql.Int, created_by)
        .input("from_date", sql.Date, fromD)
        .input("to_date", sql.Date, toD)
        .query(`
          INSERT INTO Announcements (message, image, type, created_at, created_by, from_date, to_date)
          VALUES (@message, @image, @type, @created_at, @created_by, @from_date, @to_date)
        `);
  
      res.status(200).json({
        message: "Announcement added successfully",
        result
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
  
export const FacultyAnnoucement=async (req,res)=>{
    const { message, image, type, created_at, created_by, emailChecked, from_date, to_date } = req.body;
    const fromD = parseBodyDate(from_date);
    const toD = parseBodyDate(to_date);
    if (fromD && toD && fromD > toD) {
        return res.status(400).json({ message: "from_date must be on or before to_date" });
    }
    let emails =[];
    if(emailChecked){
        try{
            const pool = await poolPromise;
            const result = await pool.request().query("select email from users where user_type='teacher'")
            emails = result.recordset.map(row=>row.email)
            for await (const email of emails) {
                await sendAnnouncementEmail(email, message, image);
            }
        }catch(err){
          console.log(err.message)
            res.status(500).send(err.message);
        }
    }

    try {
        const pool = await poolPromise;
        const result = await pool
          .request()
          .input("message",sql.VarChar(500), message)
          .input("image",sql.VarChar(500), image)
          .input("type",sql.VarChar(200), type)
          .input("created_at", sql.VarChar(200),created_at)
          .input("created_by",sql.Int, created_by)
          .input("from_date", sql.Date, fromD)
          .input("to_date", sql.Date, toD)
          .query(`
            INSERT INTO Announcements (message, image, type, created_at, created_by, from_date, to_date)
            VALUES (@message, @image, @type, @created_at, @created_by, @from_date, @to_date)
          `);
    
        res.status(200).json({
          message: "Announcement added successfully",
          result
        });
      } catch (err) {
        res.status(500).send(err.message);
      }
  
}


export const reactionOnAnnouncement = async (req, res) => {
  const { sender_id, receiver_id, message, emoji } = req.body;

  try {
    const pool = await poolPromise;

    await pool.request()
      .input("sender_id", sql.Int, sender_id)
      .input("receiver_id", sql.Int, receiver_id)
      .input("message", sql.VarChar(500), message)
      .input("emoji", sql.NVarChar(100), emoji || null)
      .query(`
        INSERT INTO Messages (sender_id, receiver_id, message, emoji)
        VALUES (@sender_id, @receiver_id, @message, @emoji)
      `);

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



export const getPublicAnnouncements = async (req, res) => {
  try {
    const pool = await poolPromise;

    // SQL query to fetch public announcements with user info
    const result = await pool.request().query(`
      SELECT 
        a.A_id,
        a.message,
        a.image AS postImage,
        a.type,
        a.created_at,
        u.name,
        u.image AS avatar
      FROM Announcements a
      JOIN Users u ON a.created_by = u.u_id
      WHERE a.type = 'public'
        AND (a.is_active IS NULL OR a.is_active = 1)
        AND (a.from_date IS NULL OR CAST(GETDATE() AS DATE) >= a.from_date)
        AND (a.to_date IS NULL OR CAST(GETDATE() AS DATE) <= a.to_date)
      ORDER BY a.created_at DESC
    `);

    // Map rows to PostCard-friendly structure
    const posts = result.recordset.map(row => ({
      id: row.A_id,
      name: row.name,
      time: new Date(row.created_at).toLocaleString(),
      avatar: row.avatar || '/assets/admin.png',
      content: row.message
    }));
    res.status(200).json(posts);

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};
