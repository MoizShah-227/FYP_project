import { sql, poolPromise } from "../Config/DB.js";
import {sendAnnouncementEmail} from  '../Lib/Mailer.js'

export const PublicAnnoucement = async (req, res) => {
    const { message, image, type, created_at, created_by } = req.body;
  
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("message", message)
        .input("image", image)
        .input("type", type)
        .input("created_at", created_at)
        .input("created_by", created_by)
        .query(`
          INSERT INTO Annoucements (message, image, type, created_at, created_by)
          VALUES (@message, @image, @type, @created_at, @created_by)
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
    const { message, image, type, created_at, created_by,emailChecked} = req.body;
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
            res.status(500).send(err.message);
        }
    }

    try {
        const pool = await poolPromise;
        const result = await pool
          .request()
          .input("message", message)
          .input("image", image)
          .input("type", type)
          .input("created_at", created_at)
          .input("created_by", created_by)
          .query(`
            INSERT INTO Annoucements (message, image, type, created_at, created_by)
            VALUES (@message, @image, @type, @created_at, @created_by)
          `);
    
        res.status(200).json({
          message: "Announcement added successfully",
          result
        });
      } catch (err) {
        res.status(500).send(err.message);
      }


}