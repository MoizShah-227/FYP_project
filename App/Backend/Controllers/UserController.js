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
      .input("regno", sql.VarChar(200), regno)
      .input("password", sql.VarChar(200), password)
      .query(
        "SELECT * FROM Users WHERE reg_no = @regno AND password = @password"
      );
    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.recordset[0];
    // ✅ CREATE SESSION
    req.session.user = {
      id: user.u_id,
      regno: user.reg_no,
      name: user.name,
      image: user.image,
      type: user.user_type,
      gender: user.gender ?? null,
    };
    res.json({
      message: "Login successful",
      user: req.session.user
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
    .query("select u.name,u.image,u.u_id from users u join hasfav hf on u.u_id=hf.fav_user_id where hf.user_id=@id")
    res.status(200).send(result.recordsets)
  }catch(err){
    res.status(500).send(err.meesage)
  }
}

/** Favourites who are not students (teachers, admin, etc.) — for student → teacher event wishes */
export const GetFavouriteTeachersForEvent = async (req, res) => {
  const viewerId = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(viewerId)) {
    return res.status(200).send([[]]);
  }
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, viewerId)
      .query(`
        SELECT u.name, u.image, u.u_id
        FROM Users u
        INNER JOIN hasfav hf ON u.u_id = hf.fav_user_id
        WHERE hf.user_id = @id
          AND LOWER(LTRIM(RTRIM(ISNULL(u.user_type, '')))) <> 'student'
        ORDER BY u.name
      `);
    res.status(200).send(result.recordsets);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const GetStudents=async(req,res)=>{  
  try{
    const pool = await poolPromise;
    const result = await pool.request()  
    .query("select * from users where user_type='student'")
    res.status(200).send(result.recordsets)
  }catch(err){
    res.status(500).send(err.meesage)
  }
}

/** All users with role admin or teacher (no passwords) */
export const GetAdminsAndTeachers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(
      `SELECT u_id, name, reg_no, email, image, user_type
       FROM Users
       WHERE user_type IN ('admin', 'teacher')
       ORDER BY user_type, name`
    );
    res.status(200).json(result.recordset || []);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

/** Users whose id may be stored as Announcements.created_by when admin posts on their behalf */
export const GetAnnouncementAuthorCandidates = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(
      `SELECT u_id, name, reg_no, email, image, user_type
       FROM Users
       WHERE LOWER(LTRIM(RTRIM(user_type))) IN ('student', 'teacher', 'admin')
       ORDER BY user_type, name`
    );
    return res.status(200).json(result.recordset || []);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

