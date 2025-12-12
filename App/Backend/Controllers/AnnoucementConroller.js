import { sql, poolPromise } from "../Config/DB.js";

export const PublicAnnoucement = async (req, res) => {
  const { message, image, type, created_at, created_by} = req.body;

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
