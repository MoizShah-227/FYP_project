import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import admin from "../assets/admin.png";
import api from "../../config/axiosConfig.js";
import EmojiConvertor from 'emoji-js';

const EMOJI_OPTIONS = ["👍", "❤️", "🎉", "🤩", "🤔"];

const emoji = new EmojiConvertor();
emoji.replace_mode = 'unified'; 

function renderEmoji(shortcode) {
  return emoji.replace_colons(shortcode);
}
// console.log(renderEmoji(":heart:"));

const PostCard = ({ id, name, time, content, avatar }) => {
  const navigate = useNavigate();
  const [showPicker, setShowPicker] = useState(false);
  const [myReaction, setMyReaction] = useState(null);
  const pickerRef = useRef(null);

  // Local reactions state — wire to real API data as needed
  const [reactions, setReactions] = useState([
    {
      emoji: "👍",
      count: 16,
      users: [
        { name: "Raja Muhammad Fahad", avatar: null },
        { name: "Ahsan Shah", avatar: null },
        { name: "Hammad Ali", avatar: null },
        { name: "Ahsaan Ali", avatar: null },
      ],
    },
    {
      emoji: "❤️",
      count: 8,
      users: [
        { name: "Moiz Shah", avatar: null },
        { name: "Muhammad Faisal", avatar: null },
      ],
    },
  ]);

  const totalCount = reactions.reduce((sum, r) => sum + r.count, 0);
  const topEmojis = reactions.slice(0, 3).map((r) => r.emoji);
  const firstReactor = reactions[0]?.users[0]?.name?.split(" ")[0] || "";
  const remaining = totalCount - 1;
  const [emojis, setEmojis] = useState([]);

  // Close picker on outside click
  
  const getEmojis=async()=>{
    try{
      const res = await api.get("/admin/emojis");
  
      setEmojis(res.data[0].filter(e=>e.isEnable))
    }catch(err){
      console.log(err.message)
    }
  }

  useEffect(() => {
    const fetchEmojis = async () => {
      await getEmojis();
    };
    fetchEmojis();
  }, []);
  // console.log(emojis[0].E_id)
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
 }, []);

  const handleEmojiPick = (emoji) => {
    setMyReaction(emoji);
    setReactions((prev) => {
      const exists = prev.find((r) => r.emoji === emoji);
      if (exists) {
        return prev.map((r) =>
          r.emoji === emoji
            ? { ...r, count: r.count + 1, users: [{ name: "You" }, ...r.users] }
            : r
        );
      }
      return [...prev, { emoji, count: 1, users: [{ name: "You" }] }];
    });
    setShowPicker(false);
  };

  // Navigate to ReactionsScreen, passing reactions via route state
  const handleOpenReactions = (e) => {
    e.stopPropagation();
    navigate("/reactions", { state: { reactions, postId: id } });
  };

  return (
    <div
      className="card mb-4 border-0 shadow-sm"
      style={{ borderRadius: "15px", overflow: "visible" }}
    >
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-3">
          <img
            src={avatar}
            alt="profile"
            className="rounded-circle me-3"
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              border: "1px solid #eee",
            }}
          />
          <div>
            <h6 className="m-0 fw-bold" style={{ color: "#07333d" }}>
              {name}
            </h6>
            <small className="text-muted">{time}</small>
          </div>
        </div>
        <p style={{ fontSize: "0.95rem", color: "#444", lineHeight: "1.5" }}>
          {content}
        </p>
      </div>

      <div className="card-footer bg-white border-top-0 px-4 pb-3">
        <div
          className="d-flex align-items-center p-2 px-3 rounded-pill"
          style={{ backgroundColor: "#f8f9fa", position: "relative",gap: "10px" }}
          ref={pickerRef}
        >
          {/* Emoji bubbles — click to toggle picker */}
          <div
            style={{ cursor: "pointer", display: "flex", gap: "4px" }}
            onClick={() => setShowPicker((v) => !v)}
          >
            {emojis.slice(0, 3).map((e) => (
              <span key={e.E_id} style={{ fontSize: "18px" }}>
                {renderEmoji(e.emoji)}
              </span>
            ))}
          </div>

          {/* "Name +N" — navigates to ReactionsScreen */}
          {totalCount > 0 && (
            <button
              onClick={handleOpenReactions}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: "0.85rem",
                color: "#555",
                fontWeight: "600",
              }}
            >
              {firstReactor}
              {remaining > 0 ? ` +${remaining}` : ""}
            </button>
          )}

          {/* Emoji Picker Popover */}
          {showPicker && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "0",
                background: "#fff",
                borderRadius: "30px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                padding: "10px 16px",
                display: "flex",
                gap: "12px",
                zIndex: 100,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {emojis.slice(0, 5).map((emoji) => (
                <button
                  key={emoji.E_id}
                  onClick={() => handleEmojiPick(emoji.E_id)}
                  style={{
                    background: myReaction === emoji ? "#e8f0fe" : "none",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: "26px",
                    padding: "4px",
                    transform: myReaction === emoji ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.15s",
                  }}
                >
                  {renderEmoji(emoji.emoji)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function WishoraFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.post("/admin/publicAnnouncement");
        setPosts(
          response.data.map((post) => ({
            id: post.id,
            name: post.name,
            time: post.time,
            avatar: post.avatar || admin,
            content: post.content,
          }))
        );
      } catch (error) {
        console.error(
          "Failed to fetch announcements:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f0f2f5" }}>
      <Navbar />
      <div className="container py-4" style={{ maxWidth: "500px" }}>
        {loading ? (
          <p className="text-center">Loading announcements...</p>
        ) : posts.length === 0 ? (
          <p className="text-center">No public announcements available.</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} {...post} />)
        )}
      </div>
    </div>
  );
}

export default WishoraFeed;
