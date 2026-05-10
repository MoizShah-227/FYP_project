import { sql, poolPromise } from "../Config/DB.js";

/** Accepts HH:mm or HH:mm:ss */
function normalizeTime(t) {
  if (t === undefined || t === null) return null;
  const s = String(t).trim();
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(":");
    return `${String(h).padStart(2, "0")}:${m}:00`;
  }
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s;
  return null;
}

/** GET /settings/preferences/:userId */
export const getPreferences = async (req, res) => {
  const userId = parseInt(String(req.params.userId), 10);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT TOP 1
          p_id,
          user_id,
          CONVERT(varchar(8), start_time, 108) AS start_time,
          CONVERT(varchar(8), end_time, 108) AS end_time,
          private_status,
          includes
        FROM Preferences
        WHERE user_id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(200).json({
        p_id: null,
        user_id: userId,
        start_time: "23:00:00",
        end_time: "08:30:00",
        private_status: false,
        includes: null,
      });
    }

    const row = result.recordset[0];
    return res.status(200).json({
      p_id: row.p_id,
      user_id: row.user_id,
      start_time: row.start_time,
      end_time: row.end_time,
      private_status: !!row.private_status,
      includes: row.includes != null ? String(row.includes) : null,
    });
  } catch (err) {
    console.error("getPreferences", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /settings/preferences
 * Partial update: only fields provided are merged with existing row (or defaults).
 * Body: { userId, start_time?, end_time?, private_status?, includes? }
 */
export const upsertPreferences = async (req, res) => {
  const body = req.body || {};
  const userId = parseInt(String(body.userId), 10);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const pool = await poolPromise;
    const sel = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT TOP 1
          p_id,
          CONVERT(varchar(8), start_time, 108) AS start_time,
          CONVERT(varchar(8), end_time, 108) AS end_time,
          private_status,
          includes
        FROM Preferences
        WHERE user_id = @userId
      `);

    const existing = sel.recordset[0];
    const defaults = {
      start_time: "23:00:00",
      end_time: "08:30:00",
      private_status: false,
      includes: null,
    };

    let start_time = existing?.start_time ?? defaults.start_time;
    let end_time = existing?.end_time ?? defaults.end_time;
    let private_status = existing ? !!existing.private_status : defaults.private_status;
    let includes =
      existing?.includes != null && String(existing.includes).trim() !== ""
        ? String(existing.includes).slice(0, 500)
        : null;

    if (body.start_time !== undefined && body.start_time !== null && body.start_time !== "") {
      const n = normalizeTime(body.start_time);
      if (!n) return res.status(400).json({ message: "Invalid start_time" });
      start_time = n;
    }
    if (body.end_time !== undefined && body.end_time !== null && body.end_time !== "") {
      const n = normalizeTime(body.end_time);
      if (!n) return res.status(400).json({ message: "Invalid end_time" });
      end_time = n;
    }
    if (body.private_status !== undefined && body.private_status !== null) {
      private_status = Boolean(body.private_status);
    }
    if (body.includes !== undefined) {
      if (body.includes === null || body.includes === "") {
        includes = null;
      } else {
        includes = String(body.includes).slice(0, 500);
      }
    }

    if (existing) {
      await pool
        .request()
        .input("p_id", sql.Int, existing.p_id)
        .input("start_time", sql.VarChar(8), start_time)
        .input("end_time", sql.VarChar(8), end_time)
        .input("private_status", sql.Bit, private_status ? 1 : 0)
        .input("includes", sql.VarChar(500), includes)
        .query(`
          UPDATE Preferences
          SET
            start_time = CAST(@start_time AS TIME),
            end_time = CAST(@end_time AS TIME),
            private_status = @private_status,
            includes = @includes
          WHERE p_id = @p_id
        `);
    } else {
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("start_time", sql.VarChar(8), start_time)
        .input("end_time", sql.VarChar(8), end_time)
        .input("private_status", sql.Bit, private_status ? 1 : 0)
        .input("includes", sql.VarChar(500), includes)
        .query(`
          INSERT INTO Preferences (user_id, start_time, end_time, private_status, includes)
          VALUES (
            @userId,
            CAST(@start_time AS TIME),
            CAST(@end_time AS TIME),
            @private_status,
            @includes
          )
        `);
    }

    return res.status(200).json({
      user_id: userId,
      start_time,
      end_time,
      private_status,
      includes,
    });
  } catch (err) {
    console.error("upsertPreferences", err);
    return res.status(500).json({ message: err.message });
  }
};