/** Seconds since midnight from "HH:mm:ss" / "HH:mm" (same idea as SettingsController). */
function parseClockToSeconds(t) {
  const parts = String(t ?? "")
    .trim()
    .split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const s = parseInt(parts[2], 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  const ss = Number.isFinite(s) ? s : 0;
  return ((h * 60 + m) * 60 + ss) % 86400;
}

/**
 * True if clock `sec` lies inside the closed daily window [startStr, endStr].
 * Overnight when start > end (e.g. 23:00–08:30 mute block).
 */
function isClockInsideWindow(sec, startStr, endStr) {
  const a = parseClockToSeconds(startStr);
  const b = parseClockToSeconds(endStr);
  if (a <= b) return sec >= a && sec <= b;
  return sec >= a || sec <= b;
}

/**
 * Feed items for Notifications: posts by favourites (react), posts mentioning favourites (react),
 * faculty-wide / Teacher's Day style posts for faculty (`faculty_event`),
 * any other `public` announcement is shown to all users (`public_broadcast`).
 * Rows are skipped for the viewer when their display name appears in the message body (post addressed to them).
 * Query params: days (optional, default 21) — how far back to include announcements.
 *
 * Teachers only: if a `Preferences` row exists, activity is hidden while server time is inside
 * the mute window (start_time–end_time, same as Notification → Mute Time Settings; overnight ranges
 * supported). When not muted, optional `includes` filter applies only if `private_status` is false:
 * comma-separated substrings must appear in the post message, or if every token is numeric,
 * only posts whose author_id is in that list are kept.
 */
export const GetNotificationsFeed = async (req, res) => {
  const { id } = req.params;
  const me = parseInt(String(id), 10);
  const days = Math.min(90, Math.max(1, parseInt(String(req.query.days || "21"), 10) || 21));

  if (!Number.isFinite(me)) {
    return res.status(400).json({ message: "Invalid user id", items: [] });
  }

  try {
    const pool = await poolPromise;

    const userRow = await pool
      .request()
      .input("uid", sql.Int, me)
      .query(`SELECT LOWER(LTRIM(RTRIM(ISNULL(user_type, '')))) AS ut FROM Users WHERE u_id = @uid`);

    if (!userRow.recordset?.length) {
      return res.status(404).json({ message: "User not found", items: [] });
    }

    const ut = userRow.recordset[0].ut || "";
    const isTeacher = ut === "teacher" || ut === "admin";

    const result = await pool
      .request()
      .input("me", sql.Int, me)
      .input("is_teacher", sql.Bit, isTeacher ? 1 : 0)
      .input("days", sql.Int, days)
      .query(`
        WITH fav AS (
          SELECT fav_user_id FROM hasfav WHERE user_id = @me
        ),
        fav_names AS (
          SELECT u.u_id, u.name
          FROM Users u
          INNER JOIN hasfav hf ON hf.fav_user_id = u.u_id
          WHERE hf.user_id = @me AND LEN(LTRIM(RTRIM(u.name))) >= 2
        )
        SELECT TOP 50
          x.A_id AS announcement_id,
          x.message,
          x.type AS post_type,
          x.created_at,
          x.author_id,
          x.author_name,
          x.author_image,
          x.reaction_user_count,
          x.viewer_has_reacted,
          x.viewer_reaction_emoji,
          x.feed_kind
        FROM (
          SELECT
            a.A_id,
            a.message,
            a.type,
            a.created_at,
            u.u_id AS author_id,
            u.name AS author_name,
            u.image AS author_image,
            (SELECT COUNT(DISTINCT ar.user_id) FROM Announcement_Reaction ar
             WHERE ar.announcement_id = a.A_id
               AND NOT EXISTS (
                 SELECT 1 FROM UserBlocked ub
                 WHERE ub.user_id = a.created_by AND ub.blocked_user_id = ar.user_id
               )) AS reaction_user_count,
            CASE WHEN EXISTS (
              SELECT 1 FROM Announcement_Reaction ar_v
              WHERE ar_v.announcement_id = a.A_id AND ar_v.user_id = @me
            ) THEN 1 ELSE 0 END AS viewer_has_reacted,
            (SELECT TOP 1 e.emoji FROM Announcement_Reaction ar_v
             INNER JOIN Emojis e ON e.E_id = ar_v.emoji_id
             WHERE ar_v.announcement_id = a.A_id AND ar_v.user_id = @me) AS viewer_reaction_emoji,
            CASE
              WHEN EXISTS (SELECT 1 FROM fav f WHERE f.fav_user_id = a.created_by) THEN 'favourite_post'
              WHEN EXISTS (
                SELECT 1 FROM fav_names fn
                WHERE CHARINDEX(LTRIM(RTRIM(fn.name)), a.message) > 0
                  AND fn.u_id <> a.created_by
              ) THEN 'about_favourite'
              WHEN @is_teacher = 1
                AND NOT EXISTS (SELECT 1 FROM fav f WHERE f.fav_user_id = a.created_by)
                AND (
                  a.type = 'faculty'
                  OR (
                    a.type = 'public'
                    AND CHARINDEX('teacher', LOWER(a.message)) > 0
                    AND CHARINDEX('day', LOWER(a.message)) > 0
                  )
                )
              THEN 'faculty_event'
              WHEN LOWER(LTRIM(RTRIM(ISNULL(CAST(a.type AS NVARCHAR(200)), '')))) = 'public'
              THEN 'public_broadcast'
              ELSE NULL
            END AS feed_kind
          FROM Announcements a
          INNER JOIN Users u ON u.u_id = a.created_by
          WHERE (a.is_active IS NULL OR a.is_active = 1)
            AND (a.from_date IS NULL OR CAST(GETDATE() AS DATE) >= a.from_date)
            AND (a.to_date IS NULL OR CAST(GETDATE() AS DATE) <= a.to_date)
            AND a.created_by <> @me
            AND NOT EXISTS (
              SELECT 1
              FROM Users viewer_row
              WHERE viewer_row.u_id = @me
                AND LEN(LTRIM(RTRIM(ISNULL(viewer_row.name, '')))) >= 2
                AND CHARINDEX(LTRIM(RTRIM(viewer_row.name)), a.message) > 0
            )
            AND a.created_at >= DATEADD(day, -@days, GETDATE())
            AND (
              a.type = 'public'
              OR (@is_teacher = 1 AND a.type = 'faculty')
            )
        ) x
        WHERE x.feed_kind IS NOT NULL
        ORDER BY x.created_at DESC
      `);

    let items = (result.recordset || []).map((row) => ({
      announcement_id: row.announcement_id,
      feed_kind: row.feed_kind,
      message: row.message,
      post_type: row.post_type,
      created_at: row.created_at,
      author_id: row.author_id,
      author_name: row.author_name,
      author_image: row.author_image,
      reaction_user_count: Number(row.reaction_user_count) || 0,
      viewer_has_reacted: Number(row.viewer_has_reacted) === 1,
      viewer_reaction_emoji: row.viewer_reaction_emoji || null,
    }));

    /** Teachers only: preferences row = mute window + optional reference filter */
    if (ut === "teacher") {
      const prefRes = await pool.request().input("uid", sql.Int, me).query(`
        SELECT TOP 1
          CONVERT(varchar(8), start_time, 108) AS start_time,
          CONVERT(varchar(8), end_time, 108) AS end_time,
          private_status,
          includes
        FROM Preferences
        WHERE user_id = @uid
      `);
      const prow = prefRes.recordset?.[0];
      if (prow) {
        const startT = prow.start_time || "23:00:00";
        const endT = prow.end_time || "08:30:00";
        const nowRes = await pool.request().query(`
          SELECT CONVERT(varchar(8), GETDATE(), 108) AS now_time
        `);
        const nowStr = nowRes.recordset?.[0]?.now_time || "00:00:00";
        const nowSec = parseClockToSeconds(nowStr);

        if (isClockInsideWindow(nowSec, startT, endT)) {
          items = [];
        } else {
          const privateStatus = !!prow.private_status;
          const incRaw =
            prow.includes != null ? String(prow.includes).trim() : "";
          if (!privateStatus && incRaw) {
            const parts = incRaw
              .split(/[,;]/)
              .map((x) => x.trim())
              .filter(Boolean);
            const allNumeric =
              parts.length > 0 &&
              parts.every((p) => /^\d+$/.test(p));
            if (allNumeric) {
              const allowed = new Set(parts.map((p) => parseInt(p, 10)));
              items = items.filter((it) =>
                allowed.has(Number(it.author_id))
              );
            } else {
              items = items.filter((it) => {
                const msg = String(it.message || "").toLowerCase();
                return parts.some((p) =>
                  msg.includes(p.toLowerCase())
                );
              });
            }
          }
        }
      }
    }

    return res.status(200).json({
      viewer_is_faculty: isTeacher,
      items,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server error", items: [] });
  }
};

/** Exclude birthday person u for viewer @id when private + (hidden OR viewer not in includes). */
const birthdayPersonBlocksViewerSql = `
  EXISTS (
    SELECT 1 FROM Preferences p
    WHERE p.user_id = u.u_id
      AND p.private_status = 1
      AND (
        p.includes IS NULL
        OR LTRIM(RTRIM(CAST(p.includes AS NVARCHAR(500)))) = N''
        OR CHARINDEX(
          N',' + LTRIM(RTRIM(CAST(@id AS NVARCHAR(20)))) + N',',
          N',' + REPLACE(REPLACE(LTRIM(RTRIM(CAST(p.includes AS NVARCHAR(500)))), N' ', N''), N',,', N',') + N','
        ) = 0
      )
  )`;

/** Favourites of @id whose birthday is today — only if viewer has not already sent a birthday_wish this year.
 * If birthday person has private account with an includes list, only those user IDs see the reminder. */
export const GetFavouriteBirthdays = async (req, res) => {
  const viewerId = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(viewerId)) {
    return res.status(400).json({ message: "Invalid user id", data: [] });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, viewerId)
      .query(`
        SELECT 
          u.u_id,
          u.name,
          u.image,
          u.dob,
          u.department
        FROM Users u
        JOIN hasfav hf ON u.u_id = hf.fav_user_id
        WHERE hf.user_id = @id
          AND u.dob IS NOT NULL
          AND DAY(u.dob) = DAY(GETDATE())
          AND MONTH(u.dob) = MONTH(GETDATE())
          AND NOT (${birthdayPersonBlocksViewerSql})
          AND NOT EXISTS (
            SELECT 1 FROM Messages m
            WHERE m.sender_id = @id
              AND m.receiver_id = u.u_id
              AND m.birthday_wish = 1
              AND YEAR(m.sent_at) = YEAR(GETDATE())
          )
      `);

    if (result.recordset.length === 0) {
      return res.status(200).json({ message: "No pending birthday wishes", data: [] });
    }

    res.status(200).json({
      message: `${result.recordset.length} pending birthday wish(es)`,
      data: result.recordset,
    });
  } catch (err) {
    console.error(err);
    if (
      String(err.message || "").includes("birthday_wish") ||
      String(err.message || "").includes("Invalid column")
    ) {
      return res.status(503).json({
        message:
          "Add column: ALTER TABLE Messages ADD birthday_wish BIT NOT NULL CONSTRAINT DF_Messages_birthday_wish DEFAULT 0;",
        data: [],
      });
    }
    res.status(500).send(err.message);
  }
};



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


export const checkSession = (req, res) => {
  if (req.session && req.session.user) {
    return res.json({
      loggedIn: true,
      user: req.session.user
    });
  }

  res.json({ loggedIn: false });
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid"); // session cookie
    res.json({ message: "Logged out successfully" });
  });
};


