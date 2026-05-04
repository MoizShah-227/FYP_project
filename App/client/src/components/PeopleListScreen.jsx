import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import admin from '../assets/admin.png';
import api from '../../config/axiosConfig.js';

const API_ORIGIN = 'http://localhost:5004';

const KIND_CONFIG = {
  'current-students': {
    title: 'Current Students',
    subtitle: 'Students in your courses',
    fetchUsers: async (userId) => {
      const res = await api.get(`/user/current-students/${userId}`);
      return Array.isArray(res.data?.users) ? res.data.users : [];
    },
  },
  'favourite-students': {
    title: 'Favourite Students',
    subtitle: 'Your favourite students',
    fetchUsers: async (userId) => {
      const res = await api.get(`/user/favourite-students/${userId}`);
      return Array.isArray(res.data?.users) ? res.data.users : [];
    },
  },
};

function resolveAvatarPath(image) {
  if (!image || typeof image !== 'string') return null;
  const t = image.trim();
  if (!t) return null;
  if (t.startsWith('/')) return `${API_ORIGIN}${t}`;
  return `${API_ORIGIN}/uploads/${t}`;
}

export default function PeopleListScreen() {
  const { kind } = useParams();
  const navigate = useNavigate();
  const cfg = KIND_CONFIG[kind];

  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : null;
  const userId = user?.id ?? user?.u_id;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    if (!cfg || userId == null || Number.isNaN(Number(userId))) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const list = await cfg.fetchUsers(Number(userId));
      setRows(list);
    } catch (e) {
      console.error(e.response?.data || e.message);
      setErr(e.response?.data?.message || 'Could not load list.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [cfg, userId]);

  useEffect(() => {
    if (!cfg) {
      navigate('/messages', { replace: true });
      return;
    }
    load();
  }, [cfg, load, navigate]);

  if (!cfg) return null;

  return (
    <div className="min-vh-100 bg-white d-flex flex-column">
      <Navbar />

      <header className="border-bottom bg-white" style={{ borderColor: '#e8e8e8' }}>
        <button
          type="button"
          className="btn border-0 w-100 d-flex align-items-center gap-2 px-3 py-2 text-start rounded-0 bg-white"
          onClick={() => navigate('/messages')}
          aria-label="Back to messages"
        >
          <ArrowLeft size={22} color="#07333d" className="flex-shrink-0" />
          <span className="fw-semibold" style={{ color: '#07333d', fontSize: '1.05rem' }}>
            {cfg.title}
          </span>
        </button>
      </header>

      <main
        className="flex-grow-1 px-2 px-sm-3 py-3 mx-auto w-100"
        style={{ maxWidth: 'min(100%, 560px)' }}
      >
        <p className="small text-muted mb-3 mb-md-4 px-1">{cfg.subtitle}</p>

        {loading ? (
          <p className="small text-muted text-center py-4 mb-0">Loading…</p>
        ) : err ? (
          <p className="small text-danger text-center py-4 mb-0">{err}</p>
        ) : rows.length === 0 ? (
          <p className="small text-muted text-center py-4 mb-0">No one to show yet.</p>
        ) : (
          <ul className="list-unstyled m-0 p-0 d-flex flex-column gap-2 gap-sm-3">
            {rows.map((row) => {
              const src = resolveAvatarPath(row.image) || admin;
              const uid = Number(row.u_id);
              return (
                <li key={row.u_id}>
                  <button
                    type="button"
                    className="w-100 text-start border rounded-3 p-3 d-flex align-items-center gap-3 bg-white"
                    style={{
                      borderColor: '#e0e0e0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
                    <span
                      className="fw-semibold text-truncate"
                      style={{ color: '#111', fontSize: '0.98rem' }}
                    >
                      {row.name || `User ${row.u_id}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
