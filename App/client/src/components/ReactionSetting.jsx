import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axiosConfig';
import EmojiConvertor from "emoji-js";

function ReactionSettings() {
  const navigate = useNavigate();
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  let emoji = new EmojiConvertor();
  emoji.replace_mode = "unified";
  emoji.allow_native = true;
  // Fetch reactions from backend
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const res = await api.get('/admin/emojis', {
          withCredentials: true
        });

        setReactions(res.data[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReactions();
  }, [setReactions]);

  // Toggle reaction on/off and update backend
  const handleToggle = async (id, currentStatus) => {
    // 1️⃣ Optimistic UI update
    setReactions(prev =>
      prev.map(r => r._id === id ? { ...r, isEnable: !currentStatus } : r)
    );
    try {
      // 2️⃣ Send updated status to backend
      const response = await api.put("/admin/emojis", {
        id: id,
        status: !currentStatus  // send the new status, not currentStatus
      });

      console.log(response)
      window.location.reload();
    } catch (err) {
      console.error("Failed to update emoji:", err);
  
      // 3️⃣ Revert UI if backend fails
      setReactions(prev =>
        prev.map(r => r._id === id ? { ...r, enabled: currentStatus } : r)
      );
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f7' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid #efefef',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <ArrowLeft size={22} color="#07333d" />
        </button>
        <h6 style={{ margin: 0, fontWeight: '600', fontSize: '16px', color: '#07333d' }}>
          Reaction Settings
        </h6>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '12px 0' }}>
        {loading && (
          <p style={{ textAlign: 'center', marginTop: '2rem', color: '#888' }}>Loading...</p>
        )}

        {error && (
          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>{error}</p>
        )}

        {!loading && !error && (
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', margin: '0 12px', overflow: 'hidden' }}>
            {reactions.map((reaction, index) => (
              <div
                key={reaction._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderBottom: index !== reactions.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                {/* Emoji + Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '22px', lineHeight: 1 }}>{emoji.replace_colons(reaction.emoji)}</span>
                  <span style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: '400' }}>
                    {reaction.name}
                  </span>
                </div>

                {/* Toggle Checkbox */}
                <div
                  onClick={() => handleToggle(reaction.E_id, reaction.isEnable===null?false:reaction.isEnable)}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    backgroundColor: reaction.isEnable ? '#07333d' : '#fff',
                    border: reaction.isEnable ? '2px solid #07333d' : '2px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  {reaction.isEnable && (
                    <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReactionSettings;