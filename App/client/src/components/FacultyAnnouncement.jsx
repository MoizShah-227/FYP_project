import React, { useState } from 'react';
import { X, User, ArrowLeft, Plus } from 'lucide-react';
import api from '../../config/axiosConfig.js'; // Import Axios config

const FacultyAnnouncement = ({ isOpen, onClose, onBack }) => {
  const [message, setMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePost = async () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }
  
    setLoading(true);
  
    try {
      const user = JSON.parse(localStorage.getItem("user"));
  
      if (!user || !user.u_id) {
        alert("User not found. Please login again.");
        return;
      }
  
      const payload = {
        message,
        image: "",
        type: "faculty",
        created_at: new Date().toISOString(),
        created_by: user.u_id,   // ✅ Send user ID
        emailChecked: sendEmail
      };
  
      const response = await api.post("/admin/facultyannoucement", payload);
  
      alert("Announcement posted successfully!");
      setMessage("");
      setSendEmail(true);
      onClose();
  
    } catch (error) {
      console.error("Failed to post announcement:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to post announcement");
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

        <label className="small fw-bold mb-2">Announcement Message:</label>
        <div className="position-relative mb-3">
          <textarea 
            className="form-control border shadow-sm"
            rows="5"
            placeholder="Write your announcement message..."
            style={{ borderRadius: '12px', resize: 'none', fontSize: '0.9rem' }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
          <div className="position-absolute start-0 bottom-0 m-3 text-muted">
            <Plus size={20} style={{ cursor: 'pointer' }} />
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
          {loading ? "Posting..." : "Post Announcement"}
        </button>
      </div>
    </div>
  );
};

export default FacultyAnnouncement;