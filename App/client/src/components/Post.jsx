import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import admin from "../assets/admin.png";
import api from "../../config/axiosConfig.js";

// Keep PostCard here
const PostCard = ({ name, time, content, avatar }) => (
  <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
    <div className="card-body p-4">
      <div className="d-flex align-items-center mb-3">
        <img 
          src={avatar} 
          alt="profile" 
          className="rounded-circle me-3" 
          style={{ width: '50px', height: '50px', objectFit: 'cover', border: '1px solid #eee' }} 
        />
        <div>
          <h6 className="m-0 fw-bold" style={{ color: '#07333d' }}>{name}</h6>
          <small className="text-muted">{time}</small>
        </div>
      </div>
      <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.5' }}>{content}</p>
    </div>
    <div className="card-footer bg-white border-top-0 px-4 pb-3">
      <div className="d-flex align-items-center p-2 rounded-pill" style={{ backgroundColor: '#f8f9fa', width: 'fit-content' }}>
        <span className="me-2">👍</span>
        <span className="me-2">❤️</span>
        <small className="text-muted fw-bold">Ahsan Abbasi+ 4</small>
      </div>
    </div>
  </div>
);

function WishoraFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.post("/admin/publicAnnouncement");
        setPosts(response.data.map(post => ({
          id: post.id,
          name: post.name,
          time: post.time,
          avatar: post.avatar || admin,
          content: post.content
        })));
      } catch (error) {
        console.error("Failed to fetch announcements:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f0f2f5' }}>
      <Navbar /> 
      <div className="container py-4" style={{ maxWidth: '500px' }}>
        {loading ? (
          <p className="text-center">Loading announcements...</p>
        ) : posts.length === 0 ? (
          <p className="text-center">No public announcements available.</p>
        ) : (
          posts.map(post => <PostCard key={post.id} {...post} />)
        )}
      </div>
    </div>
  );
}

export default WishoraFeed;