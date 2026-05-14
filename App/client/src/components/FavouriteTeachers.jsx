import React, { useEffect, useState } from 'react';
import { ArrowLeft, Search, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../config/axiosConfig';
import admin from '../assets/admin.png';

const API_ORIGIN = 'http://localhost:5004';

/** Resolves any of: full URL | '/uploads/...' | 'profile/x.jpg' | 'x.jpg' → absolute URL. */
function resolveUserImage(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/')) return `${API_ORIGIN}${s}`;
  return `${API_ORIGIN}/uploads/${s.replace(/^uploads\//i, '')}`;
}

function FavouriteTeachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [favIds, setFavIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    targetId: null,
    targetName: '',
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}') || {};
  const userId = user.id ?? user.u_id;

  useEffect(() => {
    if (userId == null || Number.isNaN(Number(userId))) {
      setLoading(false);
      return;
    }
    fetchTeachers();
    fetchFavourite();
  }, [refresh, userId]);

  const fetchTeachers = async () => {
    if (userId == null || Number.isNaN(Number(userId))) {
      setTeachers([]);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/user/favourite-teachers-list/${userId}`, {
        withCredentials: true,
      });
      setTeachers(Array.isArray(res.data?.users) ? res.data.users : []);
    } catch (error) {
      console.error('Failed to fetch favourite teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavourite = async () => {
    if (userId == null || Number.isNaN(Number(userId))) return;
    try {
      const res = await api.get(`/user/favourite/${userId}`);
      const row = res.data?.[0];
      setFavIds(Array.isArray(row) ? row.map((item) => item.u_id) : []);
    } catch (error) {
      console.error('Failed to fetch favourite:', error);
    }
  };

  const toggleFavourite = async (targetId) => {
    const isFav = favIds.includes(targetId);
    try {
      if (isFav) {
        await api.post(`/user/remove`, { userid: userId, favid: targetId });
        setFavIds(favIds.filter((id) => id !== targetId));
      } else {
        await api.post(`/user/favourite`, { userid: userId, favid: targetId });
        setFavIds([...favIds, targetId]);
      }
      setRefresh((p) => !p);
    } catch (error) {
      console.error('Failed to toggle favourite:', error);
    }
  };

  const handleConfirm = () => {
    if (confirmModal.targetId != null) {
      toggleFavourite(confirmModal.targetId);
    }
    setConfirmModal({ show: false, targetId: null, targetName: '' });
  };

  const handleCancel = () => {
    setConfirmModal({ show: false, targetId: null, targetName: '' });
  };

  const filtered = teachers.filter((t) =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-vh-100 bg-white">
        <Navbar />
        <p className="text-center mt-5">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-white">
      <Navbar />

      {confirmModal.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '28px 24px',
              width: '300px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <h6 className="fw-bold mb-2" style={{ color: '#07333d' }}>
              Confirmation
            </h6>
            <p style={{ fontSize: '14px', color: '#333', marginBottom: '24px' }}>
              Do you want to{' '}
              {favIds.includes(confirmModal.targetId)
                ? 'remove from favourites'
                : 'add to favourites'}{' '}
              <strong>{confirmModal.targetName}</strong>?
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  backgroundColor: '#07333d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 28px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                }}
              >
                No
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  backgroundColor: '#f4a130',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 28px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container py-3">
        <div className="d-flex align-items-center mb-4">
          <button type="button" onClick={() => navigate(-1)} className="btn border-0 p-0 me-2">
            <ArrowLeft size={20} color="#07333d" />
          </button>
          <h5 className="m-0 fw-bold" style={{ color: '#07333d' }}>
            Favourite Teachers
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
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '14px',
              color: '#333',
              backgroundColor: 'transparent',
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

        <div>
          {filtered.length === 0 ? (
            <p className="text-center text-muted mt-4" style={{ fontSize: '14px' }}>
              No favourite teachers yet
            </p>
          ) : (
            filtered.map((row, index) => (
              <div
                key={row.u_id}
                className="d-flex align-items-center justify-content-between px-2 py-2"
                style={{
                  backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#fff',
                  borderRadius: '8px',
                  marginBottom: '2px',
                }}
              >
                <div className="d-flex align-items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                  <img
                    src={resolveUserImage(row.image) || admin}
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
                      if (e.currentTarget.src !== admin) {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = admin;
                      }
                    }}
                  />
                  <span className="text-truncate" style={{ fontSize: '13px', color: '#222', fontWeight: '500', minWidth: 0 }}>
                    {row.name}
                  </span>
                </div>

                <div
                  className="d-flex align-items-center"
                  style={{ minWidth: '80px', justifyContent: 'flex-end' }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmModal({
                        show: true,
                        targetId: row.u_id,
                        targetName: row.name,
                      })
                    }
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <Heart
                      size={20}
                      color={favIds.includes(row.u_id) ? '#e53935' : '#aaa'}
                      fill={favIds.includes(row.u_id) ? '#e53935' : 'none'}
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FavouriteTeachers;
