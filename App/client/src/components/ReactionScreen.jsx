import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import api from "../../config/axiosConfig.js";
import EmojiConvertor from "emoji-js";

const emoji = new EmojiConvertor();
emoji.replace_mode = "unified";

function renderEmoji(shortcode) {
  if (typeof shortcode !== "string" || !shortcode.trim()) return "";
  const converted = emoji.replace_colons(shortcode);
  if (converted === shortcode && /^:[a-z0-9_+-]+:$/i.test(shortcode.trim())) return "";
  return converted;
}

/** DB uses `teacher` / `student` — UI labels Faculty / Student */
const isFacultyType = (userType) =>
  typeof userType === "string" && userType.toLowerCase() === "teacher";

const isStudentType = (userType) =>
  typeof userType === "string" && userType.toLowerCase() === "student";

function ReactionsScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const postId = location.state?.postId;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(!!postId);
  const [audience, setAudience] = useState("all");

  useEffect(() => {
    if (postId == null) {
      setRows([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/posts/postreactions/${postId}`);
        const list = Array.isArray(res.data) ? res.data : [];
        if (!cancelled) setRows(list);
      } catch (e) {
        console.error(e.response?.data || e.message);
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const { facultyCount, studentCount, filteredRows } = useMemo(() => {
    const faculty = rows.filter((r) => isFacultyType(r.user_type)).length;
    const student = rows.filter((r) => isStudentType(r.user_type)).length;
    let list = rows;
    if (audience === "faculty") {
      list = rows.filter((r) => isFacultyType(r.user_type));
    } else if (audience === "student") {
      list = rows.filter((r) => isStudentType(r.user_type));
    }
    return { facultyCount: faculty, studentCount: student, filteredRows: list };
  }, [rows, audience]);

  const totalCount = rows.length;

  const tabStyle = (active) => ({
    background: active ? "#e8f0fe" : "#f0f2f5",
    border: "none",
    borderRadius: "20px",
    padding: "6px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: active ? "#07333d" : "#666",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
        <Navbar />
        <p style={{ textAlign: "center", padding: "24px" }}>Loading reactions…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <Navbar />

      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          backgroundColor: "#fff",
          minHeight: "calc(100vh - 60px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 16px 10px",
            borderBottom: "1px solid #f0f2f5",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 6px 4px 0",
              fontSize: "18px",
              color: "#07333d",
              lineHeight: 1,
            }}
          >
            ←
          </button>
          <h5
            style={{
              margin: 0,
              fontWeight: "700",
              fontSize: "1.05rem",
              color: "#07333d",
            }}
          >
            Reactions
          </h5>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            borderBottom: "1px solid #f0f2f5",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => setAudience("all")}
            style={tabStyle(audience === "all")}
          >
            All {totalCount}
          </button>
          <button
            type="button"
            onClick={() => setAudience("faculty")}
            style={tabStyle(audience === "faculty")}
          >
            Faculty {facultyCount}
          </button>
          <button
            type="button"
            onClick={() => setAudience("student")}
            style={tabStyle(audience === "student")}
          >
            Student {studentCount}
          </button>
        </div>

        <div style={{ padding: "8px 0" }}>
          {!postId ? (
            <p
              style={{
                textAlign: "center",
                color: "#aaa",
                padding: "40px 0",
                fontSize: "14px",
              }}
            >
              Open reactions from a post
            </p>
          ) : filteredRows.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#aaa",
                padding: "40px 0",
                fontSize: "14px",
              }}
            >
              No reactions in this view
            </p>
          ) : (
            filteredRows.map((item, i) => {
              const emojiChar = renderEmoji(item.emoji);
              return (
                <div
                  key={`${item.u_id}-${item.E_id}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 16px",
                    borderBottom: "1px solid #f7f7f7",
                    gap: "14px",
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid #eee",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: "#d0e4f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "15px",
                          color: "#07333d",
                        }}
                      >
                        {item.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    {emojiChar ? (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "-2px",
                          left: "-2px",
                          fontSize: "15px",
                          lineHeight: 1,
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
                        }}
                      >
                        {emojiChar}
                      </span>
                    ) : null}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#1a1a1a",
                        display: "block",
                      }}
                    >
                      {item.name}
                    </span>
                    <span style={{ fontSize: "12px", color: "#888" }}>
                      {isFacultyType(item.user_type)
                        ? "Faculty"
                        : isStudentType(item.user_type)
                          ? "Student"
                          : item.user_type || ""}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default ReactionsScreen;
