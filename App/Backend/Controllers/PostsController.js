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

const announcementSelect = `SELECT a.A_id, u.image, u.name, a.created_at, a.message,
                    (SELECT COUNT(DISTINCT ar.user_id) FROM Announcement_Reaction ar WHERE ar.announcement_id = a.A_id) AS reaction_user_count
                    FROM Announcements a 
                    JOIN Users u ON u.u_id = a.created_by`;

const announcementVisibilitySql = `
                    AND (a.is_active IS NULL OR a.is_active = 1)
                    AND (a.from_date IS NULL OR CAST(GETDATE() AS DATE) >= a.from_date)
                    AND (a.to_date IS NULL OR CAST(GETDATE() AS DATE) <= a.to_date)`;

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
                    WHERE a.type = 'public' AND a.created_by = @userId
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
                    WHERE a.type = 'faculty' AND a.created_by = @userId
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
            canReact: !alreadyReacted,
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
                    FROM Users u
                    JOIN Announcement_Reaction ar ON u.u_id = ar.user_id
                    JOIN emojis e ON e.E_id = ar.emoji_id
                    WHERE ar.announcement_id = @id
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
            .query(`SELECT COUNT(DISTINCT user_id) AS cnt
                    FROM Announcement_Reaction
                    WHERE announcement_id = @id`);
        const cnt = result.recordset[0]?.cnt ?? 0;
        res.status(200).json({ count: Number(cnt) || 0 });
    } catch (err) {
        res.status(500).send(err.message);
    }
};



