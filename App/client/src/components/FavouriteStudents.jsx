import React, { useState, useEffect } from 'react';
import { Search, Heart, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmojiConvertor from 'emoji-js';
import Navbar from './Navbar';
import api from '../../config/axiosConfig';
import RecommendedEmojiPicker from './RecommendedEmojiPicker';

const emojiStore = new EmojiConvertor();
emojiStore.colons_mode = true;
emojiStore.replace_mode = 'unified';
const unifiedToColons = (s) => emojiStore.replace_unified(String(s || ''));

const FavouriteStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [unfavourited, setUnfavourited] = useState(new Set()); // ✅ local toggle state
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeStudent, setActiveStudent] = useState(null); // who we're messaging

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    fetchFavouriteStudents();
  }, []);

  const fetchFavouriteStudents = async () => {
    try {
      const res = await api.get(`/user/favourite/${user.id}`);
      setStudents(res.data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavourite = async (studentId) => {
    // ✅ toggle locally — no isFavourite field needed
    setUnfavourited(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
    try {
      await api.post(`/user/remove`,{
        userid: user.id,
        favid: studentId
      });
      await fetchFavouriteStudents(); 
    } catch (err) {
      console.error(err);
      // rollback on error
      setUnfavourited(prev => {
        const next = new Set(prev);
        if (next.has(studentId)) next.delete(studentId);
        else next.add(studentId);
        return next;
      });
    }
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) =>
    name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

  const avatarColors = [
    { bg: '#c9e4f5', text: '#1a6a9a' },
    { bg: '#d4f5e0', text: '#1a7a3a' },
    { bg: '#f5e4c9', text: '#9a6a1a' },
    { bg: '#e4c9f5', text: '#6a1a9a' },
    { bg: '#f5c9d4', text: '#9a1a3a' },
    { bg: '#c9f5f0', text: '#1a7a6a' },
  ];

  return (
    <div className="min-vh-100 bg-white">
      <Navbar />

      <div className="container py-3">

        {/* Back header */}
        <div className="d-flex align-items-center mb-4">
          <button onClick={() => navigate(-1)} className="btn border-0 p-0 me-3">
            <ArrowLeft size={24} color="#07333d" />
          </button>
          <h4 className="m-0 fw-bold" style={{ color: '#07333d' }}>Favourite student</h4>
        </div>

        {/* Search */}
        <div
          className="d-flex align-items-center gap-2 px-3 mb-3"
          style={{ border: '1px solid #ddd', borderRadius: 10, height: 42, background: '#fff' }}
        >
          <Search size={15} color="#aaa" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent',
              fontSize: 14, color: '#333', width: '100%' }}
          />
        </div>

        {/* Column headers */}
        <div className="d-flex justify-content-between px-2 mb-1"
          style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>
          <span>Name</span>
          <span>Favourite</span>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-5" style={{ color: '#aaa', fontSize: 14 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5" style={{ color: '#aaa', fontSize: 14 }}>No students found</div>
        ) : (
          filtered.map((student, i) => {
            const { bg, text } = avatarColors[i % avatarColors.length];
            const isUnfavourited = unfavourited.has(student.u_id);
            return (
              <div
                key={student.S_id}
                className="d-flex align-items-center justify-content-between px-2"
                style={{
                  background: i % 2 === 0 ? '#f5f5f5' : '#fff',
                  paddingTop: 9, paddingBottom: 9,
                  borderBottom: '0.5px solid #f0f0f0',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
                onClick={() => setActiveStudent(student)}
              >
                <div className="d-flex align-items-center gap-2">
                  {student.avatar ? (
                    <img
                      src={`http://localhost:5004${student.avatar}`}
                      alt={student.name}
                      style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: bg, color: text, flexShrink: 0,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 11, fontWeight: 600,
                    }}>
                      {initials(student.name)}
                    </div>
                  )}
                  <span style={{ fontSize: 14, color: '#07333d' }}>{student.name}</span>
                </div>

                {/* ✅ red by default, gray if toggled off */}
                <Heart
                  size={20}
                  fill={isUnfavourited ? 'none' : '#e74c3c'}
                  color={isUnfavourited ? '#ddd' : '#e74c3c'}
                  style={{ cursor: 'pointer', flexShrink: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavourite(student.u_id);
                  }}
                />
              </div>
            );
          })
        )}
      </div>

      {activeStudent ? (
        <SendMessageModal
          student={activeStudent}
          senderId={user.id}
          onClose={() => setActiveStudent(null)}
        />
      ) : null}
    </div>
  );
};

const SendMessageModal = ({ student, senderId, onClose }) => {
  const [message, setMessage] = useState('');
  const [emojis, setEmojis] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

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
    if (!body) {
      setErr('Type a message first.');
      return;
    }
    if (senderId == null || student?.u_id == null) {
      setErr('Missing sender/receiver.');
      return;
    }
    setSending(true);
    try {
      const colons = unifiedToColons([...emojis].join('')).trim().slice(0, 100);
      await api.post('/message/send-message', {
        sender_id: senderId,
        receiver_id: student.u_id,
        message: body,
        emoji: colons || null,
        birthday_wish: false,
      });
      onClose();
    } catch (e) {
      console.error(e.response?.data || e.message);
      setErr(e.response?.data?.message || 'Could not send. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 3000, backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg"
        style={{ maxWidth: 380, width: '92%', padding: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h5 className="fw-bold mb-0" style={{ color: '#07333d' }}>
              Message {student.name}
            </h5>
            <small className="text-muted">Type something nice</small>
          </div>
          <button
            type="button"
            className="btn p-0 border-0"
            style={{ color: '#aaa' }}
            onClick={onClose}
            disabled={sending}
          >
            <X size={20} />
          </button>
        </div>

        <textarea
          className="w-100 rounded-3 mt-2"
          rows={4}
          placeholder={`Write to ${student.name}...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
          style={{
            border: '1.5px solid #e0e0e0',
            padding: '10px 12px',
            fontSize: '0.9rem',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            color: '#333',
          }}
        />

        <div className="mt-3">
          <RecommendedEmojiPicker
            text={message || `message ${student.name || ''}`}
            selected={emojis}
            submitting={sending}
            onPick={(_row, glyph) => insertEmoji(glyph)}
            emptyText="Suggested emojis — tap to insert"
          />
        </div>

        {err ? <p className="small text-danger mt-2 mb-2">{err}</p> : null}

        <button
          type="button"
          className="w-100 border-0 rounded-3 fw-bold mt-2"
          style={{
            background: '#07333d',
            color: 'white',
            padding: '12px',
            fontSize: '0.98rem',
            cursor: sending ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: sending ? 0.75 : 1,
          }}
          disabled={sending}
          onClick={handleSend}
        >
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </div>
  );
};

export default FavouriteStudents;