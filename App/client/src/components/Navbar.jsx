import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Home, Bell, Grid, UserCircle } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav 
      className="d-flex align-items-center justify-content-between px-4 py-3 bg-white sticky-top"
      style={{
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        zIndex: 1000
      }}
    >
      <div className="d-flex align-items-center" onClick={() => navigate('/feed')} style={{cursor: 'pointer'}}>
        <div style={{ width: '4px', height: '30px', backgroundColor: '#007bff', marginRight: '15px' }}></div>
        <h2 className="m-0 fw-bold" style={{ color: '#07333d', letterSpacing: '-0.5px', fontSize: '1.8rem' }}>
          Wishora
        </h2>
      </div>

      <div className="d-flex align-items-center gap-4 text-dark">
        <button onClick={() => navigate('/feed')} className="btn p-1 border-0 bg-transparent nav-icon-hover">
          <Home size={28} strokeWidth={1.5} color="#333" />
        </button>
        
        <button onClick={() => navigate('/notifications')} className="btn p-1 border-0 bg-transparent nav-icon-hover">
          <Bell size={28} strokeWidth={1.5} color="#333" />
        </button>
        
        <button onClick={() => navigate('/dashboard')} className="btn p-1 border-0 bg-transparent nav-icon-hover">
          <Grid size={28} strokeWidth={1.5} color="#333" />
        </button>
        
        <button onClick={() => navigate('/profile')} className="btn p-1 border-0 bg-transparent nav-icon-hover">
          <UserCircle size={32} strokeWidth={1.2} color="#000" />
        </button>
      </div>

      <style jsx>{`
        .nav-icon-hover { transition: transform 0.2s ease; cursor: pointer; }
        .nav-icon-hover:hover { transform: translateY(-2px); opacity: 0.7; }
      `}</style>
    </nav>
  );
}

export default Navbar;