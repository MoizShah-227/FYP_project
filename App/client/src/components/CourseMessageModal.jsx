import React, { useState } from 'react';
import { X, ArrowLeft, Plus } from 'lucide-react';
import EmojiConvertor from 'emoji-js';
import api from '../../config/axiosConfig.js';
import RecommendedEmojiPicker from './RecommendedEmojiPicker';

const emojiStore = new EmojiConvertor();
emojiStore.colons_mode = true;
emojiStore.replace_mode = 'unified';
const unifiedToColons = (s) => emojiStore.replace_unified(String(s || ''));

export default function CourseMessageModal({
  isOpen,
  onClose,
  onBack,
  teacherId,
  selectedCourseIds = [],
  selectedCourseNames = [],
}) {
  const [message, setMessage] = useState('');
  const [emojis, setEmojis] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  if (!isOpen) return null;

  const insertEmoji = (glyph) => {
    if (!glyph) return;
    setMessage((prev) => `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}${glyph}`);
    setEmojis((prev) => {
      const next = new Set(prev);
      next.add(glyph);
      return next;
    });
  };

  const handleSend = async () => {
    setErr('');
    const body = message.trim();
    const tid = Number(teacherId);
    if (!Number.isFinite(tid)) return setErr('Teacher not found.');
    if (!body) return setErr('Please enter a message.');
    if (!Array.isArray(selectedCourseIds) || selectedCourseIds.length === 0) {
      return setErr('No courses selected.');
    }

    setSending(true);
    try {
      const colons = unifiedToColons([...emojis].join('')).trim().slice(0, 100);
      const res = await api.post('/education/send-courses', {
        teacherId: tid,
        courseId: selectedCourseIds,
        messageText: body,
        emoji: colons || null,
        checkEmail: false,
      });
      const count = Number(res.data?.totalStudents || 0);
      alert(`Message sent to ${count} student${count === 1 ? '' : 's'}.`);
      setMessage('');
      setEmojis(new Set());
      onClose();
    } catch (e) {
      console.error(e.response?.data || e.message);
      setErr(e.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const suggestionText = `${selectedCourseNames.join(' ')} ${message}`.trim();

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white mx-3"
        style={{ maxWidth: 400, width: '100%', borderRadius: 20, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{ borderBottom: '1px solid #f0f0f0' }}
        >
          <span style={{ fontSize: 17, fontWeight: 600, color: '#07333d' }}>Message</span>
          <button
            className="btn p-0 border-0 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 30, height: 30, background: '#f5f5f5' }}
            onClick={onClose}
            disabled={sending}
          >
            <X size={15} color="#888" />
          </button>
        </div>

        <div className="px-4 pt-3 pb-4">
          <button
            className="btn p-0 border-0 d-flex align-items-center gap-1 mb-3"
            style={{ color: '#888', fontSize: 14 }}
            onClick={onBack}
            disabled={sending}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <p className="mb-3 small text-muted" style={{ fontWeight: 500 }}>
            Sending to students of{' '}
            <strong>
              {selectedCourseNames.length > 0
                ? selectedCourseNames.join(', ')
                : `${selectedCourseIds.length} course(s)`}
            </strong>
          </p>

          <label className="small fw-bold mb-2">Message:</label>
          <div className="position-relative mb-3">
            <textarea
              className="form-control border shadow-sm"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              disabled={sending}
              style={{ borderRadius: 12, resize: 'none', border: '1px solid #eee' }}
            />
            <div
              className="position-absolute start-0 bottom-0 m-3 text-muted"
              style={{ pointerEvents: 'none' }}
            >
              <Plus size={20} />
            </div>
          </div>

          <RecommendedEmojiPicker
            text={suggestionText}
            selected={emojis}
            submitting={sending}
            onPick={(_row, glyph) => insertEmoji(glyph)}
            emptyText="Suggested emojis — tap to insert"
          />

          {err ? <p className="small text-danger mb-2">{err}</p> : null}

          <button
            className="btn w-100 py-3 text-white fw-bold shadow-sm"
            style={{
              backgroundColor: '#ffa02e',
              borderRadius: 12,
              opacity: sending ? 0.75 : 1,
              cursor: sending ? 'not-allowed' : 'pointer',
            }}
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
}
