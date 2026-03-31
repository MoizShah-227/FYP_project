import React, { useState } from 'react';
import { X, Globe, ArrowLeft, Plus } from 'lucide-react';
import api from '../../config/axiosConfig.js'; // your axios instance

const PublicAnnouncement = ({ isOpen, onClose, onBack }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Get user id from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const created_by = user.u_id; // or user.id depending on your storage

  const handlePost = async () => {
    if (!message.trim()) return alert("Please enter a message");

    setLoading(true);
    try {
      const payload = {
        message,
        image: null,          // optional image
        type: 'public',       // type is public
        created_at: new Date().toISOString(),
        created_by
      };

      const response = await api.post('/admin/publicannoucement', payload);

      console.log("Announcement posted:", response.data);
      alert("Announcement posted successfully");
      setMessage('');
      onClose();

    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to post announcement");
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
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0 fw-bold" style={{ color: '#07333d' }}>Create Announcement</h5>
          <button className="btn p-0 border-0" onClick={onClose}>
            <X size={24} color="#aaa" />
          </button>
        </div>

        {/* Back Button */}
        <button 
          className="btn btn-link text-decoration-none p-0 mb-3 d-flex align-items-center small fw-bold" 
          style={{ color: '#07333d' }}
          onClick={onBack}
        >
          <ArrowLeft size={16} className="me-1" /> Back
        </button>

        {/* Selected Audience */}
        <div className="p-3 rounded-3 mb-3 d-flex align-items-center border-0 shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
          <Globe size={24} color="#1b75ff" className="me-3" />
          <div>
            <h6 className="m-0 fw-bold" style={{ color: '#07333d' }}>Public Announcement</h6>
            <small className="text-muted">Visible to all users</small>
          </div>
        </div>

        {/* Message Area */}
        <label className="small fw-bold mb-2">Announcement Message:</label>
        <div className="position-relative mb-4">
          <textarea 
            className="form-control border shadow-sm"
            rows="6"
            placeholder="Write your announcement message..."
            style={{ borderRadius: '12px', resize: 'none', border: '1px solid #eee' }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
          <div className="position-absolute start-0 bottom-0 m-3 text-muted">
            <Plus size={20} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        {/* Submit Button */}
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