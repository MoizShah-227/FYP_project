import React, { useMemo, useState } from 'react';
import { X, User, ArrowLeft, Plus } from 'lucide-react';
import api from '../../config/axiosConfig.js';
import MentionTextarea from './MentionTextarea';

const FacultyAnnouncement = ({ isOpen, onClose, onBack }) => {
  const [message, setMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
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
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }
    if (actingUserId == null) {
      alert("User not found. Please login again.");
      return;
    }
    if (fromDate && toDate && fromDate > toDate) {
      alert('Visible "from" date must be on or before "to" date.');
      return;
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
          image: '',
          type: 'faculty',
          created_at: new Date().toISOString(),
          created_by,
          emailChecked: sendEmail && i === 0,
          ...availability,
        };

        await api.post('/admin/facultyannoucement', payload);
      }

      alert(authorIds.length > 1 ? `Posted ${authorIds.length} faculty announcements.` : 'Announcement posted successfully!');
      setMessage('');
      setTaggedAuthorIds([]);
      setFromDate('');
      setToDate('');
      setSendEmail(true);
      onClose();
    } catch (error) {
      console.error('Failed to post announcement:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to post announcement');
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

        <div className="p-3 rounded-3 mb-3 d-flex align-items-center border-0" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="bg-white rounded-circle p-1 me-3 shadow-sm d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
             <User size={24} color="#f39c12" />
          </div>
          <div>
            <h6 className="m-0 fw-bold" style={{ color: '#07333d' }}>Faculty Announcement</h6>
            <small className="text-muted">Visible to teachers only</small>
          </div>
        </div>

        {isAdmin && (
          <p className="small text-muted mb-2">
            Type <strong>#</strong> then a name to post on behalf of an admin or teacher. Multiple tags create multiple posts (email only on the first).
          </p>
        )}

        <label className="small fw-bold mb-2">Announcement Message:</label>
        <div className="position-relative mb-3">
          <MentionTextarea
            enabled={isAdmin}
            value={message}
            onChange={setMessage}
            onTaggedAuthorsChange={setTaggedAuthorIds}
            rows={5}
            placeholder="Write your announcement message..."
            className="form-control border shadow-sm"
            style={{ borderRadius: '12px', resize: 'none', fontSize: '0.9rem' }}
          />
          <div className="position-absolute start-0 bottom-0 m-3 text-muted pointer-events-none">
            <Plus size={20} />
          </div>
        </div>

        <div className="mb-3">
          <label className="small fw-bold mb-2 d-block">Visible between (optional)</label>
          <p className="small text-muted mb-2">Leave empty to show anytime.</p>
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

        <div className="d-flex justify-content-end align-items-center mb-4">
          <div className="form-check d-flex align-items-center gap-2">
            <input 
              className="form-check-input" 
              type="checkbox" 
              checked={sendEmail}
              onChange={() => setSendEmail(!sendEmail)}
              id="emailCheck"
              style={{ cursor: 'pointer', backgroundColor: sendEmail ? '#1e8449' : '#fff', borderColor: '#1e8449' }}
            />
            <label className="form-check-label small text-muted" htmlFor="emailCheck" style={{ cursor: 'pointer' }}>
              send via email
            </label>
          </div>
        </div>

        <button 
          className="btn w-100 py-3 text-white fw-bold shadow-sm" 
          style={{ backgroundColor: '#ffa02e', borderRadius: '15px', fontSize: '1.1rem' }}
          onClick={handlePost}
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Post Announcement'}
        </button>
      </div>
    </div>
  );
};

export default FacultyAnnouncement;