export const blockUser=async(req,res)=>{
  const{userid,blockId}=req.body;
  try{
    const pool = await poolPromise;
    const result = await pool.request()
    .input("userid",sql.Int,userid)
    .input("blockId",sql.Int,blockId)
    .query("insert into UserBlocked(user_id,blocked_user_id)values(@userid,@blockId)")
    res.status(200).send(result)
  }catch(err){
    res.status(500).send(err.meesage)
  }
}

export const UnblockUser = async (req, res) => {
  const { userid, blockId } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("userid",sql.Int, userid)
      .input("blockId",sql.Int, blockId)
      .query("DELETE FROM UserBlocked WHERE user_id = @userid AND blocked_user_id = @blockId");
      res.status(200).send(result)
  }catch(err){
    res.status(500).send(err.message);
  }
}

export const GetBlockedUsers=async(req,res)=>{
  const {id}= req.params;
  try{
    const pool = await poolPromise;
    const result = await pool.request()
    .input("id",sql.Int,id)  
    .query("select u.name,u.image,u.u_id from users u join  UserBlocked hf on u.u_id=hf.blocked_user_id where hf.user_id=@id")
    res.status(200).send(result.recordsets)
  }catch(err){
    res.status(500).send(err.meesage)
  }
}


export const GetTeachCourses=async(req,res)=>{
  const {id}= req.params;
  try{
    const pool = await poolPromise;
    const result = await pool.request()
    .input("id",sql.Int,id)  
    .query("select course_code,name,credit_hr from Course c join TeacherCourse tc on c.C_id=tc.course_id where tc.teacher_id=@id")
    res.status(200).send(result.recordsets)
  }catch(err){
    res.status(500).send(err.meesage)
  }
}

