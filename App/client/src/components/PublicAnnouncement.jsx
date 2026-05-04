import React, { useMemo, useState } from 'react';
import { X, Globe, ArrowLeft, Plus } from 'lucide-react';
import api from '../../config/axiosConfig.js';
import MentionTextarea from './MentionTextarea';

const PublicAnnouncement = ({ isOpen, onClose, onBack }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [taggedAuthorIds, setTaggedAuthorIds] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  }, [isOpen]);

  const isAdmin = (user?.type || '').toLowerCase() === 'admin';
  const actingUserId = user?.id ?? user?.u_id;

  if (!isOpen) return null;

  const handlePost = async () => {
    if (!message.trim()) return alert("Please enter a message");
    if (actingUserId == null) return alert("Not logged in.");
    if (fromDate && toDate && fromDate > toDate) {
      return alert('Visible "from" date must be on or before "to" date.');
    }

    const uniqueIds = [...new Set(taggedAuthorIds.map(Number).filter((n) => Number.isFinite(n)))];
    const authorIds = uniqueIds.length > 0 ? uniqueIds : [Number(actingUserId)];

    const availability = {
      from_date: fromDate || null,
      to_date: toDate || null,
    };

    setLoading(true);
    try {
      for (let i = 0; i < authorIds.length; i++) {
        const created_by = authorIds[i];
        const payload = {
          message,
          image: null,
          type: 'public',
          created_at: new Date().toISOString(),
          created_by,
          ...availability,
        };
        await api.post('/admin/publicannoucement', payload);
      }

      alert(authorIds.length > 1 ? `Posted ${authorIds.length} announcements.` : 'Announcement posted successfully');
      setMessage('');
      setTaggedAuthorIds([]);
      setFromDate('');
      setToDate('');
      onClose();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Failed to post announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
      style={{ zIndex: 2100, backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose} 
    >
      <div 
        className="bg-white rounded-4 p-4 shadow-lg mx-3" 
        style={{ maxWidth: '400px', width: '100%' }}
        onClick={e => e.stopPropagation()} 
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0 fw-bold" style={{ color: '#07333d' }}>Create Announcement</h5>
          <button className="btn p-0 border-0" onClick={onClose}>
            <X size={24} color="#aaa" />
          </button>
        </div>

        <button 
          className="btn btn-link text-decoration-none p-0 mb-3 d-flex align-items-center small fw-bold" 
          style={{ color: '#07333d' }}
          onClick={onBack}
        >
          <ArrowLeft size={16} className="me-1" /> Back
        </button>

        <div className="p-3 rounded-3 mb-3 d-flex align-items-center border-0 shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
          <Globe size={24} color="#1b75ff" className="me-3" />
          <div>
            <h6 className="m-0 fw-bold" style={{ color: '#07333d' }}>Public Announcement</h6>
            <small className="text-muted">Visible to all users</small>
          </div>
        </div>

        {isAdmin && (
          <p className="small text-muted mb-2">
            Type <strong>#</strong> then a name to post on behalf of an admin or teacher. You can tag more than once for multiple posts.
          </p>
        )}

        <label className="small fw-bold mb-2">Announcement Message:</label>
        <div className="position-relative mb-4">
          <MentionTextarea
            enabled={isAdmin}
            value={message}
            onChange={setMessage}
            onTaggedAuthorsChange={setTaggedAuthorIds}
            rows={6}
            placeholder="Write your announcement message..."
            className="form-control border shadow-sm"
            style={{ borderRadius: '12px', resize: 'none', border: '1px solid #eee' }}
          />
          <div className="position-absolute start-0 bottom-0 m-3 text-muted pointer-events-none">
            <Plus size={20} />
          </div>
        </div>

        <div className="mb-4">
          <label className="small fw-bold mb-2 d-block">Visible between (optional)</label>
          <p className="small text-muted mb-2">Leave empty to show anytime. Uses your announcement visibility rules on the server.</p>
          <div className="row g-2">
            <div className="col-6">
              <label className="small text-muted">From</label>
              <input
                type="date"
                className="form-control form-control-sm border shadow-sm"
                style={{ borderRadius: '10px' }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="col-6">
              <label className="small text-muted">To</label>
              <input
                type="date"
                className="form-control form-control-sm border shadow-sm"
                style={{ borderRadius: '10px' }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button 
          className="btn w-100 py-3 text-white fw-bold shadow-sm" 
          style={{ backgroundColor: '#ffa02e', borderRadius: '12px' }}
          onClick={handlePost}
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Post Announcement'}
        </button>
      </div>
    </div>
  );
};

export default PublicAnnouncement;
