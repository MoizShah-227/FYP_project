import { sql, poolPromise } from "../Config/DB.js";

export const AddEvents = async (req, res) => {
  const { event_name, description, image, event_date, created_time, created_by } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("event_name", event_name)
      .input("description", description)
      .input("image", image)
      .input("event_date", event_date)
      .input("created_time", created_time)
      .input("created_by", created_by)
      .query(`
        INSERT INTO Event (event_name, description, image, event_date, created_time, created_by)
        VALUES (@event_name, @description, @image, @event_date, @created_time, @created_by)
      `);

    res.status(200).json({ message: "Event added successfully", result });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
};

export const DeleteEvent=async(req,res)=>{
  const {id}= req.params; 
  console.log(id)
  try{
    const pool=await poolPromise
    const result=await pool.request().input("E_id",id).query("DELETE FROM Event WHERE E_id=@E_id")
    res.status(200).json({message:"Event deleted successfully",result})
  }catch(err){
    res.status(500).send(err.message)
  }
}

export const TotalStudents=async(req,res)=>{
  try{
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT COUNT(*) FROM Users WHERE user_type = 'student'")
      const total =result.recordset[0][""] 
      res.status(200).send(total)
  }catch(err){
    res.status(500).send(err.message)
  }
}

export const TotalTeachers=async(req,res)=>{
  try{
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT COUNT(*)  FROM Users WHERE user_type = 'teacher';")
      const total =result.recordset[0][""] 
      console.log(total)
      res.status(200).send(total)
  }catch(err){
    res.status(500).send(err.message)
  }
}

export const SetReaction=async(req,res)=>{
    const{id,status} = req.body;
    try{
      const pool = await poolPromise
      const result = await pool.request()
      .input("id",id)
      .input("status",status)
      .query("update emojis set isEnable=@status where e_id=@id");
      res.status(200).send(result);
    }catch(err){
    res.status(500).send(err.message);
    }
}

export const AllEmojis=async(req,res)=>{
  try{
      const pool= await poolPromise;
      const result  = await pool.request().query("select * from emojis");
      res.status(200).send(result.recordsets)
  }catch(err){
    res.status(500).send(err.message);
  }
}