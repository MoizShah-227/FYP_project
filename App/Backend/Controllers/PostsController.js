import { sql, poolPromise } from "../Config/DB.js";

/** req.user may be set by auth middleware; else client sends ?userId= (matches localStorage user.id) */
const resolveUserId = (req) => {
    const fromAuth = req.user?.u_id ?? req.user?.id;
    const fromQuery = req.query?.userId;
    const raw = fromAuth != null ? fromAuth : fromQuery;
    const n = parseInt(String(raw), 10);
    return Number.isFinite(n) ? n : null;
};

const mapAnnouncementRows = (rows) =>
    (rows || []).map((row) => ({
        id: row.A_id,
        name: row.name,
        time: row.created_at ? new Date(row.created_at).toLocaleString() : "",
        avatar: row.image || null,
        content: row.message,
        reactionUserCount: Number(row.reaction_user_count) || 0,
    }));

/** Distinct reactors excluding users the post author has blocked (UserBlocked.user_id = author, blocked_user_id = reactor). */
const reactionUserCountSql = `(SELECT COUNT(DISTINCT ar.user_id)
                    FROM Announcement_Reaction ar
                    WHERE ar.announcement_id = a.A_id
                      AND NOT EXISTS (
                        SELECT 1 FROM UserBlocked ub
                        WHERE ub.user_id = a.created_by AND ub.blocked_user_id = ar.user_id
                      ))`;

const announcementSelect = `SELECT a.A_id, u.image, u.name, a.created_at, a.message,
                    ${reactionUserCountSql} AS reaction_user_count
                    FROM Announcements a 
                    JOIN Users u ON u.u_id = a.created_by`;

const announcementVisibilitySql = `
                    AND (a.is_active IS NULL OR a.is_active = 1)
                    AND (a.from_date IS NULL OR CAST(GETDATE() AS DATE) >= a.from_date)
                    AND (a.to_date IS NULL OR CAST(GETDATE() AS DATE) <= a.to_date)`;

/** Match type column even if DB has stray spaces or different casing */
const typeEquals = (literal) =>
    `LOWER(LTRIM(RTRIM(CAST(a.type AS NVARCHAR(200))))) = ${literal}`;

/** Wishora feed: include both public and faculty rows for this author */
const typePublicOrFaculty = `(${typeEquals("'public'")} OR ${typeEquals("'faculty'")})`;

export const PublicPosts = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        if (userId == null) {
            return res.status(400).json({ message: "userId is required" });
        }
        const pool = await poolPromise;
        const result = await pool.request()
            .input("userId", sql.Int, userId)
            .query(`${announcementSelect}
                    WHERE ${typePublicOrFaculty} AND a.created_by = @userId
                    ${announcementVisibilitySql}
                    ORDER BY a.created_at DESC`);
        res.status(200).json(mapAnnouncementRows(result.recordset));
    } catch (err) {
        res.status(500).send(err.message);
    }
};

export const FacultyPosts = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        if (userId == null) {
            return res.status(400).json({ message: "userId is required" });
        }
        const pool = await poolPromise;
        const result = await pool.request()
            .input("userId", sql.Int, userId)
            .query(`${announcementSelect}
                    WHERE ${typeEquals("'faculty'")} AND a.created_by = @userId
                    ${announcementVisibilitySql}
                    ORDER BY a.created_at DESC`);
        res.status(200).json(mapAnnouncementRows(result.recordset));
    } catch (err) {
        res.status(500).send(err.message);
    }
};

/** Same idea as GET /message/birthday-wish-eligibility — can this user still react on this announcement? */
export const AnnouncementReactionEligibility = async (req, res) => {
    const user_id = parseInt(String(req.query.user_id), 10);
    const announcement_id = parseInt(String(req.query.announcement_id), 10);

    if (!Number.isFinite(user_id) || !Number.isFinite(announcement_id)) {
        return res.status(400).json({
            message: "user_id and announcement_id required",
            canReact: false,
            alreadyReacted: false,
        });
    }

    try {
        const pool = await poolPromise;
        const gate = await pool
            .request()
            .input("user_id", sql.Int, user_id)
            .input("announcement_id", sql.Int, announcement_id)
            .query(`
                SELECT ann.created_by AS author_id,
                  CASE WHEN EXISTS (
                    SELECT 1 FROM UserBlocked ub
                    WHERE ub.user_id = ann.created_by AND ub.blocked_user_id = @user_id
                  ) THEN 1 ELSE 0 END AS blocked_by_author
                FROM Announcements ann WHERE ann.A_id = @announcement_id
            `);
        const g = gate.recordset?.[0];
        if (!g) {
            return res.status(404).json({
                message: "Announcement not found",
                canReact: false,
                alreadyReacted: false,
                blocked_by_author: false,
            });
        }
        const blockedByAuthor = Number(g.blocked_by_author) === 1;

        const row = await pool
            .request()
            .input("user_id", sql.Int, user_id)
            .input("announcement_id", sql.Int, announcement_id)
            .query(`
                SELECT TOP 1 ar.emoji_id, e.emoji AS emoji_shortcode
                FROM Announcement_Reaction ar
                LEFT JOIN Emojis e ON e.E_id = ar.emoji_id
                WHERE ar.user_id = @user_id AND ar.announcement_id = @announcement_id
            `);

        const found = row.recordset?.[0];
        const alreadyReacted = !!found;
        const emoji_id =
            found && found.emoji_id != null && Number.isFinite(Number(found.emoji_id))
                ? Number(found.emoji_id)
                : null;

        return res.status(200).json({
            canReact: !alreadyReacted && !blockedByAuthor,
            blocked_by_author: blockedByAuthor,
            alreadyReacted,
            emoji_id: alreadyReacted ? emoji_id : null,
            emoji_shortcode: alreadyReacted && found?.emoji_shortcode ? String(found.emoji_shortcode) : null,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: err.message || "Server error",
            canReact: false,
            alreadyReacted: false,
        });
    }
};

