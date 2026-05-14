import React, { useState, useCallback } from 'react';
import EmojiConvertor from 'emoji-js';
import api from '../../config/axiosConfig.js';
import admin from '../assets/admin.png';
import RecommendedEmojiPicker from './RecommendedEmojiPicker';

const emojiStore = new EmojiConvertor();
emojiStore.colons_mode = true;

function unifiedToColonShortcodes(str) {
  if (typeof str !== 'string' || !str) return '';
  return emojiStore.replace_unified(str);
}

const EMOJIS = ['❤️', '🤩', '🥳', '👑', '💯'];

/** Favourite teachers/staff only (multi-select) + emoji row and send at the bottom — students only */
function TodayEventWishCard({ event, favourites, currentUserId, onCompleted }) {
  const [selected, setSelected] = useState(() => new Set());
  const [emojiPick, setEmojiPick] = useState(() => new Set());
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(false);

  const toggleFav = useCallback(
    (uid) => {
      const id = Number(uid);
      if (!Number.isFinite(id) || id === Number(currentUserId)) return;
      setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    },
    [currentUserId]
  );

  const toggleEm = useCallback((em) => {
    setEmojiPick((prev) => {
      const next = new Set(prev);
      next.has(em) ? next.delete(em) : next.add(em);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allowed = (favourites || [])
      .map((f) => Number(f.u_id))
      .filter((id) => Number.isFinite(id) && id !== Number(currentUserId));
    setSelected(new Set(allowed));
  }, [favourites, currentUserId]);

  const send = async () => {
    const ids = [...selected];
    const emojis = [...emojiPick];
    if (ids.length === 0) {
      setErr('Select at least one person above.');
      return;
    }
    if (emojis.length === 0) {
      setErr('Pick at least one emoji below.');
      return;
    }
    const sender_id = Number(currentUserId);
    const event_id = Number(event?.event_id);
    if (!Number.isFinite(sender_id) || !Number.isFinite(event_id)) {
      setErr('Missing user or event.');
      return;
    }
    const emojiJoined = emojis.join('');
    const emojiColons = unifiedToColonShortcodes(emojiJoined).trim();
    const emojiPayload =
      emojiColons.length > 100 ? emojiColons.slice(0, 100) : emojiColons;
    const message = event?.event_name
      ? `Happy ${String(event.event_name).slice(0, 200)}!`
      : 'Event wish';

    setSubmitting(true);
    setErr(null);
    try {
      await api.post('/event/send-bulk-wishes', {
        sender_id,
        event_id,
        receiver_ids: ids,
        emoji: emojiPayload || null,
        message,
      });
      setDone(true);
      onCompleted?.();
    } catch (e) {
      console.error(e.response?.data || e.message);
      if (e.response?.status === 409) {
        setDone(true);
        onCompleted?.();
        return;
      }
      setErr(e.response?.data?.message || e.message || 'Could not send.');
    } finally {
      setSubmitting(false);
    }
  };

  const sendDisabled =
    submitting || selected.size === 0 || emojiPick.size === 0;

  const sendLabel = (() => {
    if (submitting) return 'Sending…';
    if (selected.size === 0) return 'Select people to send wishes';
    if (emojiPick.size === 0) return 'Pick an emoji to send wishes';
    const n = selected.size;
    return `Send wishes to ${n} ${n === 1 ? 'person' : 'people'}`;
  })();

  if (!Number.isFinite(Number(currentUserId))) {
    return (
      <p className="small text-muted mb-0">Sign in to send event wishes.</p>
    );
  }

  if (done) {
    return (
      <div
        className="rounded-3 p-3 mb-2"
        style={{ border: '1px solid #e8e8e8', background: '#fafafa' }}
      >
        <p className="small fw-semibold mb-0" style={{ color: '#07333d' }}>
          Wishes sent for “{event?.event_name || 'event'}”.
        </p>
        <p className="small text-muted mb-0 mt-1">You can’t send again for this event.</p>
      </div>
    );
  }

  const list = Array.isArray(favourites) ? favourites : [];

  return (
    <div
      className="rounded-3 mb-3 d-flex flex-column"
      style={{
        border: '1px solid #f0f0f0',
        background: '#fff',
        overflow: 'hidden',
      }}
    >
      <div className="p-3 pb-2">
        <h6 className="fw-bold mb-1" style={{ color: '#07333d' }}>
          {event?.event_name || 'Today’s event'}
        </h6>
        {event?.description ? (
          <p className="small text-muted mb-3">{event.description}</p>
        ) : null}
        <p className="small mb-3" style={{ color: '#444', lineHeight: 1.45 }}>
          Choose teachers or staff you’ve favourited — students aren’t listed here. Only selected people get your
          wish. One send per event.
        </p>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="small fw-semibold text-muted">Favourite teachers &amp; staff</span>
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-decoration-none"
            style={{ color: '#07333d' }}
            onClick={selectAll}
            disabled={submitting || list.length === 0}
          >
            Select all
          </button>
        </div>
        <div
          className="rounded-3 p-2"
          style={{
            maxHeight: 220,
            overflowY: 'auto',
            border: '1px solid #eee',
            background: '#fafafa',
          }}
        >
          {list.length === 0 ? (
            <p className="small text-muted mb-0">
              No teachers in your favourites — favourite a teacher first (student accounts only).
            </p>
          ) : (
            list.map((f) => {
              const uid = Number(f.u_id);
              const self = uid === Number(currentUserId);
              const on = selected.has(uid);
              return (
                <label
                  key={f.u_id}
                  className="d-flex align-items-center gap-2 py-1 px-1 rounded"
                  style={{ cursor: self ? 'not-allowed' : 'pointer', opacity: self ? 0.45 : 1 }}
                >
                  <input
                    type="checkbox"
                    className="mt-0"
                    checked={on}
                    disabled={submitting || self}
                    onChange={() => toggleFav(uid)}
                  />
                  <img
                    src={f.image || admin}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-circle"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = admin;
                    }}
                  />
                  <span className="small">{f.name || `User ${uid}`}</span>
                </label>
              );
            })
          )}
        </div>
        <p className="small text-muted mt-2 mb-0">{selected.size} selected</p>
      </div>

      <div
        className="px-3 pt-3 pb-3 mt-auto"
        style={{
          borderTop: '1px solid #ececec',
          background: '#fbfbfb',
        }}
      >
        <span className="small fw-semibold text-muted d-block mb-2">Choose your emoji</span>

        <RecommendedEmojiPicker
          text={[event?.event_name, event?.description].filter(Boolean).join(' ')}
          selected={emojiPick}
          submitting={submitting}
          onPick={(_row, glyph) => glyph && toggleEm(glyph)}
          emptyText="Suggested for this event — tap to pick"
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              disabled={submitting}
              onClick={() => toggleEm(em)}
              style={{
                background: emojiPick.has(em) ? '#d9eff4' : '#fff',
                border: emojiPick.has(em) ? '2px solid #07333d' : '1px solid #e0e0e0',
                borderRadius: 10,
                fontSize: '1.35rem',
                padding: '8px 4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {em}
            </button>
          ))}
        </div>

        {err ? <p className="small text-danger mb-2">{err}</p> : null}

        <button
          type="button"
          className="w-100 border-0 rounded-3 fw-bold text-white"
          style={{
            background: '#07333d',
            padding: '14px 16px',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            opacity: sendDisabled ? 0.55 : 1,
            cursor: sendDisabled ? 'not-allowed' : 'pointer',
          }}
          disabled={sendDisabled}
          onClick={send}
        >
          {sendLabel}
        </button>
      </div>
    </div>
  );
}

export default TodayEventWishCard;
