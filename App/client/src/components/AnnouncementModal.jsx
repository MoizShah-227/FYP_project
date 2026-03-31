import React, { useState } from 'react';
import { X, Globe, User } from 'lucide-react';
import PublicAnnouncement from './PublicAnnouncement';
import FacultyAnnouncement from './FacultyAnnouncement'; // Import the new modal

const AnnouncementModal = ({ isOpen, onClose }) => {
  const [activeView, setActiveView] = useState('selection'); // 'selection', 'public', or 'faculty'

  if (!isOpen) return null;

  const handleCloseAll = () => {
    setActiveView('selection');
    onClose();
  };

  // Logic to switch between components
  if (activeView === 'public') {
    return <PublicAnnouncement isOpen={isOpen} onClose={handleCloseAll} onBack={() => setActiveView('selection')} />;
  }
  
  if (activeView === 'faculty') {
    return <FacultyAnnouncement isOpen={isOpen} onClose={handleCloseAll} onBack={() => setActiveView('selection')} />;
  }

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
      style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose} 
    >
      <div className="bg-white rounded-4 p-4 shadow-lg mx-3" style={{ maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0 fw-bold" style={{ color: '#07333d' }}>Create Announcement</h5>
          <button className="btn p-0 border-0" onClick={onClose}><X size={24} color="#aaa" /></button>
        </div>

        <p className="small text-muted mb-4">Select Audience:</p>

        <div 
          className="p-3 rounded-3 mb-3 d-flex align-items-center border-0 shadow-sm" 
          style={{ backgroundColor: '#f8f9fa', cursor: 'pointer' }}
          onClick={() => setActiveView('public')}
        >
          <div className="bg-white rounded-circle p-2 me-3 shadow-sm"><Globe size={24} color="#1b75ff" /></div>
          <div>
            <h6 className="m-0 fw-bold" style={{ color: '#07333d' }}>Public Announcement</h6>
            <small className="text-muted">Visible to all users</small>
          </div>
        </div>

        <div 
          className="p-3 rounded-3 d-flex align-items-center border-0 shadow-sm" 
          style={{ backgroundColor: '#f8f9fa', cursor: 'pointer' }}
          onClick={() => setActiveView('faculty')}
        >
          <div className="bg-white rounded-circle p-2 me-3 shadow-sm">
            <User size={24} color="#f39c12" />
          </div>
          <div>
            <h6 className="m-0 fw-bold" style={{ color: '#07333d' }}>Faculty Announcement</h6>
            <small className="text-muted">Visible to teachers only</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;