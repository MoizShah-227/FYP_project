import { poolPromise, sql } from "../Config/DB.js";

export const SendMessage = async (req, res) => {
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

