import { sql, poolPromise } from "../Config/DB.js";

async function hasUsersColumn(pool, column) {
  const r = await pool
    .request()
    .input("col", sql.NVarChar(128), column)
    .query(`
      SELECT 1 AS hit
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Users' AND LOWER(COLUMN_NAME) = LOWER(@col)
    `);
  return (r.recordset || []).length > 0;
}

/** male | female | null */
function normalizeGender(raw) {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!s) return null;
  if (s === "m" || s === "male" || s === "boy" || s === "man") return "male";
  if (s === "f" || s === "female" || s === "girl" || s === "woman") return "female";
  return null;
}

/** SQL IN list for opposite gender values in DB */
function oppositeGenderSqlValues(myGender) {
  if (myGender === "male") return ["female", "f", "girl", "woman"];
  if (myGender === "female") return ["male", "m", "boy", "man"];
  return [];
}

async function resolveUserGender(pool, userId, bodyGender) {
  const hasGenderCol = await hasUsersColumn(pool, "gender");
  if (hasGenderCol) {
    const row = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(`SELECT TOP 1 gender FROM Users WHERE u_id = @userId`);
    const fromDb = normalizeGender(row.recordset?.[0]?.gender);
    if (fromDb) return fromDb;
  }
  return normalizeGender(bodyGender);
}

async function fetchOppositeUserIds(pool, userId, myGender) {
  const values = oppositeGenderSqlValues(myGender);
  if (!values.length) return [];

  const hasGenderCol = await hasUsersColumn(pool, "gender");
  if (!hasGenderCol) return [];

  const inList = values.map((v) => `'${v.replace(/'/g, "''")}'`).join(", ");
  const result = await pool.request().input("userId", sql.Int, userId).query(`
      SELECT u_id
      FROM Users
      WHERE u_id <> @userId
        AND LOWER(LTRIM(RTRIM(ISNULL(gender, '')))) IN (${inList})
    `);

  return (result.recordset || [])
    .map((r) => Number(r.u_id))
    .filter((id) => Number.isFinite(id) && id > 0);
}

/**
 * POST /user/block-opposite-gender
 * Body: { userId, gender? } — gender from localStorage if DB empty
 */
export const blockOppositeGender = async (req, res) => {
  const userId = parseInt(String(req.body?.userId ?? req.body?.userid), 10);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const pool = await poolPromise;
    const myGender = await resolveUserGender(pool, userId, req.body?.gender);
    if (!myGender) {
      return res.status(400).json({
        message: "Could not determine your gender. Set gender on your profile or in localStorage.",
      });
    }

    const oppositeIds = await fetchOppositeUserIds(pool, userId, myGender);
    let inserted = 0;
    let skipped = 0;

    for (const blockId of oppositeIds) {
      const exists = await pool
        .request()
        .input("userid", sql.Int, userId)
        .input("blockId", sql.Int, blockId)
        .query(`
          SELECT 1 AS hit FROM UserBlocked
          WHERE user_id = @userid AND blocked_user_id = @blockId
        `);
      if ((exists.recordset || []).length > 0) {
        skipped += 1;
        continue;
      }

      await pool
        .request()
        .input("userid", sql.Int, userId)
        .input("blockId", sql.Int, blockId)
        .query(
          `INSERT INTO UserBlocked (user_id, blocked_user_id) VALUES (@userid, @blockId)`
        );
      inserted += 1;
    }

    return res.status(200).json({
      message: "Opposite gender users blocked",
      myGender,
      totalOpposite: oppositeIds.length,
      inserted,
      skipped,
    });
  } catch (err) {
    console.error("blockOppositeGender:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * POST /user/unblock-opposite-gender
 * Removes blocks for all opposite-gender users (toggle off).
 */
export const unblockOppositeGender = async (req, res) => {
  const userId = parseInt(String(req.body?.userId ?? req.body?.userid), 10);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const pool = await poolPromise;
    const myGender = await resolveUserGender(pool, userId, req.body?.gender);
    if (!myGender) {
      return res.status(400).json({ message: "Could not determine your gender." });
    }

    const oppositeIds = await fetchOppositeUserIds(pool, userId, myGender);
    if (!oppositeIds.length) {
      return res.status(200).json({ message: "No opposite-gender users to unblock", removed: 0 });
    }

    let removed = 0;
    for (const blockId of oppositeIds) {
      const result = await pool
        .request()
        .input("userid", sql.Int, userId)
        .input("blockId", sql.Int, blockId)
        .query(`
          DELETE FROM UserBlocked
          WHERE user_id = @userid AND blocked_user_id = @blockId
        `);
      removed += result.rowsAffected?.[0] ?? 0;
    }

    return res.status(200).json({
      message: "Opposite gender users unblocked",
      removed,
    });
  } catch (err) {
    console.error("unblockOppositeGender:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};
