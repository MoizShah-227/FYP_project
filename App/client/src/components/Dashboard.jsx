import React, { useState, useEffect } from 'react';
import { Plus, Calendar, BarChart2, Settings, Users } from 'lucide-react';
import Navbar from './Navbar';
import AnnouncementModal from './AnnouncementModal';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axiosConfig.js'; // Import Axios config

function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const navigate = useNavigate();

  // Fetch totals on component mount
  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const studentsRes = await api.get('/admin/students');
        setTotalStudents(studentsRes.data); // your API sends the count directly

        const teachersRes = await api.get('/admin/teachers');
        setTotalTeachers(teachersRes.data);
      } catch (error) {
        console.error('Failed to fetch totals:', error.response?.data || error.message);
      }
    };

    fetchTotals();
  }, []);

  return (
    <div className="min-vh-100 bg-white">
      <Navbar />
      <AnnouncementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <div className="container py-4">
        <h4 className="fw-bold mb-4" style={{ color: '#07333d' }}>Admin Dashboard</h4>

        {/* Stats Row */}
        <div className="row g-3 mb-5">
          <div className="col-6">
            <div className="p-4 rounded-4 text-white shadow-sm" style={{ backgroundColor: '#1b75ff' }}>
              <Users size={32} className="mb-2 opacity-75" />
              <h2 className="fw-bold m-0">{totalStudents}</h2>
              <small className="opacity-75">Total Students</small>
            </div>
          </div>
          <div className="col-6">
            <div className="p-4 rounded-4 text-white shadow-sm" style={{ backgroundColor: '#cc9a06' }}>
              <Users size={32} className="mb-2 opacity-75" />
              <h2 className="fw-bold m-0">{totalTeachers}</h2>
              <small className="opacity-75">Total Teachers</small>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-column gap-3">
          <button 
            className="btn w-100 py-3 text-white text-start px-4 d-flex align-items-center" 
            style={{ backgroundColor: '#1e8449', borderRadius: '15px' }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={24} className="me-3" /> <span className="fw-bold">Announcement</span>
          </button>

          <button 
            className="btn w-100 py-3 text-white text-start px-4 d-flex align-items-center" 
            style={{ backgroundColor: '#212f3d', borderRadius: '15px' }}
            onClick={() => navigate('/add-event')}
          >
            <Calendar size={20} className="me-3" /> <span className="fw-bold">Add Event Date</span>
          </button>

          <button 
            className="btn w-100 py-3 text-white text-start px-4 d-flex align-items-center" 
            style={{ backgroundColor: '#f39c12', borderRadius: '15px' }}
            onClick={() => navigate('/analytics')}
          >
            <BarChart2 size={20} className="me-3" /> <span className="fw-bold">View Analytics</span>
          </button>

          <button 
            className="btn w-100 py-3 text-white text-start px-4 d-flex align-items-center" 
            style={{ backgroundColor: '#072127', borderRadius: '15px' }}
            onClick={() => navigate('/reaction-setting')}
          >
            <Settings size={20} className="me-3" /> <span className="fw-bold">Reaction Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;