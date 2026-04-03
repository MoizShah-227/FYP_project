import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Checkbox } from './modalUtils';
import { nextBtnStyle } from './modalStyles';
const DEFAULT_SECTIONS = [
  'CS 1A', 'CS 1B', 'CS 1C', 'SE 6A',
  'SE 6B', 'SE 6C', 'SE 7A', 'AI 2A',
  'AI 2B', 'AI 7A',
];

const SectionModal = ({ isOpen, onClose, onBack, onNext, sections = DEFAULT_SECTIONS }) => {
  const [selected, setSelected] = useState([]);

  if (!isOpen) return null;

  const toggle = (sec) => setSelected(prev =>
    prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]
  );

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div className="bg-white mx-3"
        style={{ maxWidth: 400, width: '100%', borderRadius: 20, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>

        <div className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{ borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: '#07333d' }}>Section</span>
          <button className="btn p-0 border-0 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 30, height: 30, background: '#f5f5f5' }} onClick={onClose}>
            <X size={15} color="#888" />
          </button>
        </div>

        <div className="px-4 pt-3 pb-4">
          <button className="btn p-0 border-0 d-flex align-items-center gap-1 mb-3"
            style={{ color: '#888', fontSize: 14 }} onClick={onBack}>
            ← Back
          </button>

          <p className="mb-3" style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>Section:</p>

          {/* 2-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
            {sections.map(sec => (
              <div key={sec} className="d-flex align-items-center gap-2"
                style={{ cursor: 'pointer' }} onClick={() => toggle(sec)}>
                <Checkbox checked={selected.includes(sec)} />
                <span style={{ fontSize: 14, color: '#07333d' }}>{sec}</span>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button style={nextBtnStyle} onClick={() => onNext(selected)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionModal;