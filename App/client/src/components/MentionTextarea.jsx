import React, { useCallback, useEffect, useRef, useState } from "react";
import api from "../../config/axiosConfig.js";

/**
 * Textarea with # mention: loads users who may appear as Announcements.created_by (students, teachers, admins).
 * onTaggedAuthorsChange: ordered unique u_ids to post on behalf of.
 */
export default function MentionTextarea({
  value,
  onChange,
  onTaggedAuthorsChange,
  enabled,
  candidatesUrl = "/user/announcement-author-candidates",
  rows = 6,
  placeholder,
  className,
  style,
}) {
  const wrapRef = useRef(null);
  const taRef = useRef(null);
  const [candidates, setCandidates] = useState([]);
  const [staffLoaded, setStaffLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [mentionStart, setMentionStart] = useState(null);
  const taggedIdsRef = useRef(new Set());

  const loadStaff = useCallback(async () => {
    if (staffLoaded || !enabled) return;
    try {
      const res = await api.get(candidatesUrl);
      const list = Array.isArray(res.data) ? res.data : [];
      setCandidates(list);
    } catch (e) {
      console.error(e.response?.data || e.message);
      setCandidates([]);
    } finally {
      setStaffLoaded(true);
    }
  }, [enabled, staffLoaded, candidatesUrl]);

  useEffect(() => {
    if (enabled && open && !staffLoaded) loadStaff();
  }, [enabled, open, staffLoaded, loadStaff]);

  const pushAuthor = useCallback(
    (uId) => {
      if (uId == null || Number.isNaN(Number(uId))) return;
      taggedIdsRef.current.add(Number(uId));
      onTaggedAuthorsChange?.(Array.from(taggedIdsRef.current));
    },
    [onTaggedAuthorsChange]
  );

  const filtered = candidates.filter((u) => {
    const q = (filter || "").toLowerCase();
    if (!q) return true;
    const name = (u.name || "").toLowerCase();
    const reg = String(u.reg_no || "").toLowerCase();
    return name.includes(q) || reg.includes(q);
  }).slice(0, 8);

  const handleChange = (e) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    onChange(text);

    if (!enabled) {
      setOpen(false);
      return;
    }

    const before = text.slice(0, cursor);
    const hashIdx = before.lastIndexOf("#");
    if (hashIdx === -1) {
      setOpen(false);
      setMentionStart(null);
      return;
    }

    const afterHash = before.slice(hashIdx + 1);
    if (/\s/.test(afterHash)) {
      setOpen(false);
      setMentionStart(null);
      return;
    }

    setMentionStart(hashIdx);
    setFilter(afterHash);
    setOpen(true);
    if (!staffLoaded) loadStaff();
  };

  const selectUser = (user) => {
    if (mentionStart == null || !taRef.current) return;
    const text = value;
    const cursor = taRef.current.selectionStart;
    const before = text.slice(0, mentionStart);
    const after = text.slice(cursor);
    const insert = `#${user.name} `;
    const next = before + insert + after;
    const nextCursor = before.length + insert.length;
    onChange(next);
    pushAuthor(user.u_id);
    setOpen(false);
    setMentionStart(null);
    setFilter("");
    requestAnimationFrame(() => {
      if (taRef.current) {
        taRef.current.focus();
        taRef.current.setSelectionRange(nextCursor, nextCursor);
      }
    });
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={wrapRef} className="position-relative">
      <textarea
        ref={taRef}
        className={className}
        style={style}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
      {enabled && open && staffLoaded && (
        <ul
          className="list-group position-absolute shadow border-0 rounded-3 overflow-hidden"
          style={{
            zIndex: 3000,
            left: 0,
            right: 0,
            top: "100%",
            marginTop: 4,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {filtered.length === 0 ? (
            <li className="list-group-item py-2 small text-muted">
              {candidates.length === 0
                ? "Could not load users. Check your connection."
                : "No name or reg. no. matches — keep typing."}
            </li>
          ) : (
            filtered.map((u) => (
              <li
                key={u.u_id}
                className="list-group-item list-group-item-action py-2 small"
                style={{ cursor: "pointer" }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectUser(u)}
              >
                <span className="fw-semibold">{u.name}</span>
                <span className="text-muted ms-2 text-capitalize">({u.user_type})</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
