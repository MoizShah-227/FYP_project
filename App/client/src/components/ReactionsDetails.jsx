import React, { useState } from 'react';
import { Home, Bell, Grid, UserCircle, ArrowLeft } from 'lucide-react';
import admin from '../assets/admin.png';

// 1. New Detail Component for the Reaction Screen
const ReactionsDetail = ({ reactions, onBack }) => (
  <div className="min-vh-100 bg-white">
    {/* Header matching your image */}
    <nav className="p-3 d-flex align-items-center border-bottom sticky-top bg-white">
      <button onClick={onBack} className="btn border-0 p-0 me-3">
        <ArrowLeft size={24} color="#07333d" />
      </button>
      <h5 className="m-0 fw-bold" style={{ color: '#07333d' }}>Reactions</h5>
    </nav>

    {/* Filter Tabs matching image */}
    <div className="p-3 d-flex gap-3 align-items-center">
      <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#e9ecef', color: '#333' }}>
        All {reactions.totalCount}
      </span>
      <span className="d-flex align-items-center small">
        👍 <span className="ms-1 fw-bold">{reactions.likeCount}</span>
      </span>
      <span className="d-flex align-items-center small">
        ❤️ <span className="ms-1 fw-bold">{reactions.loveCount}</span>
      </span>
    </div>

    {/* List of Reacted Users */}
    <div className="px-3">
      {reactions.userList.map((user, index) => (
        <div key={index} className="d-flex align-items-center py-3">
          <div className="position-relative me-3">
            <img 
              src={user.avatar} 
              className="rounded-circle" 
              style={{ width: '55px', height: '55px', objectFit: 'cover' }} 
            />
            {/* Small icon overlay */}
            <span 
              className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
              style={{ width: '20px', height: '20px', fontSize: '10px' }}
            >
              {user.type === 'like' ? '👍' : '❤️'}
            </span>
          </div>
          <span className="fw-bold" style={{ color: '#333' }}>{user.name}</span>
        </div>
      ))}
    </div>
  </div>
);

// 2. Updated PostCard with click handler
const PostCard = ({ name, time, content, avatar, reactions, onShowDetails }) => (
  <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
    <div className="card-body p-4">
      <div className="d-flex align-items-center mb-3">
        <img src={avatar} className="rounded-circle me-3" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
        <div>
          <h6 className="m-0 fw-bold" style={{ color: '#07333d' }}>{name}</h6>
          <small className="text-muted">{time}</small>
        </div>
      </div>
      <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.5' }}>{content}</p>
    </div>

    {/* Reaction Bar: Now clickable */}
    <div className="card-footer bg-white border-top-0 px-4 pb-3">
      <div 
        className="d-flex align-items-center p-2 rounded-pill" 
        style={{ backgroundColor: '#f8f9fa', width: 'fit-content', cursor: 'pointer' }}
        onClick={onShowDetails}
      >
        <span className="me-2">👍</span>
        <span className="me-2">❤️</span>
        <small className="text-muted fw-bold">
          {reactions.topUser} {reactions.extraCount > 0 ? `+ ${reactions.extraCount}` : ''}
        </small>
      </div>
    </div>
  </div>
);

function WishoraFeed() {
  const [viewingReactions, setViewingReactions] = useState(null);

  const posts = [
    {
      id: 1,
      name: "Nadeem",
      time: "37 min",
      avatar: admin,
      content: "Faculty Announcement: After a productive meeting...",
      reactions: {
        topUser: "Moiz shah",
        totalCount: 24,
        likeCount: 16,
        loveCount: 8,
        extraCount: 23,
        userList: [
          { name: "Moiz shah", type: "love", avatar: admin },
          { name: "Raja Muhammad Fahad", type: "like", avatar: admin },
          { name: "Ahsan Shah", type: "like", avatar: admin },
          { name: "Muhammad Faisal", type: "love", avatar: admin },
          { name: "Hammad Ali", type: "like", avatar: admin },
          { name: "Ahsaan Ali", type: "like", avatar: admin },
        ]
      }
    }
  ];

  // If viewingReactions has data, show the detail screen instead of the feed
  if (viewingReactions) {
    return <ReactionsDetail reactions={viewingReactions} onBack={() => setViewingReactions(null)} />;
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f0f2f5' }}>
      <nav className="sticky-top bg-white px-3 py-2 d-flex align-items-center justify-content-between shadow-sm">
        <div className="d-flex align-items-center">
          <div style={{ width: '4px', height: '24px', backgroundColor: '#007bff', marginRight: '10px' }}></div>
          <h4 className="m-0 fw-bold" style={{ color: '#07333d' }}>Wishora</h4>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <Home size={22} color="#555" />
          <Bell size={22} color="#555" />
          <Grid size={22} color="#555" />
          <UserCircle size={28} color="#333" />
        </div>
      </nav>

      <div className="container py-4" style={{ maxWidth: '500px' }}>
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            {...post} 
            onShowDetails={() => setViewingReactions(post.reactions)} 
          />
        ))}
      </div>
    </div>
  );
}

export default WishoraFeed;