import React, { useState, useEffect } from 'react';
import { Search, Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../config/axiosConfig';

const FavouriteStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [unfavourited, setUnfavourited] = useState(new Set()); // ✅ local toggle state
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    fetchFavouriteStudents();
  }, []);

  const fetchFavouriteStudents = async () => {
    try {
      const res = await api.get(`/user/favourite/${user.id}`);
      setStudents(res.data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavourite = async (studentId) => {
    // ✅ toggle locally — no isFavourite field needed
    setUnfavourited(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
    try {
      await api.post(`/user/remove`,{
        userid: user.id,
        favid: studentId
      });
      await fetchFavouriteStudents(); 
    } catch (err) {
      console.error(err);
      // rollback on error
      setUnfavourited(prev => {
        const next = new Set(prev);
        if (next.has(studentId)) next.delete(studentId);
        else next.add(studentId);
        return next;
      });
    }
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) =>
    name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

  const avatarColors = [
    { bg: '#c9e4f5', text: '#1a6a9a' },
    { bg: '#d4f5e0', text: '#1a7a3a' },
    { bg: '#f5e4c9', text: '#9a6a1a' },
    { bg: '#e4c9f5', text: '#6a1a9a' },
    { bg: '#f5c9d4', text: '#9a1a3a' },
    { bg: '#c9f5f0', text: '#1a7a6a' },
  ];

  return (
    <div className="min-vh-100 bg-white">
      <Navbar />

      <div className="container py-3">

        {/* Back header */}
        <div className="d-flex align-items-center mb-4">
          <button onClick={() => navigate(-1)} className="btn border-0 p-0 me-3">
            <ArrowLeft size={24} color="#07333d" />
          </button>
          <h4 className="m-0 fw-bold" style={{ color: '#07333d' }}>Favourite student</h4>
        </div>

        {/* Search */}
        <div
          className="d-flex align-items-center gap-2 px-3 mb-3"
          style={{ border: '1px solid #ddd', borderRadius: 10, height: 42, background: '#fff' }}
        >
          <Search size={15} color="#aaa" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent',
              fontSize: 14, color: '#333', width: '100%' }}
          />
        </div>

        {/* Column headers */}
        <div className="d-flex justify-content-between px-2 mb-1"
          style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>
          <span>Name</span>
          <span>Favourite</span>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-5" style={{ color: '#aaa', fontSize: 14 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5" style={{ color: '#aaa', fontSize: 14 }}>No students found</div>
        ) : (
          filtered.map((student, i) => {
            const { bg, text } = avatarColors[i % avatarColors.length];
            const isUnfavourited = unfavourited.has(student.u_id);
            return (
              <div
                key={student.S_id}
                className="d-flex align-items-center justify-content-between px-2"
                style={{
                  background: i % 2 === 0 ? '#f5f5f5' : '#fff',
                  paddingTop: 9, paddingBottom: 9,
                  borderBottom: '0.5px solid #f0f0f0',
                  borderRadius: 8,
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  {student.avatar ? (
                    <img
                      src={`http://localhost:5004${student.avatar}`}
                      alt={student.name}
                      style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: bg, color: text, flexShrink: 0,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 11, fontWeight: 600,
                    }}>
                      {initials(student.name)}
                    </div>
                  )}
                  <span style={{ fontSize: 14, color: '#07333d' }}>{student.name}</span>
                </div>

                {/* ✅ red by default, gray if toggled off */}
                <Heart
                  size={20}
                  fill={isUnfavourited ? 'none' : '#e74c3c'}
                  color={isUnfavourited ? '#ddd' : '#e74c3c'}
                  style={{ cursor: 'pointer', flexShrink: 0 }}
                  onClick={() => toggleFavourite(student.u_id)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FavouriteStudents;