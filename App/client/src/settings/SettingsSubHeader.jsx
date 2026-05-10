import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TEAL } from './settingsShared';

export default function SettingsSubHeader({ title }) {
  const navigate = useNavigate();
  return (
    <div className="d-flex align-items-center mb-3">
      <button
        type="button"
        className="btn border-0 p-0 me-2"
        onClick={() => navigate('/settings')}
        aria-label="Back to settings"
      >
        <ArrowLeft size={22} color={TEAL} />
      </button>
      <span className="fw-bold" style={{ color: TEAL, fontSize: '16px' }}>
        {title}
      </span>
    </div>
  );
}
