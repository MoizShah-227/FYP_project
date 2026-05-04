import { poolPromise, sql } from "../Config/DB.js";

/**
 * Run once on SQL Server:
 * ALTER TABLE Messages ADD event_id INT NULL;
 * ALTER TABLE Messages ADD CONSTRAINT FK_Messages_Event
 *   FOREIGN KEY (event_id) REFERENCES Event(E_id) ON DELETE SET NULL;
 * CREATE INDEX IX_Messages_sender_event ON Messages(sender_id, event_id);
 */

const hasEventIdColumnError = (err) =>
  String(err?.message || "")
    .toLowerCase()
    .includes("event_id") || String(err?.message || "").includes("Invalid column");

async function getUserTypeLower(pool, userId) {
  const r = await pool
    .request()
    .input("id", sql.Int, userId)
    .query(
      `SELECT LOWER(LTRIM(RTRIM(ISNULL(user_type, '')))) AS ut FROM Users WHERE u_id = @id`
    );
  return r.recordset?.[0]?.ut ?? "";
}

/** Today’s events without Messages join — used when event_id column is missing */
async function fetchTodayEventsRowsOnly(pool) {
  const result = await pool.request().query(`
    SELECT
      e.E_id AS event_id,
      e.event_name,
      e.description,
      e.image,
      e.event_date
    FROM [Event] e
    WHERE e.event_date IS NOT NULL
      AND CAST(e.event_date AS DATE) = CAST(GETDATE() AS DATE)
    ORDER BY e.E_id
  `);
  return result.recordset || [];
}

/** True if the Event table has at least one row with event_date = today (server local date) */
export const HasEventToday = async (req, res) => {
  try {
    const pool = await poolPromise;
    const dayRow = await pool.request().query(`SELECT CAST(GETDATE() AS DATE) AS server_today`);
    const serverToday = dayRow.recordset?.[0]?.server_today ?? null;
    const result = await pool.request().query(`
      SELECT COUNT(*) AS cnt
      FROM [Event] e
      WHERE e.event_date IS NOT NULL
        AND CAST(e.event_date AS DATE) = CAST(GETDATE() AS DATE)
    `);
    const cnt = Number(result.recordset?.[0]?.cnt ?? 0) || 0;
    return res.status(200).json({
      hasEventToday: cnt > 0,
      count: cnt,
      server_today: serverToday,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message || "Server error",
      hasEventToday: false,
      count: 0,
    });
  }
};

/** Events scheduled for today + whether this user already sent bulk wishes for that event */
export const GetTodayEventsStatus = async (req, res) => {
  const user_id = parseInt(String(req.query.user_id), 10);
  if (!Number.isFinite(user_id)) {
    return res.status(400).json({ message: "user_id required", events: [] });
  }

  try {
    const pool = await poolPromise;
    const viewerRole = await getUserTypeLower(pool, user_id);
    if (viewerRole !== "student") {
      return res.status(200).json({ events: [], students_only: true });
    }

    const result = await pool
      .request()
      .input("uid", sql.Int, user_id)
      .query(`
        SELECT
          e.E_id AS event_id,
          e.event_name,
          e.description,
          e.image,
          e.event_date,
          CASE
            WHEN EXISTS (
              SELECT 1 FROM Messages m
              WHERE m.sender_id = @uid AND m.event_id = e.E_id
            ) THEN 1
            ELSE 0
          END AS already_sent
        FROM [Event] e
        WHERE e.event_date IS NOT NULL
          AND CAST(e.event_date AS DATE) = CAST(GETDATE() AS DATE)
        ORDER BY e.E_id
      `);

    const events = (result.recordset || []).map((row) => ({
      event_id: row.event_id,
      event_name: row.event_name,
      description: row.description,
      image: row.image,
      event_date: row.event_date,
      already_sent: Number(row.already_sent) === 1,
      canWish: Number(row.already_sent) !== 1,
    }));

    return res.status(200).json({ events });
  } catch (err) {
    console.error(err);
    if (hasEventIdColumnError(err)) {
      try {
        const pool = await poolPromise;
        const viewerRole = await getUserTypeLower(pool, user_id);
        if (viewerRole !== "student") {
          return res.status(200).json({ events: [], students_only: true });
        }
        const rows = await fetchTodayEventsRowsOnly(pool);
        const events = rows.map((row) => ({
          event_id: row.event_id,
          event_name: row.event_name,
          description: row.description,
          image: row.image,
          event_date: row.event_date,
          already_sent: false,
          canWish: true,
        }));
        return res.status(200).json({
          events,
          warning:
            "Messages.event_id is missing — event wishes show, but run Backend/sql/alter_messages_event_id.sql so sends & already_sent work.",
        });
      } catch (err2) {
        console.error(err2);
        return res.status(500).json({ message: err2.message || "Server error", events: [] });
      }
    }
    return res.status(500).json({ message: err.message || "Server error", events: [] });
  }
};

