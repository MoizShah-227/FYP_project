import React, { useMemo, useRef, useState } from 'react';
import { X, User, ArrowLeft, Plus, ImagePlus } from 'lucide-react';
import api from '../../config/axiosConfig.js';
import MentionTextarea from './MentionTextarea';

const FacultyAnnouncement = ({ isOpen, onClose, onBack }) => {
  const [message, setMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [taggedAuthorIds, setTaggedAuthorIds] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

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

  const handlePickImage = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) return alert('Please pick an image file.');
    if (f.size > 5 * 1024 * 1024) return alert('Image must be 5 MB or smaller.');
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview('');
  };

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
        const form = new FormData();
        form.append('message', message);
        form.append('type', 'faculty');
        form.append('created_at', new Date().toISOString());
        form.append('created_by', String(created_by));
        form.append('emailChecked', String(sendEmail && i === 0));
        if (availability.from_date) form.append('from_date', availability.from_date);
        if (availability.to_date) form.append('to_date', availability.to_date);
        if (imageFile) form.append('image', imageFile);

        await api.post('/admin/facultyannoucement', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      alert(authorIds.length > 1 ? `Posted ${authorIds.length} faculty announcements.` : 'Announcement posted successfully!');
      setMessage('');
      setTaggedAuthorIds([]);
      setFromDate('');
      setToDate('');
      setSendEmail(true);
      clearImage();
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
            Type <strong>#</strong> then a name to set who the post is <strong>from</strong> (student, teacher, or admin). Multiple tags create multiple posts (email only on the first).
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePickImage}
          />
          <button
            type="button"
            className="position-absolute start-0 bottom-0 m-2 btn btn-sm border-0 p-0 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 32, height: 32, background: '#f0f0f0' }}
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
            disabled={loading}
          >
            {imagePreview ? <ImagePlus size={16} color="#2d8a4e" /> : <Plus size={18} color="#666" />}
          </button>
        </div>

        {imagePreview ? (
          <div className="mb-3 position-relative d-inline-block">
            <img
              src={imagePreview}
              alt="preview"
              style={{
                maxHeight: 140,
                maxWidth: '100%',
                borderRadius: 10,
                border: '1px solid #eee',
                objectFit: 'cover',
              }}
            />
            <button
              type="button"
              className="btn btn-sm position-absolute top-0 end-0 border-0 d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: 24,
                height: 24,
                background: 'rgba(0,0,0,0.55)',
                color: '#fff',
                transform: 'translate(35%, -35%)',
              }}
              onClick={clearImage}
              disabled={loading}
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        ) : null}

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
