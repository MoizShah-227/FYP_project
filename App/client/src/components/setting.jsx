import React, { useEffect } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { TEAL } from '../settings/settingsShared';

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

/** Teachers only — hub links to dedicated settings routes */
export default function Setting() {
  const navigate = useNavigate();
  const allowed = isTeacherFromStorage();

  useEffect(() => {
    if (!allowed) navigate('/profile', { replace: true });
  }, [allowed, navigate]);

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
        </div>
      </div>
    </div>
  );
}
