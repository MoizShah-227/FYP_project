export const TEAL = '#07333d';
export const ORANGE = '#ffa02e';

export const MUTE_TIMES_KEY = 'wishora_mute_times';
export const PRIVATE_PREFS_KEY = 'wishora_private_prefs';

export function readMuteTimes() {
  try {
    const raw = localStorage.getItem(MUTE_TIMES_KEY);
    if (!raw) return { start: '23:00', end: '08:30' };
    const j = JSON.parse(raw);
    return {
      start: typeof j.start === 'string' ? j.start : '23:00',
      end: typeof j.end === 'string' ? j.end : '08:30',
    };
  } catch {
    return { start: '23:00', end: '08:30' };
  }
}

export function readPrivatePrefs() {
  try {
    const raw = localStorage.getItem(PRIVATE_PREFS_KEY);
    if (!raw) return { visibility: 'everyone', specificIds: [] };
    const j = JSON.parse(raw);
    return {
      visibility: ['everyone', 'specific', 'hidden'].includes(j.visibility)
        ? j.visibility
        : 'everyone',
      specificIds: Array.isArray(j.specificIds)
        ? j.specificIds.map((n) => Number(n)).filter((n) => Number.isFinite(n))
        : [],
    };
  } catch {
    return { visibility: 'everyone', specificIds: [] };
  }
}

export function getSessionUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const id = user?.id ?? user?.u_id;
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Maps GET /settings/preferences row → Private Account UI */
export function prefsRowToPrivacyState(row) {
  const ps = !!row?.private_status;
  const inc = row?.includes != null ? String(row.includes).trim() : '';
  if (!ps) return { visibility: 'everyone', specificIds: [] };
  if (inc) {
    return {
      visibility: 'specific',
      specificIds: inc
        .split(',')
        .map((s) => Number(String(s).trim()))
        .filter((n) => Number.isFinite(n)),
    };
  }
  return { visibility: 'hidden', specificIds: [] };
}

export function privacyStateToPreferencePayload(visibility, specificIds) {
  if (visibility === 'everyone') return { private_status: false, includes: null };
  if (visibility === 'hidden') return { private_status: true, includes: null };
  const ids = [...specificIds]
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  return { private_status: true, includes: ids.length ? ids.join(',') : null };
}

/** HH:mm:ss or HH:mm → HH:mm for HTML time inputs */
export function timeToInputValue(t) {
  if (!t || typeof t !== 'string') return '23:00';
  const s = t.trim();
  const parts = s.split(':');
  if (parts.length >= 2) {
    const h = String(parts[0]).padStart(2, '0').slice(-2);
    const m = String(parts[1]).padStart(2, '0').slice(0, 2);
    return `${h}:${m}`;
  }
  return '23:00';
}

export const saveBtnClass =
  'btn fw-bold text-white border-0 rounded-pill py-3 px-5 mx-auto d-block';
