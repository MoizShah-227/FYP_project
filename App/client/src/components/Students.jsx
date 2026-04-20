import React, { useEffect, useState } from 'react';
import { ArrowLeft, Search, Heart, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../config/axiosConfig';

function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [favstudents, setfavStudents] = useState([]);
  const [blockedstudents, setblockedstudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, studentId: null, studentName: '', type: '' });

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    fetchStudents();
    fetchFavourite();
    fetchBlocked();
  }, [refresh]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/user/students', { withCredentials: true });
      setStudents(res.data[0]);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavourite = async () => {
    try {
      const res = await api.get(`/user/favourite/${user.id}`);
      setfavStudents(res.data[0].map(item => item.u_id));
    } catch (error) {
      console.error('Failed to fetch favourite:', error);
    }
  };

  const fetchBlocked = async () => {
    try {
      const res = await api.get(`/user/blocked/${user.id}`);
      setblockedstudents(res.data[0].map(item => item.u_id));
    } catch (error) {
      console.error('Failed to fetch blocked:', error);
    }
  };

  const toggleFavourite = async (studentId) => {
    const checkFavourite = favstudents.includes(studentId);
    try {
      if (checkFavourite) {
        await api.post(`/user/remove`, { userid: user.id, favid: studentId });
        setfavStudents(favstudents.filter(id => id !== studentId));
      } else {
        await api.post(`/user/favourite`, { userid: user.id, favid: studentId });
        setfavStudents([...favstudents, studentId]);
      }
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error('Failed to toggle favourite:', error);
    }
  };

  const toggleBlock = async (studentId) => {
    const checkBlock = blockedstudents.includes(studentId);
    try {
      if (checkBlock) {
        await api.post(`/user/unblock/`, { userid: user.id, blockId: studentId });
        setblockedstudents(blockedstudents.filter(id => id !== studentId));
      } else {
        await api.post(`/user/block/`, { userid: user.id, blockId: studentId }, { withCredentials: true });
        setblockedstudents([...blockedstudents, studentId]);
      }
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error('Failed to toggle block:', error);
    }
  };

  const handleConfirm = () => {
    if (confirmModal.type === 'favourite') toggleFavourite(confirmModal.studentId);
    if (confirmModal.type === 'block') toggleBlock(confirmModal.studentId);
    setConfirmModal({ show: false, studentId: null, studentName: '', type: '' });
  };

  const handleCancel = () => {
    setConfirmModal({ show: false, studentId: null, studentName: '', type: '' });
  };

  const filteredStudents = students.filter((s) =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  return (
    <div className="min-vh-100 bg-white">
      <Navbar />

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div
            style={{
              backgroundColor: '#fff', borderRadius: '12px',
              padding: '28px 24px', width: '300px', textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <h6 className="fw-bold mb-2" style={{ color: '#07333d' }}>Confirmation</h6>
            <p style={{ fontSize: '14px', color: '#333', marginBottom: '24px' }}>
              Do you want to {confirmModal.type === 'block'
                ? (blockedstudents.includes(confirmModal.studentId) ? 'unblock' : 'block')
                : (favstudents.includes(confirmModal.studentId) ? 'remove from favourites' : 'add to favourites')
              } <strong>{confirmModal.studentName}</strong>?
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button
                onClick={handleCancel}
                style={{
                  backgroundColor: '#07333d', color: '#fff',
                  border: 'none', borderRadius: '8px',
                  padding: '8px 28px', cursor: 'pointer', fontWeight: '500', fontSize: '14px'
                }}
              >
                No
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  backgroundColor: '#f4a130', color: '#fff',
                  border: 'none', borderRadius: '8px',
                  padding: '8px 28px', cursor: 'pointer', fontWeight: '500', fontSize: '14px'
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container py-3">

        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <button onClick={() => navigate(-1)} className="btn border-0 p-0 me-2">
            <ArrowLeft size={20} color="#07333d" />
          </button>
          <h5 className="m-0 fw-bold" style={{ color: '#07333d' }}>Students</h5>
        </div>

        {/* Search Bar */}
        <div
          className="d-flex align-items-center mb-4 px-3"
          style={{
            border: '1px solid #ddd', borderRadius: '10px',
            backgroundColor: '#fff', height: '44px',
          }}
        >
          <Search size={18} color="#aaa" className="me-2" />
          <input
            type="text"
            placeholder=""
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none', outline: 'none', width: '100%',
              fontSize: '14px', color: '#333', backgroundColor: 'transparent',
            }}
          />
        </div>

        {/* Table Header */}
        <div
          className="d-flex justify-content-between align-items-center px-2 mb-1"
          style={{ fontSize: '13px', color: '#555', fontWeight: '500' }}
        >
          <span style={{ flex: 1 }}>Name</span>
          <span style={{ minWidth: '80px', textAlign: 'right' }}>Favourite</span>
        </div>

        {/* Student List */}
        <div>
          {filteredStudents.length === 0 ? (
            <p className="text-center text-muted mt-4" style={{ fontSize: '14px' }}>
              No students found
            </p>
          ) : (
            filteredStudents.map((student, index) => (
              <div
                key={student._id}
                className="d-flex align-items-center justify-content-between px-2 py-2"
                style={{
                  backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#fff',
                  borderRadius: '8px', marginBottom: '2px',
                }}
              >
                {/* Avatar + Name */}
                <div className="d-flex align-items-center gap-2" style={{ flex: 1 }}>
                  <img
                    src={
                      student.image
                        ? `http://localhost:5004/uploads/${student.image}`
                        : '/default-avatar.png'
                    }
                    alt={student.name}
                    style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      objectFit: 'cover', border: '1px solid #ccc',
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#222', fontWeight: '500' }}>
                    {student.name}
                  </span>
                </div>

                {/* Favourite + Block Icons */}
                <div
                  className="d-flex align-items-center"
                  style={{ gap: '10px', minWidth: '80px', justifyContent: 'flex-end' }}
                >
                  {/* Heart / Favourite */}
                  <button
                    onClick={() => setConfirmModal({
                      show: true,
                      studentId: student.u_id,
                      studentName: student.name,
                      type: 'favourite'
                    })}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <Heart
                      size={20}
                      color={favstudents?.includes(student.u_id) ? '#e53935' : '#aaa'}
                      fill={favstudents?.includes(student.u_id) ? '#e53935' : 'none'}
                    />
                  </button>

                  {/* Block */}
                  <button
                    onClick={() => setConfirmModal({
                      show: true,
                      studentId: student.u_id,
                      studentName: student.name,
                      type: 'block'
                    })}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <Ban
                      size={20}
                      color={blockedstudents?.includes(student.u_id) ? '#e53935' : '#aaa'}
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default Students;