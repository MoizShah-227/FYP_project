import { poolPromise, sql } from "../Config/DB.js";

/**
 * One-time (SQL Server):
 * ALTER TABLE Messages ADD birthday_wish BIT NOT NULL CONSTRAINT DF_Messages_birthday_wish DEFAULT 0;
 */

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
