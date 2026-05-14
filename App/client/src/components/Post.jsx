import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import admin from "../assets/admin.png";
import api from "../../config/axiosConfig.js";

const REACTION_PREVIEW_EMOJIS = ["👍", "❤️"];

const API_ORIGIN = "http://localhost:5004";

/** Resolves: full URL | '/uploads/...' | 'profile/x.jpg' | 'x.jpg' → absolute URL. */
function resolveUserImage(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) return `${API_ORIGIN}${s}`;
  return `${API_ORIGIN}/uploads/${s.replace(/^uploads\//i, "")}`;
}

const PostCard = ({ id, name, time, content, avatar, postImage, reactionUserCount = 0 }) => {
  const navigate = useNavigate();

  const safeReactionCount =
    typeof reactionUserCount === "number" && !Number.isNaN(reactionUserCount)
      ? reactionUserCount
      : 0;

  const handleOpenReactions = (e) => {
    e.stopPropagation();
    navigate("/reactions", { state: { postId: id } });
  };

  const avatarUrl = resolveUserImage(avatar) || admin;
  const postImageUrl = resolveUserImage(postImage);

  return (
    <div
      className="card mb-4 border-0 shadow-sm"
      style={{ borderRadius: "15px", overflow: "visible" }}
    >
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-3">
          <img
            src={avatarUrl}
            alt={`${name || "User"}'s profile`}
            className="rounded-circle me-3"
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              border: "1px solid #eee",
            }}
            onError={(e) => {
              if (e.currentTarget.src !== admin) {
                e.currentTarget.onerror = null;
                e.currentTarget.src = admin;
              }
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
        {postImageUrl ? (
          <img
            src={postImageUrl}
            alt="post attachment"
            className="w-100 mt-2"
            style={{
              maxHeight: 360,
              objectFit: "cover",
              borderRadius: 12,
              border: "1px solid #eee",
            }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
      </div>

      <div className="card-footer bg-white border-top-0 px-4 pb-3">
        <button
          type="button"
          onClick={handleOpenReactions}
          aria-label={`Reactions, ${reactionUserCount} people`}
          className="d-flex align-items-center px-3 py-2 rounded-pill border-0 gap-2"
          style={{
            backgroundColor: "#f8f9fa",
            cursor: "pointer",
            fontSize: "0.85rem",
            color: "#555",
            fontWeight: "600",
          }}
        >
          <span className="d-flex align-items-center" style={{ gap: "4px", fontSize: "18px", lineHeight: 1 }}>
            {REACTION_PREVIEW_EMOJIS.map((icon) => (
              <span key={icon} aria-hidden>
                {icon}
              </span>
            ))}
          </span>
          <span>{safeReactionCount}</span>
        </button>
      </div>
    </div>
  );
};

/** How often to refetch the feed (ms). Silent refresh — no full-page loading flash. */
const FEED_POLL_MS = 30_000;

function WishoraFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAnnouncements = async (silent = false) => {
      try {
        const raw = localStorage.getItem("user");
        const user = raw ? JSON.parse(raw) : null;
        const userId = user?.id ?? user?.u_id;
        if (userId == null || Number.isNaN(Number(userId))) {
          console.error("No user id in localStorage; cannot load posts");
          if (!cancelled) {
            setPosts([]);
            if (!silent) setLoading(false);
          }
          return;
        }
        const response = await api.get("/posts/public", {
          params: { userId },
          withCredentials: true,
        });
        if (cancelled) return;
        const list = Array.isArray(response.data) ? response.data : [];
        setPosts(
          list.map((post) => ({
            id: post.id,
            name: post.name,
            time: post.time,
            avatar: post.avatar || admin,
            postImage: post.postImage || null,
            content: post.content,
            reactionUserCount: post.reactionUserCount ?? 0,
          }))
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to fetch announcements:",
            error.response?.data || error.message
          );
        }
      } finally {
        if (!cancelled && !silent) setLoading(false);
      }
    };

    fetchAnnouncements(false);

    const intervalId = setInterval(() => fetchAnnouncements(true), FEED_POLL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchAnnouncements(true);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
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
