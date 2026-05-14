import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, User, EyeOff, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import SettingsSubHeader from './SettingsSubHeader';
import useTeacherSettingsReady from './useTeacherSettingsReady';
import api from '../../config/axiosConfig.js';
import {
  ORANGE,
  PRIVATE_PREFS_KEY,
  readPrivatePrefs,
  saveBtnClass,
  getSessionUserId,
  prefsRowToPrivacyState,
  privacyStateToPreferencePayload,
} from './settingsShared';

const privacyOptions = [
  {
    id: 'everyone',
    icon: Users,
    title: 'Everyone',
    sub: 'All students and faculty can see',
  },
  {
    id: 'specific',
    icon: User,
    title: 'Specific People',
    sub: 'Choose who can see',
  },
  {
    id: 'hidden',
    icon: EyeOff,
    title: 'Hidden',
    sub: 'Hide from everyone',
  },
];

export default function PrivateAccountSettingsPage() {
  const ready = useTeacherSettingsReady();

  const [privacyVisibility, setPrivacyVisibility] = useState('everyone');
  const [privacySpecificIds, setPrivacySpecificIds] = useState(() => new Set());
  const [privacySearch, setPrivacySearch] = useState('');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [privacySavedHint, setPrivacySavedHint] = useState(false);
  const [prefsErr, setPrefsErr] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [saving, setSaving] = useState(false);

  const loadStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const res = await api.get('/user/students', { withCredentials: true });
      const rows = Array.isArray(res.data?.[0]) ? res.data[0] : [];
      setStudents(rows);
    } catch {
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    async function loadPrefs() {
      setPrefsErr('');
      setPrefsLoading(true);
      const userId = getSessionUserId();
      if (userId == null) {
        const p = readPrivatePrefs();
        setPrivacyVisibility(p.visibility);
        setPrivacySpecificIds(new Set(p.specificIds));
        setPrefsLoading(false);
        setPrefsErr('Not logged in. Showing cached preferences.');
        return;
      }
      try {
        const res = await api.get(`/settings/preferences/${userId}`, { withCredentials: true });
        const mapped = prefsRowToPrivacyState(res.data);
        if (!cancelled) {
          setPrivacyVisibility(mapped.visibility);
          setPrivacySpecificIds(new Set(mapped.specificIds));
        }
      } catch {
        const p = readPrivatePrefs();
        if (!cancelled) {
          setPrivacyVisibility(p.visibility);
          setPrivacySpecificIds(new Set(p.specificIds));
          setPrefsErr('Could not load from server (using cached preferences).');
        }
      } finally {
        if (!cancelled) setPrefsLoading(false);
      }
    }

    setPrivacySearch('');
    setPrivacySavedHint(false);
    loadStudents();
    loadPrefs();
    return () => {
      cancelled = true;
    };
  }, [ready, loadStudents]);

  const filteredStudents = useMemo(() => {
    const q = privacySearch.trim().toLowerCase();
    if (!q) return students.slice(0, 40);
    return students
      .filter((s) => {
        const name = String(s.name || '').toLowerCase();
        const reg = String(s.reg_no || '').toLowerCase();
        return name.includes(q) || reg.includes(q);
      })
      .slice(0, 40);
  }, [students, privacySearch]);

  const togglePrivacyStudent = (uid) => {
    setPrivacySpecificIds((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const savePrivacy = async () => {
    setSaveErr('');
    const userId = getSessionUserId();
    if (userId == null) {
      setSaveErr('Not logged in.');
      return;
    }
    const { private_status, includes } = privacyStateToPreferencePayload(
      privacyVisibility,
      privacySpecificIds
    );
    setSaving(true);
    try {
      await api.put(
        '/settings/preferences',
        {
          userId,
          private_status,
          includes,
        },
        { withCredentials: true }
      );
      localStorage.setItem(
        PRIVATE_PREFS_KEY,
        JSON.stringify({
          visibility: privacyVisibility,
          specificIds: [...privacySpecificIds],
        })
      );
      setPrivacySavedHint(true);
      window.setTimeout(() => setPrivacySavedHint(false), 2500);
    } catch (e) {
      setSaveErr(e.response?.data?.message || e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const uploadsBase = `${String(api.defaults.baseURL || '').replace(/\/$/, '')}/uploads`;
  const apiOrigin = String(api.defaults.baseURL || '').replace(/\/$/, '');

  /** Resolves any of: full URL | '/uploads/...' | 'profile/x.jpg' | 'x.jpg' → absolute URL. */
  function resolveUserImage(raw) {
    const t = String(raw || '').trim();
    if (!t) return '';
    if (/^https?:\/\//i.test(t)) return t;
    if (t.startsWith('/')) return `${apiOrigin}${t}`;
    return `${uploadsBase}/${t.replace(/^uploads\//i, '')}`;
  }

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
        <SettingsSubHeader title="Private" />

        {prefsLoading ? (
          <p className="small text-muted mb-2">Loading preferences…</p>
        ) : null}
        {prefsErr ? <p className="small text-warning mb-2">{prefsErr}</p> : null}

        <div className="d-flex flex-column gap-3 mb-3">
          {privacyOptions.map((opt) => {
            const { id, icon: PrivacyIcon, title, sub } = opt;
            const selected = privacyVisibility === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPrivacyVisibility(id)}
                className="d-flex align-items-center gap-3 text-start border rounded-4 p-3 bg-white w-100"
                style={{
                  borderColor: selected ? '#2563eb' : '#e8e8e8',
                  boxShadow: selected ? '0 0 0 1px #2563eb' : '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <span
                  className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    background: selected ? '#eef4ff' : '#f4f4f4',
                    color: selected ? '#2563eb' : '#555',
                  }}
                >
                  <PrivacyIcon size={22} strokeWidth={1.8} />
                </span>
                <span className="flex-grow-1 min-w-0">
                  <span className="fw-semibold d-block" style={{ color: '#111' }}>
                    {title}
                  </span>
                  <span className="small text-muted">{sub}</span>
                </span>
                <span
                  className="rounded-circle flex-shrink-0 border d-flex align-items-center justify-content-center"
                  style={{
                    width: 22,
                    height: 22,
                    borderColor: selected ? '#2563eb' : '#ccc',
                    background: selected ? '#2563eb' : '#fff',
                  }}
                >
                  {selected ? (
                    <span className="rounded-circle bg-white" style={{ width: 8, height: 8 }} />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        {privacyVisibility === 'specific' && (
          <>
            <div className="position-relative mb-3">
              <Search
                size={18}
                color="#888"
                className="position-absolute top-50 start-0 translate-middle-y ms-3"
              />
              <input
                type="search"
                className="form-control rounded-4 ps-5 py-2"
                placeholder="Search by name or reg. no."
                value={privacySearch}
                onChange={(e) => setPrivacySearch(e.target.value)}
              />
            </div>
            {studentsLoading ? (
              <p className="small text-muted">Loading students…</p>
            ) : (
              <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: 260, overflowY: 'auto' }}>
                {filteredStudents.map((s) => {
                  const uid = Number(s.u_id);
                  const picked = privacySpecificIds.has(uid);
                  return (
                    <button
                      key={uid}
                      type="button"
                      onClick={() => togglePrivacyStudent(uid)}
                      className="d-flex align-items-center gap-3 text-start rounded-3 p-2 w-100 border-0"
                      style={{ backgroundColor: '#f0f2f5' }}
                    >
                      <img
                        src={resolveUserImage(s.image) || '/default-avatar.png'}
                        alt=""
                        className="rounded-circle flex-shrink-0"
                        style={{ width: 40, height: 40, objectFit: 'cover' }}
                        onError={(e) => {
                          if (!e.currentTarget.src.endsWith('/default-avatar.png')) {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/default-avatar.png';
                          }
                        }}
                      />
                      <span className="flex-grow-1 fw-semibold small" style={{ color: '#222' }}>
                        {s.name}
                      </span>
                      <span
                        className="rounded-1 flex-shrink-0 d-flex align-items-center justify-content-center"
                        style={{
                          width: 22,
                          height: 22,
                          background: picked ? '#22c55e' : '#ddd',
                          border: picked ? 'none' : '1px solid #bbb',
                        }}
                      >
                        {picked ? (
                          <span className="text-white fw-bold" style={{ fontSize: 12 }}>
                            ✓
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {saveErr ? <p className="small text-danger text-center mb-2">{saveErr}</p> : null}
        {privacySavedHint ? (
          <p className="small text-success text-center mb-2">Saved.</p>
        ) : null}
        <button
          type="button"
          className={saveBtnClass}
          style={{ backgroundColor: ORANGE, minWidth: '220px' }}
          onClick={savePrivacy}
          disabled={saving || prefsLoading}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
