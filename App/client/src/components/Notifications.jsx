import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // Keep the navbar visible
import admin from '../assets/admin.png'; // Using your admin asset

function Notifications() {
  const navigate = useNavigate();

  const notificationData = [
    { id: 1, name: "Nadeem", time: "2m", avatar: admin, bg: "#e3f2fd" }, // Light blue for unread
    // { id: 2, name: "Ali Hassan", time: "1h", avatar: admin, bg: "#e3f2fd" },
    // { id: 3, name: "Muhammad Fahad", time: "2h", avatar: admin, bg: "#e3f2fd" },
    // { id: 4, name: "Muhammad Faisal", time: "4h", avatar: admin, bg: "#fff" },
    // { id: 5, name: "Hammad Ali", time: "4h", avatar: admin, bg: "#fff" },
    // { id: 6, name: "Ahmed Ali", time: "5h", avatar: admin, bg: "#fff" },
  ];

  return (
    <div className="min-vh-100 bg-white">
      <Navbar />
      
      {/* Header section from image */}
      <div className="p-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <button onClick={() => navigate(-1)} className="btn border-0 p-0 me-3">
            <ArrowLeft size={24} color="#07333d" />
          </button>
          <h4 className="m-0 fw-bold" style={{ color: '#07333d' }}>Notifications</h4>
        </div>
        <button className="btn btn-link text-decoration-none p-0 fw-bold" style={{ color: '#07333d' }}>
          Read All
        </button>
      </div>

      {/* Notification List */}
      <div className="px-3">
        {notificationData.map((notif) => (
          <div 
            key={notif.id}
            className="d-flex align-items-center p-3 mb-2 rounded-3 shadow-sm"
            style={{ 
              backgroundColor: notif.bg,
              border: '1px solid #f0f0f0' 
            }}
          >
            <img 
              src={notif.avatar} 
              alt="avatar" 
              className="rounded-circle me-3" 
              style={{ width: '55px', height: '55px', objectFit: 'cover' }}
            />
            <div>
              <h6 className="m-0 fw-bold" style={{ color: '#07333d' }}>{notif.name}</h6>
              <p className="m-0 text-muted small">
                send you emoji <span className="ms-1 text-secondary opacity-50">{notif.time}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;