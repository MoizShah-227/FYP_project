import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SettingsSubHeader from './SettingsSubHeader';
import useTeacherSettingsReady from './useTeacherSettingsReady';
import api from '../../config/axiosConfig.js';
import { ORANGE, saveBtnClass } from './settingsShared';

export default function ChangePasswordSettingsPage() {
  const ready = useTeacherSettingsReady();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newpassword, setNewpassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwOk, setPwOk] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const submitPassword = async (e) => {
    e.preventDefault();
    setPwErr('');
    setPwOk('');
    if (!currentPassword.trim()) {
      setPwErr('Enter your current password.');
      return;
    }
    if (newpassword.length < 4) {
      setPwErr('New password should be at least 4 characters.');
      return;
    }
    if (newpassword !== confirmPw) {
      setPwErr('New passwords do not match.');
      return;
    }
    let user;
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      setPwErr('Not logged in.');
      return;
    }
    const userId = user?.id ?? user?.u_id;
    const regno = user?.regno;
    if (userId == null || !regno) {
      setPwErr('Missing account info; log in again.');
      return;
    }
    setPwLoading(true);
    try {
      await api.post(
        '/user/login',
        { regno, password: currentPassword },
        { withCredentials: true }
      );
    } catch {
      setPwErr('Current password is incorrect.');
      setPwLoading(false);
      return;
    }
    try {
      await api.put(
        '/user/change-password',
        { userId: String(userId), newpassword },
        { withCredentials: true }
      );
      setPwOk('Password updated.');
      setCurrentPassword('');
      setNewpassword('');
      setConfirmPw('');
    } catch (e2) {
      setPwErr(e2.response?.data?.message || e2.message || 'Could not update password.');
    } finally {
      setPwLoading(false);
    }
  };

  if (!ready) {
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
        <SettingsSubHeader title="Change Password" />

        <form onSubmit={submitPassword}>
          {pwErr ? <p className="small text-danger mb-2">{pwErr}</p> : null}
          {pwOk ? <p className="small text-success mb-2">{pwOk}</p> : null}
          <label className="small fw-bold text-dark d-block mb-1">Current Password:</label>
          <input
            type="password"
            className="form-control mb-3 rounded-4 py-2 border-secondary"
            placeholder="Enter your Current password ..."
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <label className="small fw-bold text-dark d-block mb-1">New Password:</label>
          <input
            type="password"
            className="form-control mb-3 rounded-4 py-2 border-secondary"
            placeholder="Enter your new password ..."
            value={newpassword}
            onChange={(e) => setNewpassword(e.target.value)}
            autoComplete="new-password"
          />
          <label className="small fw-bold text-dark d-block mb-1">Confirm Password:</label>
          <input
            type="password"
            className="form-control mb-4 rounded-4 py-2 border-secondary"
            placeholder="Confirm your new password ..."
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="submit"
            className={saveBtnClass}
            style={{ backgroundColor: ORANGE, minWidth: '220px' }}
            disabled={pwLoading}
          >
            {pwLoading ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
