import React, { useState } from 'react';
import { X, BookOpen, GraduationCap, Star, Award } from 'lucide-react';

const options = [
  {
    id: 'course',
    label: 'Course',
    sub: 'Send to specific course',
    Icon: BookOpen,
    bg: '#eef3ff',
    color: '#4361ee',
  },
  {
    id: 'semester',
    label: 'Semester',
    sub: 'Send by department & semester',
    Icon: GraduationCap,
    bg: '#f0f7ee',
    color: '#2d8a4e',
  },
  {
    id: 'favourites',
    label: 'Favourite Students',
    sub: 'Your favourite students',
    Icon: Star,
    bg: '#fffbea',
    color: '#e6a817',
  },
  {
    id: 'alumni',
    label: 'Alumni',
    sub: 'Past students',
    Icon: Award,
    bg: '#fef0f0',
    color: '#e05c5c',
  },
];

const CreatePostModal = ({ isOpen, onClose }) => {
  const [selected, setSelected] = useState(null);

  if (!isOpen) return null;

  const handleSelect = (id) => {
    setSelected(id);
    console.log(id);
    // navigate to next screen or pass id up
  };

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={handleClose}
    >
      <div
        className="bg-white mx-3"
        style={{ maxWidth: 400, width: '100%', borderRadius: 20, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{ borderBottom: '1px solid #f0f0f0' }}
        >
          <span style={{ fontSize: 17, fontWeight: 600, color: '#07333d' }}>Create Post</span>
          <button
            className="btn p-0 border-0 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 30, height: 30, background: '#f5f5f5' }}
            onClick={handleClose}
          >
            <X size={15} color="#888" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pt-3 pb-4">
          {/* Back */}
          <button
            className="btn p-0 border-0 d-flex align-items-center gap-1 mb-3"
            style={{ color: '#888', fontSize: 14 }}
            onClick={handleClose}
          >
            ← Back
          </button>

          <p className="mb-3" style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>
            Send to:
          </p>

          <div className="d-flex flex-column gap-2">
            {options.map(({ id, label, sub, Icon, bg, color }) => (
              <div
                key={id}
                className="d-flex align-items-center p-3 rounded-3"
                style={{
                  border: '1px solid #efefef',
                  cursor: 'pointer',
                  gap: 13,
                  background: selected === id ? '#fafafa' : '#fff',
                  transition: 'background 0.15s',
                }}
                onClick={() => handleSelect(id)}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color={color} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="m-0" style={{ fontSize: 15, fontWeight: 600, color: '#07333d' }}>
                    {label}
                  </p>
                  <p className="m-0" style={{ fontSize: 12, color: '#999' }}>
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;