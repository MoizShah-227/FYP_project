import React, { useState } from 'react';
import { X } from 'lucide-react';

// Mock teacher data - replace with your actual data
const TEACHERS = [
  { id: 1, name: 'Sir Saeed Watto', designation: 'PhD in Computer Science', avatar: null },
  { id: 2, name: 'Sir Hassan', designation: 'PhD in Computer Science', avatar: null },
  { id: 3, name: 'Sir Ali Raza', designation: 'PhD in Software Engineering', avatar: null },
];

const EMOJIS = ['❤️', '🍓', '🧁', '🎂', '🍪', '🎁', '🎊', '🎈', '🎆', '✨'];

// ── Avatar Placeholder ───────────────────────────────────────────────
const AvatarPlaceholder = ({ name, size = 44 }) => {
  const initials = name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#d0e8ed',
        color: '#07333d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: size * 0.35,
        flexShrink: 0,
        border: '2px solid #b0d8e0',
      }}
    >
      {initials}
    </div>
  );
};

// ── Modal 2: Wish Form ───────────────────────────────────────────────
const WishModal = ({ teacher, onClose, onSend }) => {
  const [selectedEmojis, setSelectedEmojis] = useState(new Set());
  const [message, setMessage] = useState('');

  const toggleEmoji = (em) => {
    setSelectedEmojis(prev => {
      const next = new Set(prev);
      next.has(em) ? next.delete(em) : next.add(em);
      return next;
    });
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 3000, backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg position-relative"
        style={{ maxWidth: '360px', width: '92%', padding: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-1">
          <div>
            <h5 className="fw-bold mb-0" style={{ color: '#07333d' }}>Wish {teacher.name}</h5>
            <small className="text-muted">Select Emojis:</small>
          </div>
          <button
            className="btn p-0 border-0"
            style={{ color: '#aaa', fontSize: '1.1rem' }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Message */}
        <div className="mt-3 mb-3">
          <label className="fw-bold small mb-1 d-block" style={{ color: '#07333d' }}>Message:</label>
          <textarea
            className="w-100 rounded-3"
            rows={4}
            placeholder="Happy Teacher's Day!"
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{
              border: '1.5px solid #e0e0e0',
              padding: '10px 12px',
              fontSize: '0.88rem',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              color: '#333',
            }}
          />
        </div>

        {/* Emoji Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {EMOJIS.map(em => (
            <button
              key={em}
              onClick={() => toggleEmoji(em)}
              style={{
                background: selectedEmojis.has(em) ? '#d9eff4' : '#f4f4f4',
                border: selectedEmojis.has(em) ? '2px solid #07333d' : '2px solid transparent',
                borderRadius: '10px',
                fontSize: '1.5rem',
                padding: '8px 4px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
              }}
            >
              {em}
            </button>
          ))}
        </div>

        {/* Send Button */}
        <button
          className="w-100 border-0 rounded-3 fw-bold"
          style={{
            background: '#07333d',
            color: 'white',
            padding: '14px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          onClick={() => onSend({ teacher, emojis: [...selectedEmojis], message })}
        >
          Send Wish
        </button>
      </div>
    </div>
  );
};

// ── Modal 1: Teacher Selection ───────────────────────────────────────
const WishTeacherDayModal = ({ isOpen, onClose, teachers = TEACHERS }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [step, setStep] = useState('select'); // 'select' | 'wish' | 'wished'

  if (!isOpen) return null;

  const selectedTeacher = teachers.find(t => t.id === selectedId);

  const handleClose = () => {
    setSelectedId(null);
    setStep('select');
    onClose();
  };

  // Step: Wish Form
  if (step === 'wish' && selectedTeacher) {
    return (
      <WishModal
        teacher={selectedTeacher}
        onClose={() => setStep('select')}
        onSend={() => setStep('wished')}
      />
    );
  }

  // Step: Wished confirmation
  if (step === 'wished' && selectedTeacher) {
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-4 shadow-lg"
          style={{ maxWidth: '360px', width: '92%', padding: '32px 24px', textAlign: 'center' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
          <h5 className="fw-bold" style={{ color: '#07333d' }}>Wish Sent!</h5>
          <p className="text-muted small mb-4">
            Your Teacher's Day wish has been sent to <strong>{selectedTeacher.name}</strong>.
          </p>
          <button
            className="w-100 border-0 rounded-3 fw-bold"
            style={{
              background: '#07333d',
              color: 'white',
              padding: '12px',
              fontSize: '0.95rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onClick={handleClose}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Step: Teacher Selection
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg"
        style={{ maxWidth: '360px', width: '92%', padding: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-1">
          <div>
            <h5 className="fw-bold mb-0" style={{ color: '#07333d' }}>Wish Teacher Day</h5>
            <small className="text-muted">Select Teacher:</small>
          </div>
          <button className="btn p-0 border-0" onClick={handleClose}>
            <X size={20} color="#aaa" />
          </button>
        </div>

        {/* Teacher List */}
        <div className="mt-3 d-flex flex-column gap-2">
          {teachers.map(teacher => (
            <div
              key={teacher.id}
              onClick={() => setSelectedId(teacher.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: selectedId === teacher.id
                  ? '2px solid #07333d'
                  : '2px solid #e8e8e8',
                background: selectedId === teacher.id ? '#f0f8fa' : 'white',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {teacher.avatar
                ? <img src={teacher.avatar} alt={teacher.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : <AvatarPlaceholder name={teacher.name} />
              }
              <div>
                <div className="fw-bold" style={{ color: '#07333d', fontSize: '0.95rem' }}>
                  {teacher.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#888' }}>
                  {teacher.designation}
                </div>
              </div>

              {/* Selection indicator */}
              {selectedId === teacher.id && (
                <div className="ms-auto">
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#07333d',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          className="w-100 border-0 rounded-3 fw-bold mt-4"
          disabled={!selectedId}
          style={{
            background: selectedId ? '#07333d' : '#ccc',
            color: 'white',
            padding: '14px',
            fontSize: '1rem',
            cursor: selectedId ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            transition: 'background 0.2s',
          }}
          onClick={() => selectedId && setStep('wish')}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default WishModal;