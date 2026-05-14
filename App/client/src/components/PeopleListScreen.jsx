import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Ban, Search } from 'lucide-react';
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
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith('/')) return `${API_ORIGIN}${t}`;
  return `${API_ORIGIN}/uploads/${t.replace(/^uploads\//i, '')}`;
}

const initials = (name) =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??';

export default function PeopleListScreen() {
  const { kind } = useParams();
  const navigate = useNavigate();
  const cfg = KIND_CONFIG[kind];

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}') || {};
    } catch {
      return {};
    }
  }, []);
  const userId = user?.id ?? user?.u_id;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [search, setSearch] = useState('');
  const [favIds, setFavIds] = useState(new Set());
  const [blockedIds, setBlockedIds] = useState(new Set());
  const [pendingFav, setPendingFav] = useState(new Set());
  const [pendingBlock, setPendingBlock] = useState(new Set());

  const loadPeople = useCallback(async () => {
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

  const loadFavIds = useCallback(async () => {
    if (userId == null) return;
    try {
      const res = await api.get(`/user/favourite/${userId}`);
      const row = res.data?.[0];
      setFavIds(new Set(Array.isArray(row) ? row.map((r) => Number(r.u_id)) : []));
    } catch (e) {
      console.warn('fav fetch failed:', e.response?.data || e.message);
    }
  }, [userId]);

  const loadBlockedIds = useCallback(async () => {
    if (userId == null) return;
    try {
      const res = await api.get(`/user/blocked/${userId}`);
      const data = res.data;
      const flat = Array.isArray(data?.[0]) ? data[0] : Array.isArray(data) ? data : [];
      setBlockedIds(new Set(flat.map((r) => Number(r.u_id))));
    } catch (e) {
      console.warn('blocked fetch failed:', e.response?.data || e.message);
    }
  }, [userId]);

  useEffect(() => {
    if (!cfg) {
      navigate('/messages', { replace: true });
      return;
    }
    loadPeople();
    loadFavIds();
    loadBlockedIds();
  }, [cfg, loadPeople, loadFavIds, loadBlockedIds, navigate]);

  const toggleFavourite = async (uid) => {
    if (userId == null || pendingFav.has(uid)) return;
    const wasFav = favIds.has(uid);
    setPendingFav((p) => new Set(p).add(uid));
    setFavIds((prev) => {
      const next = new Set(prev);
      if (wasFav) next.delete(uid);
      else next.add(uid);
      return next;
    });
    try {
      const endpoint = wasFav ? '/user/remove' : '/user/favourite';
      await api.post(endpoint, { userid: Number(userId), favid: Number(uid) });
    } catch (e) {
      console.error(e.response?.data || e.message);
      setFavIds((prev) => {
        const next = new Set(prev);
        if (wasFav) next.add(uid);
        else next.delete(uid);
        return next;
      });
      alert(e.response?.data?.message || 'Could not update favourites.');
    } finally {
      setPendingFav((p) => {
        const next = new Set(p);
        next.delete(uid);
        return next;
      });
    }
  };

  const toggleBlock = async (uid, name) => {
    if (userId == null || pendingBlock.has(uid)) return;
    const wasBlocked = blockedIds.has(uid);
    if (!wasBlocked) {
      const ok = window.confirm(`Block ${name || 'this user'}? They won't appear in your messages.`);
      if (!ok) return;
    }
    setPendingBlock((p) => new Set(p).add(uid));
    setBlockedIds((prev) => {
      const next = new Set(prev);
      if (wasBlocked) next.delete(uid);
      else next.add(uid);
      return next;
    });
    try {
      const endpoint = wasBlocked ? '/user/unblock' : '/user/block';
      await api.post(endpoint, { userid: Number(userId), blockId: Number(uid) });
    } catch (e) {
      console.error(e.response?.data || e.message);
      setBlockedIds((prev) => {
        const next = new Set(prev);
        if (wasBlocked) next.add(uid);
        else next.delete(uid);
        return next;
      });
      alert(e.response?.data?.message || 'Could not update block status.');
    } finally {
      setPendingBlock((p) => {
        const next = new Set(p);
        next.delete(uid);
        return next;
      });
    }
  };

  const filtered = (rows || []).filter((r) =>
    String(r.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const avatarColors = [
    { bg: '#c9e4f5', text: '#1a6a9a' },
    { bg: '#d4f5e0', text: '#1a7a3a' },
    { bg: '#f5e4c9', text: '#9a6a1a' },
    { bg: '#e4c9f5', text: '#6a1a9a' },
    { bg: '#f5c9d4', text: '#9a1a3a' },
    { bg: '#c9f5f0', text: '#1a7a6a' },
  ];

  if (!cfg) return null;

  return (
    <div className="min-vh-100 bg-white">
      <Navbar />

      <div className="container py-3">
        <div className="d-flex align-items-center mb-3 mb-sm-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn border-0 p-0 me-2"
            aria-label="Back"
          >
            <ArrowLeft size={20} color="#07333d" />
          </button>
          <h5
            className="m-0 fw-bold text-truncate"
            style={{ color: '#07333d', fontSize: 'clamp(1rem, 3.5vw, 1.25rem)' }}
          >
            {cfg.title}
          </h5>
        </div>

        <div
          className="d-flex align-items-center mb-4 px-3"
          style={{
            border: '1px solid #ddd',
            borderRadius: '10px',
            backgroundColor: '#fff',
            height: '44px',
          }}
        >
          <Search size={18} color="#aaa" className="me-2" />
          <input
            type="text"
            placeholder=""
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '14px',
              color: '#333',
              backgroundColor: 'transparent',
              minWidth: 0,
            }}
          />
        </div>

        <div
          className="d-flex justify-content-between align-items-center px-2 mb-1"
          style={{ fontSize: '13px', color: '#555', fontWeight: '500' }}
        >
          <span style={{ flex: 1 }}>Name</span>
          <span style={{ minWidth: '80px', textAlign: 'right' }}>Favourite</span>
        </div>

        {loading ? (
          <div className="text-center py-5" style={{ color: '#aaa', fontSize: 14 }}>
            Loading...
          </div>
        ) : err ? (
          <div className="text-center py-5 text-danger" style={{ fontSize: 14 }}>
            {err}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5" style={{ color: '#aaa', fontSize: 14 }}>
            No people found
          </div>
        ) : (
          filtered.map((row, i) => {
            const uid = Number(row.u_id);
            const isFav = favIds.has(uid);
            const isBlocked = blockedIds.has(uid);
            const src = resolveAvatarPath(row.image);
            const { bg, text } = avatarColors[i % avatarColors.length];

            return (
              <div
                key={uid}
                className="d-flex align-items-center justify-content-between px-2 py-2"
                style={{
                  backgroundColor: i % 2 === 0 ? '#f0f0f0' : '#fff',
                  borderRadius: '8px',
                  marginBottom: '2px',
                  cursor: 'pointer',
                  opacity: isBlocked ? 0.55 : 1,
                }}
                onClick={() => navigate(`/messages/thread/${uid}`)}
              >
                <div
                  className="d-flex align-items-center gap-2"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  {src ? (
                    <img
                      src={src}
                      alt={row.name}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid #ccc',
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = admin;
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: bg,
                        color: text,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {initials(row.name)}
                    </div>
                  )}
                  <span
                    className="text-truncate"
                    style={{
                      fontSize: '13px',
                      color: '#222',
                      fontWeight: 500,
                      minWidth: 0,
                    }}
                  >
                    {row.name}
                  </span>
                </div>

                <div
                  className="d-flex align-items-center flex-shrink-0"
                  style={{
                    gap: '10px',
                    minWidth: '80px',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    type="button"
                    aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavourite(uid);
                    }}
                    disabled={pendingFav.has(uid)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: pendingFav.has(uid) ? 'wait' : 'pointer',
                      lineHeight: 0,
                    }}
                  >
                    <Heart
                      size={20}
                      color={isFav ? '#e53935' : '#aaa'}
                      fill={isFav ? '#e53935' : 'none'}
                    />
                  </button>

                  <button
                    type="button"
                    aria-label={isBlocked ? 'Unblock user' : 'Block user'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBlock(uid, row.name);
                    }}
                    disabled={pendingBlock.has(uid)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: pendingBlock.has(uid) ? 'wait' : 'pointer',
                      lineHeight: 0,
                    }}
                    title={isBlocked ? 'Unblock' : 'Block'}
                  >
                    <Ban size={20} color={isBlocked ? '#e53935' : '#aaa'} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