export const ReactOnPosts = async (req, res) => {
    const user_id = parseInt(String(req.body?.user_id), 10);
    const announcement_id = parseInt(String(req.body?.announcement_id), 10);
    const emoji_id = parseInt(String(req.body?.emoji_id), 10);

    if (!Number.isFinite(user_id) || !Number.isFinite(announcement_id) || !Number.isFinite(emoji_id)) {
        return res.status(400).json({ message: "user_id, announcement_id, and emoji_id must be valid numbers" });
    }

    try {
        const pool = await poolPromise;
        const blocked = await pool
            .request()
            .input("u_id", sql.Int, user_id)
            .input("a_id", sql.Int, announcement_id)
            .query(`
              SELECT CASE WHEN EXISTS (
                SELECT 1 FROM UserBlocked ub
                INNER JOIN Announcements ann ON ann.A_id = @a_id AND ann.created_by = ub.user_id
                WHERE ub.blocked_user_id = @u_id
              ) THEN 1 ELSE 0 END AS blocked
            `);
        if (Number(blocked.recordset?.[0]?.blocked) === 1) {
            return res.status(403).json({
                message: "You cannot react to this post.",
                blocked_by_author: true,
            });
        }
        await pool
            .request()
            .input("u_id", sql.Int, user_id)
            .input("a_id", sql.Int, announcement_id)
            .input("e_id", sql.Int, emoji_id)
            .query(
                "INSERT INTO Announcement_Reaction (user_id, announcement_id, emoji_id) VALUES (@u_id, @a_id, @e_id)"
            );
        return res.status(200).json({ ok: true, user_id, announcement_id, emoji_id });
    } catch (err) {
        const msg = String(err.message || "");
        if (
            msg.includes("UQ_User_Announcement") ||
            msg.includes("2627") ||
            /duplicate key/i.test(msg)
        ) {
            return res.status(409).json({
                message: "You already reacted to this post.",
                alreadyReacted: true,
                canReact: false,
            });
        }
        return res.status(500).json({ message: msg });
    }
};

export const PostReactions = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query(`SELECT u.u_id, u.name, u.image, u.user_type, e.emoji, e.E_id
                    FROM Announcement_Reaction ar
                    JOIN Announcements ann ON ann.A_id = ar.announcement_id
                    JOIN Users u ON u.u_id = ar.user_id
                    JOIN emojis e ON e.E_id = ar.emoji_id
                    WHERE ar.announcement_id = @id
                      AND NOT EXISTS (
                        SELECT 1 FROM UserBlocked ub
                        WHERE ub.user_id = ann.created_by AND ub.blocked_user_id = ar.user_id
                      )
                    ORDER BY ar.user_id, e.E_id`);
        res.status(200).json(result.recordset || []);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

/** Distinct users who reacted (for feed badge after POST react) */
export const PostReactionUserCount = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query(`SELECT COUNT(DISTINCT ar.user_id) AS cnt
                    FROM Announcement_Reaction ar
                    JOIN Announcements ann ON ann.A_id = ar.announcement_id
                    WHERE ar.announcement_id = @id
                      AND NOT EXISTS (
                        SELECT 1 FROM UserBlocked ub
                        WHERE ub.user_id = ann.created_by AND ub.blocked_user_id = ar.user_id
                      )`);
        const cnt = result.recordset[0]?.cnt ?? 0;
        res.status(200).json({ count: Number(cnt) || 0 });
    } catch (err) {
        res.status(500).send(err.message);
    }
};



