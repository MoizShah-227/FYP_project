import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import SettingsSubHeader from './SettingsSubHeader';
import useTeacherSettingsReady from './useTeacherSettingsReady';
import api from '../../config/axiosConfig.js';
import {
  ORANGE,
  MUTE_TIMES_KEY,
  readMuteTimes,
  saveBtnClass,
  getSessionUserId,
  timeToInputValue,
} from './settingsShared';

export default function MuteTimeSettingsPage() {
  const ready = useTeacherSettingsReady();
  const [muteStart, setMuteStart] = useState(() => readMuteTimes().start);
  const [muteEnd, setMuteEnd] = useState(() => readMuteTimes().end);
  const [muteSavedHint, setMuteSavedHint] = useState(false);
  const [loadErr, setLoadErr] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const fallback = readMuteTimes();

    async function load() {
      setLoadErr('');
      const userId = getSessionUserId();
      if (userId == null) {
        if (!cancelled) {
          setMuteStart(fallback.start);
          setMuteEnd(fallback.end);
          setLoadErr('Not logged in.');
        }
        return;
      }
      try {
        const res = await api.get(`/settings/preferences/${userId}`, { withCredentials: true });
        const d = res.data;
        if (!cancelled) {
          setMuteStart(timeToInputValue(d.start_time || '23:00:00'));
          setMuteEnd(timeToInputValue(d.end_time || '08:30:00'));
        }
      } catch {
        if (!cancelled) {
          setMuteStart(fallback.start);
          setMuteEnd(fallback.end);
          setLoadErr('Could not load saved times (using local values).');
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const saveMuteTimes = async () => {
    setSaveErr('');
    const userId = getSessionUserId();
    if (userId == null) {
      setSaveErr('Not logged in.');
      return;
    }
    setSaving(true);
    try {
      await api.put(
        '/settings/preferences',
        {
          userId,
          start_time: muteStart,
          end_time: muteEnd,
        },
        { withCredentials: true }
      );
      localStorage.setItem(MUTE_TIMES_KEY, JSON.stringify({ start: muteStart, end: muteEnd }));
      setMuteSavedHint(true);
      window.setTimeout(() => setMuteSavedHint(false), 2500);
    } catch (e) {
      setSaveErr(e.response?.data?.message || e.message || 'Save failed.');
    } finally {
      setSaving(false);
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
        <SettingsSubHeader title="Notification" />

        <h5 className="text-center fw-bold mb-4" style={{ color: '#07333d' }}>
          Mute Time Settings
        </h5>
        {loadErr ? <p className="small text-warning text-center mb-2">{loadErr}</p> : null}
        <div className="row g-3 mb-4">
          <div className="col-6">
            <label className="small text-muted d-block text-center mb-2">Start Time</label>
            <div className="position-relative">
              <input
                type="time"
                className="form-control rounded-3 border-secondary-subtle pe-5"
                style={{ minHeight: 46 }}
                value={muteStart}
                onChange={(e) => setMuteStart(e.target.value)}
              />
              <Clock
                size={18}
                color="#888"
                className="position-absolute top-50 end-0 translate-middle-y me-3 pointer-events-none"
              />
            </div>
          </div>
          <div className="col-6">
            <label className="small text-muted d-block text-center mb-2">End Time</label>
            <div className="position-relative">
              <input
                type="time"
                className="form-control rounded-3 border-secondary-subtle pe-5"
                style={{ minHeight: 46 }}
                value={muteEnd}
                onChange={(e) => setMuteEnd(e.target.value)}
              />
              <Clock
                size={18}
                color="#888"
                className="position-absolute top-50 end-0 translate-middle-y me-3 pointer-events-none"
              />
            </div>
          </div>
        </div>
        {saveErr ? <p className="small text-danger text-center mb-2">{saveErr}</p> : null}
        {muteSavedHint ? (
          <p className="small text-success text-center mb-2">Saved.</p>
        ) : null}
        <button
          type="button"
          className={saveBtnClass}
          style={{ backgroundColor: ORANGE, minWidth: '220px' }}
          onClick={saveMuteTimes}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
