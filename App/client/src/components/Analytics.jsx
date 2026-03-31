import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../config/axiosConfig.js';

function Analytics() {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/admin/mostreactions');
        setAnalyticsData(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="min-vh-100 bg-white">
      <Navbar />

      <div className="container py-3">
        <div className="d-flex align-items-center mb-4">
          <button onClick={() => navigate(-1)} className="btn border-0 p-0 me-3">
            <ArrowLeft size={24} color="#07333d" />
          </button>
          <h4 className="m-0 fw-bold" style={{ color: '#07333d' }}>Analytics</h4>
        </div>

        <h5 className="fw-bold mb-4">Most Reactions</h5>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {analyticsData.map((user) => (
              <div 
                key={user.u_id}
                className="card border-0 shadow-sm p-3"
                style={{ borderRadius: '15px', backgroundColor: '#fcfcfc' }}
              >
                <div className="d-flex align-items-center mb-1">
                  <img
                    src={user.image || "/default-avatar.png"}
                    alt={user.name}
                    className="rounded-circle me-3"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="m-0 fw-bold">{user.name}</h6>
                      <small className="text-muted">
                        {user.total_reactions} reactions
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;