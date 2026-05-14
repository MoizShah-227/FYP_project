import React, { useMemo, useRef, useState } from 'react';
import { X, Globe, ArrowLeft, Plus, ImagePlus } from 'lucide-react';
import api from '../../config/axiosConfig.js';
import MentionTextarea from './MentionTextarea';

const PublicAnnouncement = ({ isOpen, onClose, onBack }) => {
  const [message, setMessage] = useState('');
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
    e.target.value = ''; // allow re-pick of same file
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
        const form = new FormData();
        form.append('message', message);
        form.append('type', 'public');
        form.append('created_at', new Date().toISOString());
        form.append('created_by', String(created_by));
        if (availability.from_date) form.append('from_date', availability.from_date);
        if (availability.to_date) form.append('to_date', availability.to_date);
        if (imageFile) form.append('image', imageFile);

        await api.post('/admin/publicannoucement', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      alert(authorIds.length > 1 ? `Posted ${authorIds.length} announcements.` : 'Announcement posted successfully');
      setMessage('');
      setTaggedAuthorIds([]);
      setFromDate('');
      setToDate('');
      clearImage();
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
            Type <strong>#</strong> then a name to set who the post is <strong>from</strong> (student, teacher, or admin). Leave untagged only if the post should show as yours. Multiple tags create multiple posts.
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
