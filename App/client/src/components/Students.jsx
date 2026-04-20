import React, { useEffect, useRef, useState } from 'react';
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
        // console.log("favourite students", res.data[0]);
        setfavStudents(res.data[0].map(item => item.u_id));

      }catch(error){
      console.error('Failed to fetch favourite:', error);
    }
  }

  const fetchBlocked = async () => {
    try {
        const res = await api.get(`/user/blocked/${user.id}`);
        // console.log("Blocked students", res.data[0]);
        setblockedstudents(res.data[0].map(item => item.u_id));

      }catch(error){
      console.error('Failed to fetch favourite:', error);
    }
  }
  
  const user1 = JSON.parse(localStorage.getItem("user")) || {};

  const toggleFavourite = async (studentId) => {
    const checkFavourite = favstudents.includes(studentId);
    try {
      if(checkFavourite){
        await api.post(`/user/remove`, {
          userid: user1.id,
          favid: studentId
        })
        setfavStudents(favstudents.filter(id => id !== studentId));
        setRefresh((prev) => !prev);
      }else{
          await api.post(`/user/favourite`, {
            userid: user1.id,
            favid: studentId
          })
          setfavStudents([...favstudents, studentId]);
          setRefresh((prev) => !prev);
      }
      
    } catch (error) {
      console.error('Failed to toggle favourite:', error);
    }
  };

  const toggleBlock = async (studentId) => {
    const checkBlock = blockedstudents.includes(studentId);

    try {
      if(checkBlock){
        console.log("unblocking student", studentId);
        console.log("user student", user1.id);
        await api.post(`/user/unblock/`, {
          userid: user1.id,
          blockId: studentId
        })
        setblockedstudents(blockedstudents.filter(id => id !== studentId));
        setRefresh((prev) => !prev);
      }else{

        await api.post(`/user/block/`, {
          userid: user1.id,
          blockId: studentId
        }, { withCredentials: true });
        setStudents((prev) =>
          prev.map((s) =>
            s._id === studentId ? { ...s, isBlocked: !s.isBlocked } : s
      )
    );
    setblockedstudents([...blockedstudents, studentId]);
    setRefresh((prev) => !prev);
  }
    } catch (error) {
      console.error('Failed to toggle block:', error);
    }
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

      <div className="container py-3">

        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="btn border-0 p-0 me-2"
          >
            <ArrowLeft size={20} color="#07333d" />
          </button>
          <h5 className="m-0 fw-bold" style={{ color: '#07333d' }}>Students</h5>
        </div>

        {/* Search Bar */}
        <div
          className="d-flex align-items-center mb-4 px-3"
          style={{
            border: '1px solid #ddd',
            borderRadius: '10px',
            backgroundColor: '#fff',
            height: '44px',
          }}
        >
          <Search size={18} color="#aaa" className="me-2" />
          <input
            type="text"
            placeholder=""
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '14px',
              color: '#333',
              backgroundColor: 'transparent',
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
                  borderRadius: '8px',
                  marginBottom: '2px',
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
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid #ccc',
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
                    onClick={() => toggleFavourite(student.u_id)}
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
                    onClick={() => toggleBlock(student.u_id)}
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