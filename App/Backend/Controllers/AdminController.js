import { sql, poolPromise } from "../Config/DB.js";

export const AddEvents = async (req, res) => {
  const { userId, newpassword } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", userId)
      .input("password", newpassword)
      .query(
        "UPDATE Users SET password = @password WHERE u_id = @userId"
      );
      console.log(result)
    res.status(200).json({message: "Password changed",})
  } catch (err) {
    res.status(500).send(err.message);
  }
};