/** One bulk wish per user per event (any row with sender_id + event_id blocks repeats) */
export const SendEventBulkWishes = async (req, res) => {
  const sender_id = parseInt(String(req.body?.sender_id), 10);
  const event_id = parseInt(String(req.body?.event_id), 10);
  const rawReceivers = Array.isArray(req.body?.receiver_ids) ? req.body.receiver_ids : [];
  const emojiRaw = req.body?.emoji != null ? String(req.body.emoji) : "";
  const messageRaw =
    typeof req.body?.message === "string" && req.body.message.trim()
      ? req.body.message.trim().slice(0, 500)
      : "Event wish";

  const receiver_ids = [
    ...new Set(
      rawReceivers
        .map((x) => parseInt(String(x), 10))
        .filter((n) => Number.isFinite(n) && n !== sender_id)
    ),
  ];

  if (!Number.isFinite(sender_id) || !Number.isFinite(event_id) || receiver_ids.length === 0) {
    return res.status(400).json({
      message: "sender_id, event_id, and at least one receiver_id required",
    });
  }

  const pool = await poolPromise;
  const senderRole = await getUserTypeLower(pool, sender_id);
  if (senderRole !== "student") {
    return res.status(403).json({ message: "Only students can send event wishes." });
  }

  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const recvReq = new sql.Request(transaction);
    receiver_ids.forEach((rid, i) => recvReq.input(`rid${i}`, sql.Int, rid));
    const recvPlace = receiver_ids.map((_, i) => `@rid${i}`).join(", ");
    const studentReceivers = await recvReq.query(`
      SELECT u_id FROM Users
      WHERE u_id IN (${recvPlace})
        AND LOWER(LTRIM(RTRIM(ISNULL(user_type, '')))) = 'student'
    `);
    if (studentReceivers.recordset?.length) {
      await transaction.rollback();
      return res.status(400).json({
        message: "You can only send event wishes to teachers or staff, not students.",
      });
    }

    const eventCheck = await new sql.Request(transaction)
      .input("eid", sql.Int, event_id)
      .query(`
        SELECT TOP 1 E_id
        FROM [Event]
        WHERE E_id = @eid
          AND event_date IS NOT NULL
          AND CAST(event_date AS DATE) = CAST(GETDATE() AS DATE)
      `);
    if (!eventCheck.recordset?.length) {
      await transaction.rollback();
      return res.status(404).json({ message: "Event not found or not scheduled for today." });
    }

    const dup = await new sql.Request(transaction)
      .input("sender_id", sql.Int, sender_id)
      .input("event_id", sql.Int, event_id)
      .query(`
        SELECT TOP 1 M_id FROM Messages
        WHERE sender_id = @sender_id AND event_id = @event_id
      `);
    if (dup.recordset?.length) {
      await transaction.rollback();
      return res.status(409).json({
        message: "You already sent wishes for this event.",
        alreadySent: true,
        canWish: false,
      });
    }

    const emojiVal = emojiRaw ? emojiRaw.slice(0, 100) : null;

    for (const receiver_id of receiver_ids) {
      await new sql.Request(transaction)
        .input("sender_id", sql.Int, sender_id)
        .input("receiver_id", sql.Int, receiver_id)
        .input("message", sql.VarChar(500), messageRaw)
        .input("emoji", sql.NVarChar(100), emojiVal)
        .input("birthday_wish", sql.Bit, 0)
        .input("event_id", sql.Int, event_id)
        .query(`
          INSERT INTO Messages (sender_id, receiver_id, message, emoji, birthday_wish, event_id)
          VALUES (@sender_id, @receiver_id, @message, @emoji, @birthday_wish, @event_id)
        `);
    }

    await transaction.commit();
    return res.status(201).json({
      message: "Wishes sent",
      sent: receiver_ids.length,
      receiver_ids,
    });
  } catch (err) {
    try {
      await transaction.rollback();
    } catch (_) {
      /* ignore */
    }
    console.error(err);
    if (hasEventIdColumnError(err)) {
      return res.status(503).json({
        message:
          "Add Messages.event_id and include it in INSERT (see EventController.js header).",
      });
    }
    const msg = String(err.message || "");
    if (msg.includes("FK_Messages_Receiver") || msg.includes("FK_Messages_Sender")) {
      return res.status(400).json({ message: "Invalid sender or receiver user id." });
    }
    return res.status(500).json({ message: msg || "Server error" });
  }
};
