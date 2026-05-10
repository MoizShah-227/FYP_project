import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** Redirect non-teachers to profile; returns false until gate passes. */
export default function useTeacherSettingsReady() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const u = raw ? JSON.parse(raw) : null;
      const role = String(u?.type ?? '').trim().toLowerCase();
      if (!u || role !== 'teacher') {
        navigate('/profile', { replace: true });
        return;
      }
    } catch {
      navigate('/profile', { replace: true });
      return;
    }
    setReady(true);
  }, [navigate]);

  return ready;
}
