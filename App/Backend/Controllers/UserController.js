import { sql, poolPromise } from "../Config/DB.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); 

export const login = async (req, res) => {
  const { regno, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("regno",sql.VarChar(200), regno)
      .input("password",sql.VarChar(200), password)
      .query(
        "SELECT * FROM Users WHERE reg_no = @regno AND password = @password"
      );

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.recordset[0];

    const token = jwt.sign(
      {
        id: user.u_id,
        regno: user.reg_no,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...userInfo } = user;

    res.json({
      message: "Login successful",
      token,
      user: userInfo
    });

  } catch (err) {
    res.status(500).send(err.message);
  }
};


export const changePassword = async (req, res) => {
  const { userId, newpassword } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId",sql.VarChar(200), userId)
      .input("password",sql.VarChar(200), newpassword)
      .query(
        "UPDATE Users SET password = @password WHERE u_id = @userId"
      );
      console.log(result)
    res.status(200).json({message: "Password changed",})
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const AddFavourite=async(req,res)=>{
  const{userid,favid}=req.body;
  try{
    const pool = await poolPromise;
    const result = await pool.request()
    .input("userid",sql.Int,userid)
    .input("favid",sql.Int,favid)
    .query("insert into hasfav(user_id,fav_user_id)values(@userid,@favid)")
    res.status(200).send(result)
  }catch(err){
    res.status(500).send(err.meesage)
  }
}


export const GetFavourite=async(req,res)=>{
  const {id}= req.params;
  
  try{
    const pool = await poolPromise;
    const result = await pool.request()
    .input("id",sql.Int,id)  
    .query("select u.name,u.image from users u join hasfav hf on u.u_id=hf.fav_user_id where hf.user_id=@id")
    res.status(200).send(result.recordsets)
  }catch(err){
    res.status(500).send(err.meesage)
  }
}



export const RemoveFavourite = async (req, res) => {
  const { userid, favid } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("userid",sql.Int, userid)
      .input("favid",sql.Int, favid)
      .query("DELETE FROM hasfav WHERE user_id = @userid AND fav_user_id = @favid");
      res.status(200).send(result)
  }catch(err){
    res.status(500).send(err.message);
  }
}