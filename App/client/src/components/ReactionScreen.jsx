import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

function ReactionsScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  // Reactions data passed from PostCard via navigate state
  // Shape: [{ emoji: "👍", count: 16, users: [{ name, avatar }] }, ...]
  const reactions = location.state?.reactions || [];
  const totalCount = reactions.reduce((sum, r) => sum + r.count, 0);

  const [activeFilter, setActiveFilter] = useState("all");

  // Flatten all reactors for the list
  const allReactors = reactions.flatMap((r) =>
    (r.users || []).map((u) => ({ ...u, emoji: r.emoji }))
  );

  const filteredReactors =
    activeFilter === "all"
      ? allReactors
      : allReactors.filter((r) => r.emoji === activeFilter);

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
        {/* Header */}
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

        {/* Filter Tabs */}
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
          {/* All tab */}
          <button
            onClick={() => setActiveFilter("all")}
            style={{
              background: activeFilter === "all" ? "#e8f0fe" : "#f0f2f5",
              border: "none",
              borderRadius: "20px",
              padding: "5px 14px",
              fontSize: "13px",
              fontWeight: "600",
              color: activeFilter === "all" ? "#07333d" : "#666",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            All {totalCount}
          </button>

          {/* Per-emoji tabs */}
          {reactions.map((r) => (
            <button
              key={r.emoji}
              onClick={() => setActiveFilter(r.emoji)}
              style={{
                background: activeFilter === r.emoji ? "#e8f0fe" : "#f0f2f5",
                border: "none",
                borderRadius: "20px",
                padding: "5px 12px",
                fontSize: "13px",
                fontWeight: "600",
                color: activeFilter === r.emoji ? "#07333d" : "#666",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "15px" }}>{r.emoji}</span>
              {r.count}
            </button>
          ))}
        </div>

        {/* Reactor List */}
        <div style={{ padding: "8px 0" }}>
          {filteredReactors.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#aaa",
                padding: "40px 0",
                fontSize: "14px",
              }}
            >
              No reactions yet
            </p>
          ) : (
            filteredReactors.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderBottom: "1px solid #f7f7f7",
                  gap: "14px",
                }}
              >
                {/* Avatar with emoji badge */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {item.avatar ? (
                    <img
                      src={item.avatar}
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
                  {/* Emoji badge bottom-left */}
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
                    {item.emoji}
                  </span>
                </div>

                {/* Name */}
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                  }}
                >
                  {item.name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ReactionsScreen;
