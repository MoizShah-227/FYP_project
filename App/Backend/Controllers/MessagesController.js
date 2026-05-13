import { poolPromise, sql } from "../Config/DB.js";

/**
 * One-time (SQL Server):
 * ALTER TABLE Messages ADD birthday_wish BIT NOT NULL CONSTRAINT DF_Messages_birthday_wish DEFAULT 0;
 */

const COLUMN_CANDIDATES = {
  studentSemesterSemester: ["semester", "sem", "semester_no", "sem_no", "current_semester"],
  studentSemesterSection: ["section", "sec", "class_section", "section_name"],
  usersDepartment: ["department", "dept", "program"],
};

const normalizeColumn = (name) => String(name || "").trim().toLowerCase();
const wrapCol = (col) => `[${String(col).replace(/]/g, "]]")}]`;
const DISCIPLINE_CODES = ["BSCS", "BSSE", "BSAI"];

function disciplineCaseSql(tableAlias, deptCol) {
  const c = `${tableAlias}.${wrapCol(deptCol)}`;
  return `
    CASE
      WHEN LOWER(LTRIM(RTRIM(COALESCE(${c}, '')))) IN ('bscs', 'computer science', 'cs') THEN 'BSCS'
      WHEN LOWER(LTRIM(RTRIM(COALESCE(${c}, '')))) IN ('bsse', 'software engineering', 'se') THEN 'BSSE'
      WHEN LOWER(LTRIM(RTRIM(COALESCE(${c}, '')))) IN ('bsai', 'artificial intelligence', 'ai') THEN 'BSAI'
      ELSE NULL
    END
  `;
}

