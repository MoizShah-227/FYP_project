import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import admin from '../assets/admin.png';
import api from '../../config/axiosConfig.js';
import BirthdayNotification from './BirthDayNotification';
import NotificationActivityCard from './NotificationActivityCard';
import TodayEventWishCard from './TodayEventWishCard';

function Notifications() {
  const navigate = useNavigate();
  const [birthdayRows, setBirthdayRows] = useState([]);
  const [birthdaysLoading, setBirthdaysLoading] = useState(true);
  const [dismissedBirthdayIds, setDismissedBirthdayIds] = useState(() => new Set());
  const [activityItems, setActivityItems] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [dismissedActivityIds, setDismissedActivityIds] = useState(() => new Set());
  const [activityTick, setActivityTick] = useState(0);
  const [eventRows, setEventRows] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [favourites, setFavourites] = useState([]);
  const [eventTick, setEventTick] = useState(0);
  const [birthdayTick, setBirthdayTick] = useState(0);
  const [eventMigrationWarning, setEventMigrationWarning] = useState(null);

  const rawUser = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
  const parsedUser = rawUser ? JSON.parse(rawUser) : null;
  const currentUserId = parsedUser?.id ?? parsedUser?.u_id;
  const isStudent = String(parsedUser?.type ?? '').trim().toLowerCase() === 'student';

  const fetchBirthdays = useCallback(async () => {
    setBirthdaysLoading(true);
    try {
      const userId = currentUserId;
      if (userId == null || Number.isNaN(Number(userId))) {
        setBirthdayRows([]);
        return;
      }
      const res = await api.get(`/user/favourite-birthdays/${userId}`);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setBirthdayRows(data);
    } catch (e) {
      console.error(e.response?.data || e.message);
      setBirthdayRows([]);
    } finally {
      setBirthdaysLoading(false);
    }
  }, [currentUserId]);

  const fetchActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const userId = currentUserId;
      if (userId == null || Number.isNaN(Number(userId))) {
        setActivityItems([]);
        return;
      }
      const res = await api.get(`/user/notifications-feed/${userId}`, { params: { days: 21 } });
      const items = Array.isArray(res.data?.items) ? res.data.items : [];
      setActivityItems(items);
    } catch (e) {
      console.error(e.response?.data || e.message);
      setActivityItems([]);
    } finally {
      setActivityLoading(false);
    }
  }, [currentUserId]);

  const fetchTodayEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventMigrationWarning(null);
    try {
      const userId = currentUserId;
      if (!isStudent || userId == null || Number.isNaN(Number(userId))) {
        setEventRows([]);
        return;
      }
      const hasRes = await api.get('/event/has-today');
      if (import.meta.env.DEV && hasRes.data?.server_today != null) {
        console.info('[Events] server date (SQL):', hasRes.data.server_today, 'hasEventToday:', hasRes.data?.hasEventToday);
      }
      if (!hasRes.data?.hasEventToday) {
        setEventRows([]);
        return;
      }
      const res = await api.get('/event/today-status', { params: { user_id: userId } });
      if (typeof res.data?.warning === 'string' && res.data.warning) {
        setEventMigrationWarning(res.data.warning);
      }
      const events = Array.isArray(res.data?.events) ? res.data.events : [];
      setEventRows(events);
    } catch (e) {
      console.error(e.response?.data || e.message);
      setEventRows([]);
    } finally {
      setEventsLoading(false);
    }
  }, [currentUserId, isStudent]);

  const fetchFavouriteTeachersForEvent = useCallback(async () => {
    try {
      const userId = currentUserId;
      if (!isStudent || userId == null || Number.isNaN(Number(userId))) {
        setFavourites([]);
        return;
      }
      const res = await api.get(`/user/favourite-teachers/${userId}`);
      const rows = Array.isArray(res.data?.[0]) ? res.data[0] : [];
      setFavourites(rows);
    } catch (e) {
      console.error(e.response?.data || e.message);
      setFavourites([]);
    }
  }, [currentUserId, isStudent]);

  useEffect(() => {
    fetchBirthdays();
  }, [fetchBirthdays, birthdayTick]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity, activityTick]);

  useEffect(() => {
    fetchTodayEvents();
  }, [fetchTodayEvents, eventTick]);

  useEffect(() => {
    fetchFavouriteTeachersForEvent();
  }, [fetchFavouriteTeachersForEvent]);

  const dismissBirthday = (uId) => {
    setDismissedBirthdayIds((prev) => new Set(prev).add(uId));
  };

  const dismissActivity = (announcementId) => {
    setDismissedActivityIds((prev) => new Set(prev).add(Number(announcementId)));
  };

  const visibleBirthdays = birthdayRows.filter((b) => !dismissedBirthdayIds.has(b.u_id));

  const visibleActivity = activityItems.filter((a) => {
    if (dismissedActivityIds.has(Number(a.announcement_id))) return false;
    const isPost = a.feed_kind === 'favourite_post' || a.feed_kind === 'about_favourite';
    if (isPost && a.viewer_has_reacted) return false;
    return true;
  });

  const pendingEvents = eventRows.filter((e) => e.canWish !== false && !e.already_sent);

  const loadingAny = birthdaysLoading || activityLoading || eventsLoading;
  const hasContent =
    visibleBirthdays.length > 0 || pendingEvents.length > 0 || visibleActivity.length > 0;

  return (
    <div className="min-vh-100 bg-white">
      <Navbar />

      <div className="p-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <button type="button" onClick={() => navigate(-1)} className="btn border-0 p-0 me-3">
            <ArrowLeft size={24} color="#07333d" />
          </button>
          <h4 className="m-0 fw-bold" style={{ color: '#07333d' }}>Notifications</h4>
        </div>
        <button type="button" className="btn btn-link text-decoration-none p-0 fw-bold" style={{ color: '#07333d' }}>
          Read All
        </button>
      </div>

      <div className="px-3 pb-5">
        {!loadingAny && !hasContent ? (
          <div className="text-center py-5 px-3">
            <p className="fw-semibold mb-1" style={{ color: '#07333d' }}>You&apos;re all caught up</p>
            <p className="small text-muted mb-0">
              No birthday reminders, event wishes, or post reactions pending.
            </p>
          </div>
        ) : null}

        {birthdaysLoading ? (
          <p className="text-muted small mb-3">Loading birthday reminders…</p>
        ) : visibleBirthdays.length > 0 ? (
          <div className="mb-4">
            <h6 className="small fw-bold text-uppercase text-muted mb-2">Birthdays today · pending wishes</h6>
            {visibleBirthdays.map((person) => (
              <div
                key={person.u_id}
                className="mb-3 p-3 rounded-3 shadow-sm bg-white"
                style={{ border: '1px solid #f0f0f0' }}
              >
                <div className="d-flex align-items-center gap-3 mb-2">
                  <img
                    src={person.image || admin}
                    alt=""
                    className="rounded-circle"
                    style={{ width: 52, height: 52, objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = admin;
                    }}
                  />
                  <div className="small text-muted">
                    <span className="fw-semibold d-block" style={{ color: '#07333d' }}>{person.name}</span>
                    {person.department ? <span>{person.department}</span> : null}
                  </div>
                </div>
                <BirthdayNotification
                  name={person.name}
                  receiverId={person.u_id}
                  onClose={() => dismissBirthday(person.u_id)}
                  onWishCompleted={() => setBirthdayTick((t) => t + 1)}
                />
              </div>
            ))}
          </div>
        ) : null}

        {eventsLoading ? (
          <p className="text-muted small mb-3">Checking today&apos;s events…</p>
        ) : pendingEvents.length > 0 ? (
          <div className="mb-4">
            <h6 className="small fw-bold text-uppercase text-muted mb-2">Events today · wish your teachers</h6>
            {eventMigrationWarning ? (
              <div className="alert alert-warning py-2 px-3 small mb-2" role="status">
                {eventMigrationWarning}
              </div>
            ) : null}
            {pendingEvents.map((ev) => (
              <TodayEventWishCard
                key={ev.event_id}
                event={ev}
                favourites={favourites}
                currentUserId={Number(currentUserId)}
                onCompleted={() => setEventTick((t) => t + 1)}
              />
            ))}
          </div>
        ) : null}

        {activityLoading ? (
          <p className="text-muted small mb-3">Loading updates from favourites & faculty…</p>
        ) : visibleActivity.length > 0 ? (
          <div className="mb-4">
            <h6 className="small fw-bold text-uppercase text-muted mb-2">Posts &amp; updates</h6>
            {visibleActivity.map((item) => (
              <div
                key={item.announcement_id}
                className="mb-3 p-3 rounded-3 shadow-sm bg-white"
                style={{ border: '1px solid #f0f0f0' }}
              >
                <NotificationActivityCard
                  item={item}
                  onDismiss={() => dismissActivity(item.announcement_id)}
                  onChanged={() => setActivityTick((t) => t + 1)}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Notifications;
