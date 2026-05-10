import React, { useState } from 'react';
import { X, ArrowLeft, Plus } from 'lucide-react';
import api from '../../config/axiosConfig.js';

export default function SemesterSectionMessageModal({
  isOpen,
  onClose,
  onBack,
  teacherId,
  selectedSemesters,
  selectedSections,
}) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    const body = message.trim();
    const tid = Number(teacherId);
    if (!Number.isFinite(tid)) return alert('Teacher not found.');
    if (!body) return alert('Please enter a message.');
    if (!selectedSemesters || Object.keys(selectedSemesters).length === 0) {
      return alert('Please select semester filter.');
    }
    setSending(true);
    try {
      const res = await api.post('/message/send-semester-section', {
        teacher_id: tid,
        message: body,
        semester_filters: selectedSemesters,
        sections: Array.isArray(selectedSections) ? selectedSections : [],
      });
      const count = Number(res.data?.totalStudents || 0);
      alert(`Message sent to ${count} student${count === 1 ? '' : 's'}.`);
      setMessage('');
      onClose();
    } catch (e) {
      console.error(e.response?.data || e.message);
      alert(e.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white mx-3"
        style={{ maxWidth: 400, width: '100%', borderRadius: 20, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{ borderBottom: '1px solid #f0f0f0' }}
        >
          <span style={{ fontSize: 17, fontWeight: 600, color: '#07333d' }}>Message</span>
          <button
            className="btn p-0 border-0 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 30, height: 30, background: '#f5f5f5' }}
            onClick={onClose}
          >
            <X size={15} color="#888" />
          </button>
        </div>

        <div className="px-4 pt-3 pb-4">
          <button
            className="btn p-0 border-0 d-flex align-items-center gap-1 mb-3"
            style={{ color: '#888', fontSize: 14 }}
            onClick={onBack}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <label className="small fw-bold mb-2">Message:</label>
          <div className="position-relative mb-4">
            <textarea
              className="form-control border shadow-sm"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              style={{ borderRadius: '12px', resize: 'none', border: '1px solid #eee' }}
            />
            <div className="position-absolute start-0 bottom-0 m-3 text-muted pointer-events-none">
              <Plus size={20} />
            </div>
          </div>

          <button
            className="btn w-100 py-3 text-white fw-bold shadow-sm"
            style={{ backgroundColor: '#ffa02e', borderRadius: '12px' }}
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
}