/** All teachers/admins in database (for Current Teachers list) */
export const GetCurrentTeachersForStudent = async (req, res) => {
  const studentId = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(studentId)) {
    return res.status(400).json({ users: [] });
  }
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("sid", sql.Int, studentId)
      .query(`
        SELECT u.u_id, u.name, u.image, u.user_type, u.reg_no, u.email
        FROM Users u
        WHERE LOWER(LTRIM(RTRIM(ISNULL(u.user_type, '')))) IN ('teacher', 'admin')
        ORDER BY u.name
      `);
    return res.status(200).json({ users: result.recordset || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server error", users: [] });
  }
};

/** Students enrolled in any course this teacher teaches */
export const GetCurrentStudentsForTeacher = async (req, res) => {
  const teacherId = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(teacherId)) {
    return res.status(400).json({ users: [] });
  }
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("tid", sql.Int, teacherId)
      .query(`
        SELECT DISTINCT u.u_id, u.name, u.image, u.user_type, u.reg_no, u.email
        FROM TeacherCourse tc
        INNER JOIN Enrollments e ON e.course_id = tc.course_id
        INNER JOIN StudentSemester ss ON ss.SS_id = e.student_semester_id
        INNER JOIN Users u ON u.u_id = ss.student_id
        WHERE tc.teacher_id = @tid
          AND LOWER(LTRIM(RTRIM(ISNULL(u.user_type, '')))) = 'student'
        ORDER BY u.name
      `);
    return res.status(200).json({ users: result.recordset || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server error", users: [] });
  }
};

/** Favourites of @id who are students (for teacher inbox shortcuts) */
export const GetFavouriteStudentsForUser = async (req, res) => {
  const userId = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ users: [] });
  }
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, userId)
      .query(`
        SELECT u.u_id, u.name, u.image, u.user_type, u.reg_no, u.email
        FROM Users u
        INNER JOIN hasfav hf ON u.u_id = hf.fav_user_id
        WHERE hf.user_id = @id
          AND LOWER(LTRIM(RTRIM(ISNULL(u.user_type, '')))) = 'student'
        ORDER BY u.name
      `);
    return res.status(200).json({ users: result.recordset || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server error", users: [] });
  }
};

/** Same rows as GetFavouriteTeachersForEvent, JSON shape for clients */
export const GetFavouriteTeachersList = async (req, res) => {
  const viewerId = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(viewerId)) {
    return res.status(200).json({ users: [] });
  }
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, viewerId)
      .query(`
        SELECT u.u_id, u.name, u.image, u.user_type, u.reg_no, u.email
        FROM Users u
        INNER JOIN hasfav hf ON u.u_id = hf.fav_user_id
        WHERE hf.user_id = @id
          AND LOWER(LTRIM(RTRIM(ISNULL(u.user_type, '')))) <> 'student'
        ORDER BY u.name
      `);
    return res.status(200).json({ users: result.recordset || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server error", users: [] });
  }
};