import { poolPromise } from "../Config/DB.js";

/** Always try to send at least this many in the response. */
const MIN_EMOJIS_IN_RESPONSE = 5;

/**
 * Fallback shortcodes (priority order). First matching enabled rows are used.
 * Keep entries lower-case; row.emoji is matched case-insensitively.
 */
const NEUTRAL_FALLBACK_SHORTCODES = [
  ":smile:",
  ":heart:",
  ":thumbsup:",
  ":pray:",
  ":tada:",
  ":clap:",
  ":star:",
  ":blush:",
  ":wave:",
  ":sparkles:",
];

/**
 * Returns up to `limit` neutral emojis from DB. Picks from
 * `NEUTRAL_FALLBACK_SHORTCODES` first (priority order), then fills the rest
 * from any remaining enabled rows.
 * Optionally excludes ids already in `excludeIds`.
 */
async function getNeutralEmojis(pool, limit = MIN_EMOJIS_IN_RESPONSE, excludeIds = new Set()) {
  const res = await pool.request().query(`
    SELECT E_id, emoji, keywords
    FROM   Emojis
    WHERE  isEnable = 1
  `);
  const rows = res.recordset || [];
  if (rows.length === 0) return [];

  const byCode = new Map();
  for (const row of rows) {
    const key = String(row.emoji ?? "").trim().toLowerCase();
    if (key && !byCode.has(key)) byCode.set(key, row);
  }

  const picked = [];
  const usedIds = new Set(excludeIds);

  for (const sc of NEUTRAL_FALLBACK_SHORTCODES) {
    if (picked.length >= limit) break;
    const hit = byCode.get(sc.toLowerCase());
    if (hit && !usedIds.has(hit.E_id)) {
      picked.push(hit);
      usedIds.add(hit.E_id);
    }
  }

  if (picked.length < limit) {
    for (const row of rows) {
      if (picked.length >= limit) break;
      if (!usedIds.has(row.E_id)) {
        picked.push(row);
        usedIds.add(row.E_id);
      }
    }
  }

  return picked;
}

/** Normalize DB row to API shape. */
function toApiEmoji(row, score) {
  return {
    id: row.E_id,
    emoji: row.emoji,
    keywords: row.keywords ?? null,
    score: typeof score === "number" ? score : 0,
  };
}

/** Lowercase + strip non-alphanumerics + split on whitespace, drop 1-letter tokens. */
function extractWords(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * Each emoji row has CSV `keywords`.
 * Exact word match = 3 pts, substring (either direction) = 1 pt.
 * Returns top 5 rows with score > 0, sorted by score desc.
 */
function scoreEmojis(emojis, textWords) {
  return emojis
    .map((row) => {
      const emojiKeywords = String(row.keywords ?? "")
        .toLowerCase()
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      let score = 0;
      for (const word of textWords) {
        for (const keyword of emojiKeywords) {
          if (word === keyword) score += 3;
          else if (keyword.includes(word) || word.includes(keyword)) score += 1;
        }
      }
      return { ...row, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

/**
 * POST /emoji/recommend
 * Body: { text: "..." }
 * Response: { success, text, wordsParsed, emojis: [{ id, emoji, keywords, score }] }
 *
 * Reads admin-enabled emojis with non-empty keywords from `Emojis` and scores
 * them against the words inside `text`.
 */
export const RecommendEmojis = async (req, res) => {
  try {
    const text = req.body?.text;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "text field required" });
    }
    if (text.length > 1000) {
      return res
        .status(400)
        .json({ success: false, error: "text too long (max 1000 chars)" });
    }

    const textWords = extractWords(text.trim());
    const pool = await poolPromise;

    /** No usable words → straight neutral pad to 5. */
    if (textWords.length === 0) {
      const neutrals = await getNeutralEmojis(pool, MIN_EMOJIS_IN_RESPONSE);
      return res.status(200).json({
        success: true,
        text: text.trim(),
        wordsParsed: [],
        fallback: true,
        reason: "no_valid_words",
        emojis: neutrals.map((r) => toApiEmoji(r, 0)),
      });
    }

    const result = await pool.request().query(`
      SELECT E_id, emoji, keywords
      FROM   Emojis
      WHERE  isEnable = 1
        AND  keywords IS NOT NULL
        AND  keywords <> ''
    `);

    /** No rows have keywords at all → pad with neutrals. */
    if (!result.recordset || result.recordset.length === 0) {
      const neutrals = await getNeutralEmojis(pool, MIN_EMOJIS_IN_RESPONSE);
      return res.status(200).json({
        success: true,
        text: text.trim(),
        wordsParsed: textWords,
        fallback: true,
        reason: "no_enabled_keyword_emojis",
        emojis: neutrals.map((r) => toApiEmoji(r, 0)),
      });
    }

    const matched = scoreEmojis(result.recordset, textWords);

    /** Nothing matched → pad with neutrals (still success). */
    if (matched.length === 0) {
      const neutrals = await getNeutralEmojis(pool, MIN_EMOJIS_IN_RESPONSE);
      return res.status(200).json({
        success: true,
        text: text.trim(),
        wordsParsed: textWords,
        fallback: true,
        reason: "no_keyword_match",
        emojis: neutrals.map((r) => toApiEmoji(r, 0)),
      });
    }

    /** Matched < MIN → keep matched on top, fill the rest with neutrals (no dupes). */
    const matchedApi = matched.map((r) => toApiEmoji(r, r.score));
    const padded = [...matchedApi];

    if (padded.length < MIN_EMOJIS_IN_RESPONSE) {
      const usedIds = new Set(padded.map((m) => m.id));
      const fillers = await getNeutralEmojis(
        pool,
        MIN_EMOJIS_IN_RESPONSE - padded.length,
        usedIds
      );
      for (const row of fillers) padded.push(toApiEmoji(row, 0));
    }

    return res.status(200).json({
      success: true,
      text: text.trim(),
      wordsParsed: textWords,
      fallback: false,
      padded: padded.length > matchedApi.length,
      matched_count: matchedApi.length,
      emojis: padded,
    });
  } catch (err) {
    console.error("RecommendEmojis error:", err);
    return res
      .status(500)
      .json({ success: false, error: err.message || "Server error" });
  }
};

/** GET /emoji/all  →  debug dump of every row in `Emojis` */
export const GetAllEmojis = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM Emojis ORDER BY E_id");
    return res
      .status(200)
      .json({ success: true, emojis: result.recordset || [] });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: err.message || "Server error" });
  }
};
