import React, { useEffect, useState } from 'react';
import EmojiConvertor from 'emoji-js';
import api from '../../config/axiosConfig.js';
import admin from '../assets/admin.png';

const emojiStore = new EmojiConvertor();
emojiStore.colons_mode = true;

function unifiedToColonShortcodes(str) {
  if (typeof str !== 'string' || !str) return '';
  return emojiStore.replace_unified(str);
}

function formatTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
  } catch {
    return '';
  }
}

/** Quick emoji row for event messages (5 only). */
const EVENT_EMOJIS = ['❤️', '🤩', '🥳', '👑', '💯'];

const POST_BODY_MAX_LEN = 320;

const renderEmojiGlyph = (shortcode) => {
  if (typeof shortcode !== 'string' || !shortcode.trim()) return '·';
  const c = new EmojiConvertor();
  c.replace_mode = 'unified';
  const out = c.replace_colons(shortcode);
  return out === shortcode && /^:[a-z0-9_+-]+:$/i.test(shortcode.trim()) ? '·' : out;
};

function PostEmojiReactions({ announcementId, onReacted, feedAlreadyReacted, feedReactionEmoji }) {
  const [loading, setLoading] = useState(true);
  const [choices, setChoices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);
  const [alreadyReacted, setAlreadyReacted] = useState(!!feedAlreadyReacted);
  /** Post author blocked this user — hide reaction UI (server rejects POST). */
  const [blockedCannotReact, setBlockedCannotReact] = useState(false);
  const [reactedShortcode, setReactedShortcode] = useState(
    feedAlreadyReacted && typeof feedReactionEmoji === 'string' ? feedReactionEmoji : null
  );

  useEffect(() => {
    setAlreadyReacted(!!feedAlreadyReacted);
    setReactedShortcode(
      feedAlreadyReacted && typeof feedReactionEmoji === 'string' ? feedReactionEmoji : null
    );
  }, [feedAlreadyReacted, feedReactionEmoji]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (feedAlreadyReacted) {
        setLoading(false);
        setChoices([]);
        return;
      }

      setLoading(true);
      setBlockedCannotReact(false);
      const rawUser = localStorage.getItem('user');
      const user = rawUser ? JSON.parse(rawUser) : null;
      const user_id = Number(user?.id ?? user?.u_id);
      const annId = Number(announcementId);

      try {
        if (Number.isFinite(user_id) && Number.isFinite(annId)) {
          const eligRes = await api.get('/posts/reaction-eligibility', {
            params: { user_id, announcement_id: annId },
            withCredentials: true,
          });
          if (!cancelled) {
            const d = eligRes?.data;
            const reacted = !!d?.alreadyReacted;
            const blocked = !!d?.blocked_by_author;
            setAlreadyReacted(reacted);
            setBlockedCannotReact(blocked && !reacted);
            setReactedShortcode(
              reacted && typeof d?.emoji_shortcode === 'string' ? d.emoji_shortcode : null
            );
            if (blocked && !reacted) {
              setChoices([]);
              setLoading(false);
              return;
            }
          }
        }
      } catch (eligErr) {
        console.warn(eligErr.response?.data || eligErr.message);
        if (!cancelled) {
          setAlreadyReacted(false);
          setReactedShortcode(null);
          setBlockedCannotReact(false);
        }
      }

      try {
        const emojisRes = await api.get('/admin/emojis', { withCredentials: true });
        if (cancelled) return;
        const raw = Array.isArray(emojisRes.data?.[0]) ? emojisRes.data[0] : [];
        const enabled = raw.filter(
          (r) => r.isEnable === true || r.isEnable === 1 || r.isEnable == null
        );
        const list = enabled.length ? enabled : raw;
        setChoices(Array.isArray(list) ? list.slice(0, 5) : []);
      } catch (e) {
        console.error(e.response?.data || e.message);
        if (!cancelled) setChoices([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [announcementId, feedAlreadyReacted]);

  const sendReaction = async () => {
    const row = choices.find((r) => Number(r.E_id) === Number(selectedId));
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : null;
    const user_id = Number(user?.id ?? user?.u_id);
    const emoji_id = Number(row?.E_id);
    if (!Number.isFinite(user_id) || !Number.isFinite(emoji_id) || !Number.isFinite(Number(announcementId))) {
      setErr('Pick an emoji to send.');
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      await api.post('/posts/reactonpost', {
        user_id,
        announcement_id: Number(announcementId),
        emoji_id,
      });
      setAlreadyReacted(true);
      setReactedShortcode(row?.emoji != null ? String(row.emoji) : null);
      setSelectedId(null);
      onReacted?.();
    } catch (e) {
      console.error(e.response?.data || e.message);
      if (e.response?.status === 409 || e.response?.data?.alreadyReacted) {
        setAlreadyReacted(true);
        setErr(null);
        onReacted?.();
        return;
      }
      if (e.response?.status === 403 || e.response?.data?.blocked_by_author) {
        setBlockedCannotReact(true);
        setErr(null);
        return;
      }
      setErr(e.response?.data?.message || e.message || 'Could not react');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="small text-muted mb-0">Loading reactions…</p>;
  }

  if (blockedCannotReact) {
    return (
      <p className="small text-muted mb-0" style={{ lineHeight: 1.45 }}>
        You can&apos;t react here — the post owner has blocked interaction with your account.
      </p>
    );
  }

  if (alreadyReacted) {
    return (
      <div className="py-2">
        <p className="small fw-semibold mb-1" style={{ color: '#07333d' }}>
          You&apos;ve reacted to this post
        </p>
        {reactedShortcode ? (
          <span className="fs-3" aria-hidden>
            {renderEmojiGlyph(reactedShortcode)}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="w-100">
      {err ? <p className="small text-danger mb-2">{err}</p> : null}
      {choices.length === 0 ? (
        <p className="small text-muted mb-0">No emoji options configured.</p>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(choices.length, 5)}, 1fr)`,
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            {choices.map((r) => {
              const id = Number(r.E_id);
              const picked = selectedId != null && Number(selectedId) === id;
              return (
                <button
                  key={r.E_id}
                  type="button"
                  disabled={submitting}
                  onClick={() => setSelectedId(picked ? null : id)}
                  title={typeof r.emoji === 'string' ? r.emoji : ''}
                  style={{
                    background: picked ? '#d9eff4' : '#f4f4f4',
                    border: picked ? '2px solid #07333d' : '2px solid transparent',
                    borderRadius: '10px',
                    fontSize: '1.5rem',
                    padding: '8px 4px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                >
                  {renderEmojiGlyph(r.emoji)}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="w-100 border-0 rounded-3 fw-bold"
            style={{
              background: '#07333d',
              color: 'white',
              padding: '14px',
              fontSize: '1rem',
              cursor: submitting || selectedId == null ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: submitting || selectedId == null ? 0.65 : 1,
            }}
            disabled={submitting || selectedId == null}
            onClick={sendReaction}
          >
            {submitting ? 'Sending…' : 'Send reaction'}
          </button>
        </>
      )}
    </div>
  );
}

function EventMessageModal({ authorName, receiverId, onClose, onSent }) {
  const [selectedEmojis, setSelectedEmojis] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const toggleEmoji = (em) => {
    setSelectedEmojis((prev) => {
      const next = new Set(prev);
      next.has(em) ? next.delete(em) : next.add(em);
      return next;
    });
  };

  const handleSend = async () => {
    const emojis = [...selectedEmojis];
    if (emojis.length === 0) {
      setErr('Pick at least one emoji.');
      return;
    }
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : null;
    const sender_id = Number(user?.id ?? user?.u_id);
    const receiver_id = Number(receiverId);
    if (!Number.isFinite(sender_id) || !Number.isFinite(receiver_id)) {
      setErr('Missing user.');
      return;
    }
    if (sender_id === receiver_id) {
      setErr('Cannot message yourself.');
      return;
    }
    const emojiJoined = emojis.join('');
    const emojiColons = unifiedToColonShortcodes(emojiJoined).trim();
    const emojiPayload =
      emojiColons && emojiColons.length > 100 ? emojiColons.slice(0, 100) : emojiColons || null;

    setSubmitting(true);
    setErr(null);
    try {
      await api.post('/message/send-message', {
        sender_id,
        receiver_id,
        message: '(emoji)',
        emoji: emojiPayload,
        birthday_wish: false,
      });
      onSent?.();
      onClose();
    } catch (e) {
      console.error(e.response?.data || e.message);
      setErr(e.response?.data?.message || e.message || 'Could not send');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 3000, backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg position-relative"
        style={{ maxWidth: '360px', width: '92%', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-start mb-1">
          <div>
            <h5 className="fw-bold mb-0" style={{ color: '#07333d' }}>Message {authorName}</h5>
            <small className="text-muted">Select Emojis:</small>
          </div>
          <button
            type="button"
            className="btn p-0 border-0"
            style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: 1 }}
            onClick={onClose}
            disabled={submitting}
          >
            ✕
          </button>
        </div>
        {err ? <p className="small text-danger mt-2 mb-0">{err}</p> : null}
        <div
          className="mt-3"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          {EVENT_EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              disabled={submitting}
              onClick={() => toggleEmoji(em)}
              style={{
                background: selectedEmojis.has(em) ? '#d9eff4' : '#f4f4f4',
                border: selectedEmojis.has(em) ? '2px solid #07333d' : '2px solid transparent',
                borderRadius: '10px',
                fontSize: '1.5rem',
                padding: '8px 4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {em}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="w-100 border-0 rounded-3 fw-bold"
          style={{
            background: '#07333d',
            color: 'white',
            padding: '14px',
            fontSize: '1rem',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: submitting ? 0.75 : 1,
          }}
          disabled={submitting}
          onClick={handleSend}
        >
          {submitting ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
}

/**
 * @param {object} item — one row from GET /user/notifications-feed/:id
 * @param {() => void} onDismiss
 * @param {() => void} [onChanged] — after react or message
 */
const NotificationActivityCard = ({ item, onDismiss, onChanged }) => {
  const [eventOpen, setEventOpen] = useState(false);
  const [sentAck, setSentAck] = useState(false);
  const reactionCount = Number(item.reaction_user_count) || 0;

  /** Post rows use /posts/reactonpost → Announcement_Reaction for counts. */
  const isPostKind =
    item.feed_kind === 'favourite_post' ||
    item.feed_kind === 'about_favourite' ||
    item.feed_kind === 'faculty_event' ||
    item.feed_kind === 'public_broadcast';

  const headline =
    item.feed_kind === 'favourite_post'
      ? `${item.author_name || 'Someone'} shared a post`
      : item.feed_kind === 'about_favourite'
        ? 'Post mentions someone you follow'
        : item.feed_kind === 'faculty_event'
          ? 'Faculty / campus update'
          : item.feed_kind === 'public_broadcast'
            ? `Public announcement — ${item.author_name || 'Someone'}`
            : 'Update';

  const avatar = item.author_image || admin;

  return (
    <>
      <div
        className="bg-white rounded-4 shadow d-flex align-items-start gap-3"
        style={{ maxWidth: 400, width: '100%', padding: '14px 16px' }}
      >
        <img
          src={avatar}
          alt=""
          className="rounded-circle flex-shrink-0"
          style={{ width: 48, height: 48, objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = admin;
          }}
        />
        <div className="flex-grow-1 min-w-0">
          <div className="fw-bold" style={{ color: '#07333d', fontSize: '0.95rem' }}>
            {headline}
          </div>
          <div className="small text-muted mb-2">{formatTime(item.created_at)}</div>
          {isPostKind ? (
            <div className="mt-1">
              {typeof item.message === 'string' && item.message.trim() ? (
                <p className="small mb-2 mt-1" style={{ color: '#444', lineHeight: 1.5 }}>
                  {item.message.trim().length > POST_BODY_MAX_LEN
                    ? `${item.message.trim().slice(0, POST_BODY_MAX_LEN)}…`
                    : item.message.trim()}
                </p>
              ) : (
                <p className="small mb-2 mt-1 text-muted fst-italic">No post text.</p>
              )}
              
              {!item.viewer_has_reacted ? (
                <p className="small text-muted mb-2" style={{ lineHeight: 1.45 }}>
                  Would you like to react to this post? If yes, select an emoji below.
                </p>
              ) : null}
              <PostEmojiReactions
                announcementId={item.announcement_id}
                feedAlreadyReacted={!!item.viewer_has_reacted}
                feedReactionEmoji={item.viewer_reaction_emoji}
                onReacted={() => onChanged?.()}
              />
              <div className="d-flex align-items-center justify-content-between mt-2">
                {reactionCount > 0 ? (
                  <span className="small text-muted">{reactionCount} reaction{reactionCount === 1 ? '' : 's'}</span>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  className="btn btn-link text-decoration-none p-0 small text-muted"
                  onClick={onDismiss}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <>
              {typeof item.message === 'string' && item.message.trim() ? (
                <p className="small mb-2 mt-1" style={{ color: '#444', lineHeight: 1.45 }}>
                  {item.message.trim().length > 160
                    ? `${item.message.trim().slice(0, 160)}…`
                    : item.message.trim()}
                </p>
              ) : null}
              <div className="d-flex flex-wrap align-items-center gap-2">
                <button
                  type="button"
                  className="border-0 fw-bold text-white rounded-pill"
                  style={{
                    background: '#07333d',
                    padding: '8px 20px',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    opacity: sentAck ? 0.65 : 1,
                  }}
                  disabled={sentAck}
                  onClick={() => setEventOpen(true)}
                >
                  {sentAck ? 'Message sent' : 'Send message'}
                </button>
                <button
                  type="button"
                  className="btn btn-link text-decoration-none p-0 small text-muted"
                  onClick={onDismiss}
                >
                  Dismiss
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {eventOpen ? (
        <EventMessageModal
          authorName={item.author_name || 'organizer'}
          receiverId={item.author_id}
          onClose={() => setEventOpen(false)}
          onSent={() => {
            setSentAck(true);
            onChanged?.();
            onDismiss();
          }}
        />
      ) : null}
    </>
  );
};

export default NotificationActivityCard;
