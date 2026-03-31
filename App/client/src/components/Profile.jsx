import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Menu, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../config/axiosConfig';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    }
    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);


  const handleLogout = async () => {
    try {
      await api.post("/user/logout", {}, { withCredentials: true });
  
      localStorage.removeItem("user");
      sessionStorage.clear();
  
      navigate("/login");
  
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  return (
    <div className="min-vh-100 bg-white" style={{ overflow: 'hidden' }}>
      <Navbar />

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 1040,
            transition: 'opacity 0.3s',
          }}
        />
      )}

      {/* Side Drawer */}
      <div
        ref={sidebarRef}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: '260px',
          backgroundColor: '#07333d',
          zIndex: 1050,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem 1.25rem',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Close Button */}
        <div className="d-flex justify-content-end mb-4">
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <X size={24} color="#fff" />
          </button>
        </div>

        {/* User Info at top of drawer */}
        <div className="text-center mb-4">
          <img
            src={
              user.image
                ? `http://localhost:5004/uploads/${user.image}`
                : "/default-avatar.png"
            }
            alt={user.name}
            className="rounded-circle border border-3 border-white mb-2"
            style={{ width: '70px', height: '70px', objectFit: 'cover' }}
          />
          <p className="text-white fw-bold mb-0" style={{ fontSize: '15px' }}>{user.name}</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{user.role}</p>
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '0 0 1.5rem' }} />

        {/* Nav Items — add more here as needed */}
        <div style={{ flex: 1 }}>
          {/* Example placeholder menu item */}
          {/* <button style={navItemStyle}>Home</button> */}
        </div>

        {/* Logout at bottom */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '10px',
            color: '#ff6b6b',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            width: '100%',
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="container py-3">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-5">
          <div className="d-flex align-items-center">
            <button onClick={() => navigate(-1)} className="btn border-0 p-0 me-3">
              <ArrowLeft size={24} color="#07333d" />
            </button>
            <h4 className="m-0 fw-bold" style={{ color: '#07333d' }}>Profile</h4>
          </div>
          <button
            className="btn border-0 p-0"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={28} color="#000" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="position-relative mt-5 pt-5">
          <div
            className="card border-0 shadow-sm pt-5 pb-4 px-3"
            style={{
              backgroundColor: '#073d47',
              borderRadius: '25px',
              minHeight: '200px'
            }}
          >
            <div
              className="position-absolute start-50 translate-middle-x"
              style={{ top: '-60px' }}
            >
              <img
                src={
                  user.image
                    ? `http://localhost:5004/uploads/${user.image}`
                    : "/default-avatar.png"
                }
                alt={user.name}
                className="rounded-circle border border-4 border-white shadow"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
            </div>

            <div className="text-center mt-5 pt-3 text-white">
              <h2 className="fw-bold mb-1">{user.name}</h2>
              <p className="opacity-75 mb-0" style={{ fontSize: '0.9rem' }}>
                {user.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;