async function getTableColumns(pool, tableName) {
  const meta = await pool
    .request()
    .input("tableName", sql.NVarChar(128), tableName)
    .query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = @tableName
    `);
  return new Set((meta.recordset || []).map((r) => normalizeColumn(r.COLUMN_NAME)));
}

function pickColumn(availableSet, candidates) {
  for (const c of candidates) {
    if (availableSet.has(normalizeColumn(c))) return c;
  }
  return null;
}

function parseSemesterFilters(rawFilters) {
  if (!rawFilters || typeof rawFilters !== "object") return [];
  const out = [];
  for (const [deptRaw, semList] of Object.entries(rawFilters)) {
    const dept = String(deptRaw || "").trim();
    if (!dept) continue;
    const arr = Array.isArray(semList) ? semList : [];
    for (const s of arr) {
      const sem = parseInt(String(s), 10);
      if (Number.isFinite(sem)) out.push({ dept, sem });
    }
  }
  return out;
}

function makeSemesterFilterSql(filters, deptExpr = "SS.department", semExpr = "SS.sem_raw") {
  if (!filters.length) return { whereSql: "", bind: () => {} };
  const clauses = filters.map(
    (_, i) => `(${deptExpr} = @dept${i} AND TRY_CONVERT(INT, ${semExpr}) = @sem${i})`
  );
  return {
    whereSql: ` AND (${clauses.join(" OR ")})`,
    bind: (req) => {
      filters.forEach((f, i) => {
        req.input(`dept${i}`, sql.NVarChar(100), f.dept);
        req.input(`sem${i}`, sql.Int, f.sem);
      });
    },
  };
}

/**
 * Birthday person (receiver) may receive birthday UI / wishes from sender when:
 * - no Preferences row, or private_status is off → allowed
 * - private on + empty includes ("Hidden") → not allowed
 * - private on + includes list → only if sender_id is in that list
 */
async function receiverAllowsBirthdayWishFromSender(pool, senderId, receiverId) {
  const r = await pool
    .request()
    .input("receiver_id", sql.Int, receiverId)
    .query(`
      SELECT TOP 1 p.private_status, p.includes
      FROM Preferences p
      WHERE p.user_id = @receiver_id
    `);
  const row = r.recordset?.[0];
  if (!row) return { allowed: true };
  const priv = Number(row.private_status) === 1;
  if (!priv) return { allowed: true };
  const inc =
    row.includes != null ? String(row.includes).trim() : "";
  if (!inc) return { allowed: false, reason: "receiver_private_account" };
  const ids = inc
    .split(/[,;]/)
    .map((s) => parseInt(String(s).trim(), 10))
    .filter((n) => Number.isFinite(n));
  if (ids.length === 0) return { allowed: false, reason: "receiver_private_account" };
  const allowed = ids.includes(Number(senderId));
  return {
    allowed,
    reason: allowed ? undefined : "receiver_not_in_birthday_allowlist",
  };
}

/** True if sender may send a tagged birthday wish to receiver this calendar year */
export const BirthdayWishEligibility = async (req, res) => {
  const sender_id = parseInt(String(req.query.sender_id), 10);
  const receiver_id = parseInt(String(req.query.receiver_id), 10);

  if (!Number.isFinite(sender_id) || !Number.isFinite(receiver_id)) {
    return res.status(400).json({ message: "sender_id and receiver_id required", canWish: false });
  }
  if (sender_id === receiver_id) {
    return res.status(200).json({ canWish: false, reason: "self" });
  }

  try {
    const pool = await poolPromise;

    const gate = await receiverAllowsBirthdayWishFromSender(pool, sender_id, receiver_id);
    if (!gate.allowed) {
      return res.status(200).json({
        canWish: false,
        alreadyWishedThisYear: false,
        reason: gate.reason || "receiver_private_account",
      });
    }

    const dup = await pool
      .request()
      .input("sender_id", sql.Int, sender_id)
      .input("receiver_id", sql.Int, receiver_id)
      .query(`
        SELECT COUNT(*) AS c
        FROM Messages
        WHERE sender_id = @sender_id
          AND receiver_id = @receiver_id
          AND birthday_wish = 1
          AND YEAR(sent_at) = YEAR(GETDATE())
      `);

    const c = dup.recordset[0]?.c ?? 0;
    const canWish = Number(c) === 0;
    return res.status(200).json({
      canWish,
      alreadyWishedThisYear: !canWish,
    });
  } catch (error) {
    console.error(error);
    if (String(error.message || "").includes("birthday_wish") || String(error.message || "").includes("Invalid column")) {
      return res.status(503).json({
        message: "Add column: ALTER TABLE Messages ADD birthday_wish BIT NOT NULL CONSTRAINT DF_Messages_birthday_wish DEFAULT 0;",
        canWish: true,
      });
    }
    return res.status(500).json({ message: "Server error", canWish: false });
  }
};

/** People you messaged (you = sender) — latest outgoing preview per contact */
export const GetMessageSentList = async (req, res) => {
  const me = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(me)) {
    return res.status(400).json({ contacts: [] });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request().input("me", sql.Int, me).query(`
      WITH agg AS (
        SELECT m.receiver_id AS u_id, MAX(m.sent_at) AS last_sent_at
        FROM Messages m
        WHERE m.sender_id = @me
        GROUP BY m.receiver_id
      )
      SELECT
        a.u_id,
        u.name,
        u.image,
        u.user_type,
        a.last_sent_at,
        lm.message AS last_message,
        lm.emoji AS last_emoji
      FROM agg a
      INNER JOIN Users u ON u.u_id = a.u_id
      OUTER APPLY (
        SELECT TOP 1 message, emoji
        FROM Messages
        WHERE sender_id = @me AND receiver_id = a.u_id
        ORDER BY sent_at DESC, M_id DESC
      ) lm
      ORDER BY a.last_sent_at DESC
    `);

    const contacts = (result.recordset || []).map((row) => ({
      u_id: row.u_id,
      name: row.name,
      image: row.image,
      user_type: row.user_type,
      last_sent_at: row.last_sent_at,
      last_message: row.last_message,
      last_emoji: row.last_emoji,
    }));

    return res.status(200).json({ contacts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server error", contacts: [] });
  }
};

/** Teachers only: hide senders you blocked from received list. */
const teacherHideBlockedReceivedSql = `
  AND NOT EXISTS (
    SELECT 1
    FROM UserBlocked ub
    WHERE ub.user_id = @me
      AND ub.blocked_user_id = a.u_id
      AND EXISTS (
        SELECT 1 FROM Users um
        WHERE um.u_id = @me
          AND LOWER(LTRIM(RTRIM(ISNULL(um.user_type, '')))) = N'teacher'
      )
  )`;

/** People who messaged you (you = receiver) — latest incoming preview per contact */
export const GetMessageReceivedList = async (req, res) => {
  const me = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(me)) {
    return res.status(400).json({ contacts: [] });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request().input("me", sql.Int, me).query(`
      WITH agg AS (
        SELECT m.sender_id AS u_id, MAX(m.sent_at) AS last_sent_at
        FROM Messages m
        WHERE m.receiver_id = @me
        GROUP BY m.sender_id
      )
      SELECT
        a.u_id,
        u.name,
        u.image,
        u.user_type,
        a.last_sent_at,
        lm.message AS last_message,
        lm.emoji AS last_emoji
      FROM agg a
      INNER JOIN Users u ON u.u_id = a.u_id
      OUTER APPLY (
        SELECT TOP 1 message, emoji
        FROM Messages
        WHERE sender_id = a.u_id AND receiver_id = @me
        ORDER BY sent_at DESC, M_id DESC
      ) lm
      WHERE 1=1
      ${teacherHideBlockedReceivedSql}
      ORDER BY a.last_sent_at DESC
    `);

    const contacts = (result.recordset || []).map((row) => ({
      u_id: row.u_id,
      name: row.name,
      image: row.image,
      user_type: row.user_type,
      last_sent_at: row.last_sent_at,
      last_message: row.last_message,
      last_emoji: row.last_emoji,
    }));

    return res.status(200).json({ contacts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server error", contacts: [] });
  }
};

/** Teachers only: hide inbox rows for people you blocked (UserBlocked.user_id = you). */
const teacherHideBlockedContactsSql = `
  AND NOT EXISTS (
    SELECT 1
    FROM UserBlocked ub
    WHERE ub.user_id = @me
      AND ub.blocked_user_id = c.u_id
      AND EXISTS (
        SELECT 1 FROM Users um
        WHERE um.u_id = @me
          AND LOWER(LTRIM(RTRIM(ISNULL(um.user_type, '')))) = N'teacher'
      )
  )`;

/** Mixed inbox list (sent + received together) — latest message per contact */
export const GetMessageMixedList = async (req, res) => {
  const me = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(me)) {
    return res.status(400).json({ contacts: [] });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request().input("me", sql.Int, me).query(`
      WITH convo AS (
        SELECT
          CASE WHEN m.sender_id = @me THEN m.receiver_id ELSE m.sender_id END AS u_id,
          m.sender_id,
          m.receiver_id,
          m.sent_at,
          m.message,
          m.emoji,
          m.M_id,
          ROW_NUMBER() OVER (
            PARTITION BY CASE WHEN m.sender_id = @me THEN m.receiver_id ELSE m.sender_id END
            ORDER BY m.sent_at DESC, m.M_id DESC
          ) AS rn
        FROM Messages m
        WHERE m.sender_id = @me OR m.receiver_id = @me
      )
      SELECT
        c.u_id,
        u.name,
        u.image,
        u.user_type,
        c.sent_at AS last_sent_at,
        c.message AS last_message,
        c.emoji AS last_emoji,
        CASE WHEN c.sender_id = @me THEN 'sent' ELSE 'received' END AS last_direction
      FROM convo c
      INNER JOIN Users u ON u.u_id = c.u_id
      WHERE c.rn = 1
      ${teacherHideBlockedContactsSql}
      ORDER BY c.sent_at DESC
    `);

    const contacts = (result.recordset || []).map((row) => ({
      u_id: row.u_id,
      name: row.name,
      image: row.image,
      user_type: row.user_type,
      last_sent_at: row.last_sent_at,
      last_message: row.last_message,
      last_emoji: row.last_emoji,
      last_direction: row.last_direction,
    }));

    return res.status(200).json({ contacts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server error", contacts: [] });
  }
};

/** Latest row per other user for inbox list */
export const GetMessageInbox = async (req, res) => {
  const me = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(me)) {
    return res.status(400).json({ threads: [] });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request().input("me", sql.Int, me).query(`
      WITH convo AS (
        SELECT
          CASE WHEN m.sender_id = @me THEN m.receiver_id ELSE m.sender_id END AS other_id,
          m.sent_at,
          m.message,
          m.emoji,
          m.M_id,
          ROW_NUMBER() OVER (
            PARTITION BY CASE WHEN m.sender_id = @me THEN m.receiver_id ELSE m.sender_id END
            ORDER BY m.sent_at DESC, m.M_id DESC
          ) AS rn
        FROM Messages m
        WHERE m.sender_id = @me OR m.receiver_id = @me
      )
      SELECT
        c.other_id AS u_id,
        u.name,
        u.image,
        u.user_type,
        c.sent_at AS last_sent_at,
        c.message AS last_message,
        c.emoji AS last_emoji
      FROM convo c
      INNER JOIN Users u ON u.u_id = c.other_id
      WHERE c.rn = 1
      AND NOT EXISTS (
        SELECT 1
        FROM UserBlocked ub
        WHERE ub.user_id = @me
          AND ub.blocked_user_id = c.other_id
          AND EXISTS (
            SELECT 1 FROM Users um
            WHERE um.u_id = @me
              AND LOWER(LTRIM(RTRIM(ISNULL(um.user_type, '')))) = N'teacher'
          )
      )
      ORDER BY c.sent_at DESC
    `);

    const threads = (result.recordset || []).map((row) => ({
      u_id: row.u_id,
      name: row.name,
      image: row.image,
      user_type: row.user_type,
      last_sent_at: row.last_sent_at,
      last_message: row.last_message,
      last_emoji: row.last_emoji,
    }));

    return res.status(200).json({ threads });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Server error", threads: [] });
  }
};

/** Full thread: query viewer_id = logged-in user, param peer = other user */
export const GetMessageThread = async (req, res) => {
  const peer = parseInt(String(req.params.peer), 10);
  const me = parseInt(String(req.query.viewer_id), 10);
  if (!Number.isFinite(me) || !Number.isFinite(peer) || me === peer) {
    return res.status(400).json({ messages: [], peer: null });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("me", sql.Int, me)
      .input("peer", sql.Int, peer)
      .query(`
        SELECT M_id, sender_id, receiver_id, message, emoji, sent_at, birthday_wish
        FROM Messages
        WHERE (sender_id = @me AND receiver_id = @peer)
           OR (sender_id = @peer AND receiver_id = @me)
        ORDER BY sent_at ASC, M_id ASC
      `);

    const peerRow = await pool
      .request()
      .input("peer", sql.Int, peer)
      .query(`SELECT u_id, name, image FROM Users WHERE u_id = @peer`);

    const peerUser = peerRow.recordset?.[0] || null;

    return res.status(200).json({
      peer: peerUser,
      messages: result.recordset || [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message, messages: [], peer: null });
  }
};

export const SendMessage = async (req, res) => {
  const { sender_id, receiver_id, message, emoji, birthday_wish } = req.body;
  const isBirthdayWish = birthday_wish === true || birthday_wish === 1 || birthday_wish === "true";

  try {
    const pool = await poolPromise;

    if (isBirthdayWish) {
      const sid = parseInt(String(sender_id), 10);
      const rid = parseInt(String(receiver_id), 10);
      if (!Number.isFinite(sid) || !Number.isFinite(rid) || sid === rid) {
        return res.status(400).json({ message: "Invalid sender or receiver" });
      }
      const gate = await receiverAllowsBirthdayWishFromSender(pool, sid, rid);
      if (!gate.allowed) {
        return res.status(403).json({
          message:
            gate.reason === "receiver_not_in_birthday_allowlist"
              ? "This user only accepts birthday wishes from people on their list."
              : "Birthday wishes are not available for this user’s privacy settings.",
        });
      }
      const dup = await pool
        .request()
        .input("sender_id", sql.Int, sid)
        .input("receiver_id", sql.Int, rid)
        .query(`
          SELECT COUNT(*) AS c
          FROM Messages
          WHERE sender_id = @sender_id
            AND receiver_id = @receiver_id
            AND birthday_wish = 1
            AND YEAR(sent_at) = YEAR(GETDATE())
        `);
      if (Number(dup.recordset[0]?.c ?? 0) > 0) {
        return res.status(409).json({
          message: "You already sent a birthday wish to this person this year.",
        });
      }
    }

    await pool
      .request()
      .input("sender_id", sql.Int, sender_id)
      .input("receiver_id", sql.Int, receiver_id)
      .input("message", sql.VarChar(500), message)
      .input("emoji", sql.NVarChar(100), emoji || null)
      .input("birthday_wish", sql.Bit, isBirthdayWish ? 1 : 0)
      .query(`
        INSERT INTO Messages (sender_id, receiver_id, message, emoji, birthday_wish)
        VALUES (@sender_id, @receiver_id, @message, @emoji, @birthday_wish)
      `);

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    if (String(error.message || "").includes("birthday_wish") || String(error.message || "").includes("Invalid column")) {
      return res.status(503).json({
        message:
          "Run: ALTER TABLE Messages ADD birthday_wish BIT NOT NULL CONSTRAINT DF_Messages_birthday_wish DEFAULT 0;",
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/** Teacher's available semester choices from their enrolled students */
export const GetTeacherSemesterFilters = async (req, res) => {
  const teacherId = parseInt(String(req.params.teacherId), 10);
  if (!Number.isFinite(teacherId)) {
    return res.status(400).json({ departments: [] });
  }
  try {
    const pool = await poolPromise;
    const ssCols = await getTableColumns(pool, "StudentSemester");
    const uCols = await getTableColumns(pool, "Users");
    const semCol = pickColumn(ssCols, COLUMN_CANDIDATES.studentSemesterSemester);
    const deptCol = pickColumn(uCols, COLUMN_CANDIDATES.usersDepartment);

    if (!semCol || !deptCol) {
      return res.status(200).json({ departments: [] });
    }

    const result = await pool
      .request()
      .input("tid", sql.Int, teacherId)
      .query(`
        WITH t AS (
          SELECT DISTINCT
            ${disciplineCaseSql("U", deptCol)} AS department,
            TRY_CONVERT(INT, SS.${wrapCol(semCol)}) AS sem_no
          FROM TeacherCourse TC
          INNER JOIN Enrollments E ON E.course_id = TC.course_id
          INNER JOIN StudentSemester SS ON SS.SS_id = E.student_semester_id
          INNER JOIN Users U ON U.u_id = SS.student_id
          WHERE TC.teacher_id = @tid
            AND LOWER(LTRIM(RTRIM(ISNULL(U.user_type, '')))) = 'student'
        )
        SELECT department, sem_no
        FROM t
        WHERE department IS NOT NULL AND sem_no IS NOT NULL
        ORDER BY department, sem_no
      `);

    const grouped = {};
    for (const row of result.recordset || []) {
      if (!grouped[row.department]) grouped[row.department] = [];
      grouped[row.department].push(Number(row.sem_no));
    }

    const departments = DISCIPLINE_CODES.map((department) => ({
      department,
      semesters: [...new Set(grouped[department] || [])].sort((a, b) => a - b),
    }));

    return res.status(200).json({ departments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", departments: [] });
  }
};

/** Sections teacher has in selected semester filters */
export const GetTeacherSectionsForSemesters = async (req, res) => {
  const teacherId = parseInt(String(req.body.teacher_id), 10);
  const filters = parseSemesterFilters(req.body.semester_filters);
  if (!Number.isFinite(teacherId) || filters.length === 0) {
    return res.status(400).json({ sections: [] });
  }
  try {
    const pool = await poolPromise;
    const ssCols = await getTableColumns(pool, "StudentSemester");
    const uCols = await getTableColumns(pool, "Users");
    const sectionCol = pickColumn(ssCols, COLUMN_CANDIDATES.studentSemesterSection);
    const semCol = pickColumn(ssCols, COLUMN_CANDIDATES.studentSemesterSemester);
    const deptCol = pickColumn(uCols, COLUMN_CANDIDATES.usersDepartment);

    if (!sectionCol || !semCol || !deptCol) {
      return res.status(200).json({ sections: [] });
    }

    const req = pool.request().input("tid", sql.Int, teacherId);
    const { whereSql, bind } = makeSemesterFilterSql(filters, "SS.department", "SS.sem_raw");
    bind(req);

    const result = await req.query(`
      WITH SS AS (
        SELECT
          SS0.SS_id,
          ${disciplineCaseSql("U", deptCol)} AS department,
          TRY_CONVERT(INT, SS0.${wrapCol(semCol)}) AS sem_raw,
          LTRIM(RTRIM(COALESCE(SS0.${wrapCol(sectionCol)}, ''))) AS section_name
        FROM StudentSemester SS0
        INNER JOIN Users U ON U.u_id = SS0.student_id
        WHERE LOWER(LTRIM(RTRIM(ISNULL(U.user_type, '')))) = 'student'
      )
      SELECT DISTINCT SS.section_name
      FROM TeacherCourse TC
      INNER JOIN Enrollments E ON E.course_id = TC.course_id
      INNER JOIN SS ON SS.SS_id = E.student_semester_id
      WHERE TC.teacher_id = @tid
        AND SS.section_name <> ''
        AND SS.department IS NOT NULL
        ${whereSql}
      ORDER BY SS.section_name
    `);

    const sections = (result.recordset || []).map((r) => r.section_name).filter(Boolean);
    return res.status(200).json({ sections });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", sections: [] });
  }
};

/** Send one message to students matching selected semester + section filters */
export const SendMessageToFilteredStudents = async (req, res) => {
  const teacherId = parseInt(String(req.body.teacher_id), 10);
  const message = String(req.body.message || "").trim();
  const filters = parseSemesterFilters(req.body.semester_filters);
  const sections = Array.isArray(req.body.sections)
    ? req.body.sections.map((s) => String(s || "").trim()).filter(Boolean)
    : [];

  if (!Number.isFinite(teacherId) || !message || filters.length === 0) {
    return res.status(400).json({ message: "teacher_id, message, semester_filters are required" });
  }

  try {
    const pool = await poolPromise;
    const ssCols = await getTableColumns(pool, "StudentSemester");
    const uCols = await getTableColumns(pool, "Users");
    const msgCols = await getTableColumns(pool, "Messages");
    const semCol = pickColumn(ssCols, COLUMN_CANDIDATES.studentSemesterSemester);
    const sectionCol = pickColumn(ssCols, COLUMN_CANDIDATES.studentSemesterSection);
    const deptCol = pickColumn(uCols, COLUMN_CANDIDATES.usersDepartment);
    if (!semCol || !deptCol) {
      return res.status(500).json({ message: "Database semester/department columns not configured." });
    }

    const reqQ = pool
      .request()
      .input("tid", sql.Int, teacherId)
      .input("msg", sql.VarChar(500), message.slice(0, 500));

    const { whereSql, bind } = makeSemesterFilterSql(filters, "SS0.department", "SS0.sem_raw");
    bind(reqQ);

    let sectionSql = "";
    if (sections.length > 0 && sectionCol) {
      const secPlaceholders = sections.map((_, i) => `@sec${i}`).join(", ");
      sections.forEach((s, i) => reqQ.input(`sec${i}`, sql.NVarChar(100), s));
      sectionSql = ` AND SS0.section_name IN (${secPlaceholders})`;
    }

    const includeBirthdayWish = msgCols.has("birthday_wish");
    const messageColumns = includeBirthdayWish
      ? "(sender_id, receiver_id, message, emoji, birthday_wish)"
      : "(sender_id, receiver_id, message, emoji)";
    const birthdayValue = includeBirthdayWish ? ", 0" : "";

    const inserted = await reqQ.query(`
      WITH SS AS (
        SELECT
          SS0.SS_id,
          SS0.student_id,
          ${disciplineCaseSql("U", deptCol)} AS department,
          TRY_CONVERT(INT, SS0.${wrapCol(semCol)}) AS sem_raw
          ${sectionCol ? `, LTRIM(RTRIM(COALESCE(SS0.${wrapCol(sectionCol)}, ''))) AS section_name` : ", '' AS section_name"}
        FROM StudentSemester SS0
        INNER JOIN Users U ON U.u_id = SS0.student_id
        WHERE LOWER(LTRIM(RTRIM(ISNULL(U.user_type, '')))) = 'student'
      ),
      targets AS (
        SELECT DISTINCT SS0.student_id
        FROM TeacherCourse TC
        INNER JOIN Enrollments E ON E.course_id = TC.course_id
        INNER JOIN SS SS0 ON SS0.SS_id = E.student_semester_id
        WHERE TC.teacher_id = @tid
          AND SS0.department IS NOT NULL
          ${whereSql}
          ${sectionSql}
      )
      INSERT INTO Messages ${messageColumns}
      OUTPUT INSERTED.receiver_id
      SELECT @tid, T.student_id, @msg, NULL${birthdayValue}
      FROM targets T
      WHERE T.student_id <> @tid
    `);

    const receiverIds = [...new Set((inserted.recordset || []).map((r) => Number(r.receiver_id)).filter(Number.isFinite))];
    return res.status(201).json({
      message: "Message sent successfully",
      totalStudents: receiverIds.length,
      receiver_ids: receiverIds,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};
