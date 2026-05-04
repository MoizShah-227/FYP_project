import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import admin from '../assets/admin.png';
import api from '../../config/axiosConfig.js';

const API_ORIGIN = 'http://localhost:5004';

function resolveAvatarPath(image) {
  if (!image || typeof image !== 'string') return null;
  const t = image.trim();
  if (!t) return null;
  if (t.startsWith('/')) return `${API_ORIGIN}${t}`;
  return `${API_ORIGIN}/uploads/${t}`;
}

function formatMsgTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return '';
  }
}

/** Colon shortcodes stored in DB → single glyph (extend as needed) */
const EMOJI_SHORTCODE = {
  ':heart:': '❤️',
  ':red_heart:': '❤️',
  ':smile:': '😊',
  ':smiley:': '😃',
  ':thumbsup:': '👍',
  ':pray:': '🙏',
  ':fire:': '🔥',
  ':star:': '⭐',
  ':cake:': '🎂',
  ':gift:': '🎁',
  ':balloon:': '🎈',
};

function resolveEmojiDisplay(raw) {
  if (raw == null || typeof raw !== 'string') return '';
  const t = raw.trim();
  if (!t) return '';
  const mapped = EMOJI_SHORTCODE[t.toLowerCase()];
  return mapped ?? t;
}

function messageBubbleBody(m) {
  const emojiRaw = typeof m.emoji === 'string' ? m.emoji.trim() : '';
  const hasEmoji = emojiRaw.length > 0;
  const msg = typeof m.message === 'string' ? m.message.trim() : '';
  if (hasEmoji) {
    return { mode: 'emoji', emoji: resolveEmojiDisplay(emojiRaw) };
  }
  if (msg) {
    return { mode: 'text', text: msg };
  }
  return { mode: 'empty' };
}

export default function MessageThread() {
  const { peerId } = useParams();
  const navigate = useNavigate();
  const peerNum = parseInt(String(peerId), 10);
  const bottomRef = useRef(null);

  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : null;
  const myId = Number(user?.id ?? user?.u_id);

  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!Number.isFinite(myId) || !Number.isFinite(peerNum) || myId === peerNum) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/message/thread/${peerNum}`, {
        params: { viewer_id: myId },
      });
      setPeer(res.data?.peer || null);
      setMessages(Array.isArray(res.data?.messages) ? res.data.messages : []);
    } catch (e) {
      console.error(e.response?.data || e.message);
      setPeer(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [myId, peerNum]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, loading]);

  const peerName = peer?.name || `User ${peerNum}`;
  const peerImg = resolveAvatarPath(peer?.image) || admin;

  return (
    <div className="min-vh-100 bg-white d-flex flex-column">
      <Navbar />

      <div
        className="flex-shrink-0 px-2 px-sm-3 pt-2 pb-3 mx-auto w-100 bg-white"
        style={{ maxWidth: 'min(100%, 560px)' }}
      >
        <button
          type="button"
          className="btn border-0 p-0 d-flex align-items-center mb-2"
          onClick={() => navigate('/messages')}
          aria-label="Back to inbox"
        >
          <ArrowLeft size={22} color="#07333d" />
        </button>
        <div
          className="rounded-3 p-3 d-flex align-items-center gap-3 bg-white w-100"
          style={{
            boxShadow: '0 2px 12px rgba(7, 51, 61, 0.08)',
          }}
        >
          <img
            src={peerImg}
            alt=""
            className="rounded-circle flex-shrink-0"
            style={{
              width: 'clamp(48px, 12vw, 56px)',
              height: 'clamp(48px, 12vw, 56px)',
              objectFit: 'cover',
            }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = admin;
            }}
          />
          <span
            className="fw-semibold text-truncate flex-grow-1 min-w-0"
            style={{ color: '#07333d', fontSize: '0.98rem' }}
          >
            {peerName}
          </span>
        </div>
      </div>

      <div
        className="flex-grow-1 overflow-auto px-2 px-sm-3 py-3 mx-auto w-100"
        style={{
          maxWidth: 'min(100%, 560px)',
          background: '#f6f7f8',
          minHeight: 0,
        }}
      >
        {loading ? (
          <p className="small text-muted text-center py-4">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="small text-muted text-center py-4 mb-0">No messages yet.</p>
        ) : (
          <div className="d-flex flex-column gap-2">
            {messages.map((m) => {
              const mine = Number(m.sender_id) === myId;
              const body = messageBubbleBody(m);
              return (
                <div
                  key={m.M_id}
                  className={`d-flex ${mine ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div
                    className="rounded-3 px-3 py-2"
                    style={{
                      maxWidth: 'min(85%, 320px)',
                      background: mine ? '#07333d' : '#fff',
                      color: mine ? '#fff' : '#222',
                      boxShadow: mine ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                      fontSize: '0.9rem',
                      lineHeight: 1.45,
                      wordBreak: 'break-word',
                    }}
                  >
                    {body.mode === 'emoji' ? (
                      <span className="d-block text-center" style={{ fontSize: '1.75rem', lineHeight: 1.2 }}>
                        {body.emoji}
                      </span>
                    ) : body.mode === 'text' ? (
                      <span className="d-block">{body.text}</span>
                    ) : null}
                    <span
                      className="d-block mt-1"
                      style={{
                        fontSize: '0.65rem',
                        opacity: mine ? 0.75 : 0.55,
                      }}
                    >
                      {formatMsgTime(m.sent_at)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
