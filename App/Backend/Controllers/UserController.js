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
      .input("regno", regno)
      .input("password", password)
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

