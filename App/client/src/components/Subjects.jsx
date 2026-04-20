import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../config/axiosConfig';

function Subjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const fetchSubjects = async () => {
    try {
      const res = await api.get(`/user/get-teach-courses/${user.id}`, { withCredentials: true });
      setSubjects(res.data[0]);
      console.log(res.data[0]);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <h5 className="m-0 fw-bold" style={{ color: '#07333d' }}>Subjects</h5>
        </div>

        {/* Table */}
        {subjects.length === 0 ? (
          <p className="text-center text-muted mt-4" style={{ fontSize: '14px' }}>
            No subjects found
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {/* Table Head */}
            <thead>
              <tr>
                <th
                  style={{
                    fontSize: '13px', fontWeight: '600',
                    color: '#07333d', padding: '8px 10px',
                    textAlign: 'left', borderBottom: '1px solid #ddd'
                  }}
                >
                  Code
                </th>
                <th
                  style={{
                    fontSize: '13px', fontWeight: '600',
                    color: '#07333d', padding: '8px 10px',
                    textAlign: 'left', borderBottom: '1px solid #ddd'
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    fontSize: '13px', fontWeight: '600',
                    color: '#07333d', padding: '8px 10px',
                    textAlign: 'right', borderBottom: '1px solid #ddd'
                  }}
                >
                  Cr_Hrs
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {subjects.map((subject, index) => (
                <tr
                  key={subject._id}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#fff',
                  }}
                >
                  <td
                    style={{
                      fontSize: '12px', color: '#444',
                      padding: '10px 10px', borderRadius: '4px'
                    }}
                  >
                    {subject.course_code}
                  </td>
                  <td
                    style={{
                      fontSize: '12px', color: '#444',
                      padding: '10px 10px'
                    }}
                  >
                    {subject.name}
                  </td>
                  <td
                    style={{
                      fontSize: '12px', color: '#444',
                      padding: '10px 10px', textAlign: 'right'
                    }}
                  >
                    {subject.credit_hr}_Hrs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}

export default Subjects;