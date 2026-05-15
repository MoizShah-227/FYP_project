import React, { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { TEAL } from '../settings/settingsShared';
import api from '../../config/axiosConfig.js';

function isTeacherFromStorage() {
  try {
    const raw = localStorage.getItem('user');
    const u = raw ? JSON.parse(raw) : null;
    const role = String(u?.type ?? '').trim().toLowerCase();
    return !!(u && role === 'teacher');
  } catch {
    return false;
  }
}

const cardStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  background: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  padding: '14px 16px',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  fontFamily: 'inherit',
  textAlign: 'left',
};

function SettingsRow({ title, subtitle, onClick }) {
  return (
    <button type="button" style={cardStyle} onClick={onClick}>
      <span className="text-start">
        <span className="d-block fw-semibold" style={{ color: '#111', fontSize: '15px' }}>
          {title}
        </span>
        <span className="d-block small text-muted mt-1" style={{ fontSize: '13px' }}>
          {subtitle}
        </span>
      </span>
      <ChevronRight size={20} color="#aaa" className="flex-shrink-0 ms-2" />
    </button>
  );
}

function SettingsToggleRow({ title, subtitle, checked, disabled, onToggle }) {
  return (
    <div
      style={{ ...cardStyle, cursor: disabled ? 'wait' : 'pointer' }}
      onClick={() => !disabled && onToggle?.(!checked)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          onToggle?.(!checked);
        }
      }}
    >
      <span className="text-start">
        <span className="d-block fw-semibold" style={{ color: '#111', fontSize: '15px' }}>
          {title}
        </span>
        <span className="d-block small text-muted mt-1" style={{ fontSize: '13px' }}>
          {subtitle}
        </span>
      </span>
      <span
        aria-hidden
        style={{
          width: 42,
          height: 24,
          background: checked ? TEAL : '#ccc',
          borderRadius: 12,
          position: 'relative',
          flexShrink: 0,
          transition: 'background 0.15s',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 20 : 2,
            width: 20,
            height: 20,
            background: '#fff',
            borderRadius: '50%',
            transition: 'left 0.15s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          }}
        />
      </span>
    </div>
  );
}

function getSessionUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getUserId() {
  const u = getSessionUser();
  return u?.id ?? u?.u_id ?? null;
}

function getUserGender() {
  const u = getSessionUser();
  return u?.gender ?? null;
}

/** Teachers only — hub links to dedicated settings routes */
export default function Setting() {
  const navigate = useNavigate();
  const allowed = isTeacherFromStorage();
  const userId = getUserId();

  const [blockOpposite, setBlockOpposite] = useState(false);
  const [savingBlockOG, setSavingBlockOG] = useState(false);

  useEffect(() => {
    if (!allowed) navigate('/profile', { replace: true });
  }, [allowed, navigate]);

  useEffect(() => {
    if (!allowed || userId == null) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/settings/preferences/${userId}`);
        if (!cancelled) setBlockOpposite(!!res.data?.block_opposite_gender);
      } catch (e) {
        console.warn('preferences fetch failed:', e.response?.data || e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allowed, userId]);

  const toggleBlockOpposite = async (next) => {
    if (userId == null || savingBlockOG) return;
    const prev = blockOpposite;
    setBlockOpposite(next);
    setSavingBlockOG(true);
    try {
      const gender = getUserGender();
      if (next) {
        await api.post(
          '/user/block-opposite-gender',
          { userId: Number(userId), gender },
          { withCredentials: true }
        );
      } else {
        await api.post(
          '/user/unblock-opposite-gender',
          { userId: Number(userId), gender },
          { withCredentials: true }
        );
      }
      await api.put('/settings/preferences', {
        userId: Number(userId),
        block_opposite_gender: next,
      });
    } catch (e) {
      console.error(e.response?.data || e.message);
      setBlockOpposite(prev);
      alert(e.response?.data?.message || 'Could not save setting. Try again.');
    } finally {
      setSavingBlockOG(false);
    }
  };

  if (!allowed) {
    return (
      <div className="min-vh-100 bg-white">
        <Navbar />
        <p className="text-center mt-5 text-muted small">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-white">
      <Navbar />
      <div className="container py-3 px-3" style={{ maxWidth: '520px' }}>
        <div className="d-flex align-items-center mb-4">
          <button type="button" onClick={() => navigate('/profile')} className="btn border-0 p-0 me-3">
            <ArrowLeft size={24} color={TEAL} />
          </button>
          <h4 className="m-0 fw-bold" style={{ color: TEAL }}>
            Settings
          </h4>
        </div>

        <div className="d-flex flex-column gap-3">
          <SettingsRow
            title="Notification"
            subtitle="Mute time setting"
            onClick={() => navigate('/settings/notifications')}
          />
          <SettingsRow
            title="Private Account"
            subtitle="Private your account"
            onClick={() => navigate('/settings/private-account')}
          />
          <SettingsRow
            title="Change Password"
            subtitle="Change your password"
            onClick={() => navigate('/settings/change-password')}
          />
          <SettingsToggleRow
            title="Block Opposite Gender"
            subtitle="Hide posts, messages and reminders from the other gender"
            checked={blockOpposite}
            disabled={savingBlockOG}
            onToggle={toggleBlockOpposite}
          />
        </div>
      </div>
    </div>
  );
}
