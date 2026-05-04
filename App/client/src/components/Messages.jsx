import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

function formatTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const now = new Date();
    const sameDay =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (sameDay) {
      return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function previewText(row) {
  const msg = typeof row.last_message === 'string' ? row.last_message.trim() : '';
  if (msg) return msg.length > 48 ? `${msg.slice(0, 48)}…` : msg;
  if (row.last_emoji) return 'Emoji';
  return 'Tap to open chat';
}

function ContactList({ rows, navigate }) {
  if (rows.length === 0) return null;
  return (
    <ul className="list-unstyled m-0 p-0 d-flex flex-column gap-2 gap-sm-3">
      {rows.map((row) => {
        const src = resolveAvatarPath(row.image) || admin;
        const uid = Number(row.u_id);
        return (
          <li key={row.u_id}>
            <button
              type="button"
              className="w-100 text-start border-0 rounded-3 p-3 d-flex align-items-center gap-3 bg-white"
              style={{
                boxShadow: '0 2px 12px rgba(7, 51, 61, 0.08)',
              }}
              onClick={() => navigate(`/messages/thread/${uid}`)}
            >
              <img
                src={src}
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
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex justify-content-between align-items-baseline gap-2">
                  <span
                    className="fw-semibold text-truncate d-block"
                    style={{ color: '#07333d', fontSize: '0.98rem' }}
                  >
                    {row.name || `User ${row.u_id}`}
                  </span>
                  <span className="small text-muted flex-shrink-0" style={{ fontSize: '0.72rem' }}>
                    {formatTime(row.last_sent_at)}
                  </span>
                </div>
                <p
                  className="small text-muted mb-0 text-truncate mt-1"
                  style={{ fontSize: '0.82rem', lineHeight: 1.35 }}
                >
                  {previewText(row)}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function Messages() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : null;
  const userId = user?.id ?? user?.u_id;
  const role = String(user?.type ?? '').trim().toLowerCase();
  const isStudent = role === 'student';
  const isFaculty = role === 'teacher' || role === 'admin';

  const load = useCallback(async () => {
    if (userId == null || Number.isNaN(Number(userId))) {
      setContacts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await api.get(`/message/mixed-list/${userId}`);
      setContacts(Array.isArray(res.data?.contacts) ? res.data.contacts : []);
    } catch (e) {
      console.error(e.response?.data || e.message);
      setErr(e.response?.data?.message || 'Could not load messages.');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const emptyList = !loading && contacts.length === 0;

  return (
    <div className="min-vh-100 bg-white d-flex flex-column">
      <Navbar />

      <header className="border-bottom bg-white" style={{ borderColor: '#e8e8e8' }}>
        <button
          type="button"
          className="btn border-0 w-100 d-flex align-items-center gap-2 px-3 py-2 text-start rounded-0 bg-white"
          onClick={() => navigate('/feed')}
          aria-label="Back to home"
        >
          <ArrowLeft size={22} color="#07333d" className="flex-shrink-0" />
          <span className="fw-semibold" style={{ color: '#07333d', fontSize: '1.05rem' }}>
            Message
          </span>
        </button>
      </header>

      <main
        className="flex-grow-1 px-2 px-sm-3 py-4 mx-auto w-100"
        style={{ maxWidth: 'min(100%, 560px)' }}
      >
        {loading ? (
          <p className="small text-muted text-center py-4 mb-0">Loading…</p>
        ) : err ? (
          <p className="small text-danger text-center py-4 mb-0">{err}</p>
        ) : emptyList ? (
          <div className="text-center py-5 px-3">
            <p className="fw-semibold mb-1" style={{ color: '#07333d' }}>
              Koi message nahi
            </p>
            <p className="small text-muted mb-3">Jab chat hogi, yahan mix list show hogi.</p>
            <button
              type="button"
              className="btn btn-sm fw-semibold rounded-pill px-4"
              style={{ background: '#07333d', color: '#fff' }}
              onClick={() =>
                navigate(
                  isStudent
                    ? '/current-teachers'
                    : isFaculty
                      ? '/people/current-students'
                      : '/favourite-students'
                )
              }
            >
              Find people
            </button>
          </div>
        ) : (
          <ContactList rows={contacts} navigate={navigate} />
        )}
      </main>
    </div>
  );
}
