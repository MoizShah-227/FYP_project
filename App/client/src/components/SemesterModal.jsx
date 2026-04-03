import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Checkbox } from './modalUtils';
import { nextBtnStyle } from './modalStyles';
const DEPARTMENTS = ['BSSE', 'BSAI', 'BSCS'];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const SemesterModal = ({ isOpen, onClose, onBack, onNext }) => {
  const [selected, setSelected] = useState({}); 
  // shape: { BSSE: [1,2], BSAI: [3], BSCS: [] }

  if (!isOpen) return null;

  const toggle = (dept, sem) => {
    setSelected(prev => {
      const current = prev[dept] || [];
      const exists = current.includes(sem);
      return {
        ...prev,
        [dept]: exists ? current.filter(s => s !== sem) : [...current, sem],
      };
    });
  };

  const selectAll = () => {
    const all = {};
    DEPARTMENTS.forEach(d => { all[d] = [...SEMESTERS]; });
    setSelected(all);
  };

  const isChecked = (dept, sem) => (selected[dept] || []).includes(sem);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white mx-3"
        style={{ maxWidth: 400, width: '100%', borderRadius: 20, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{ borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: '#07333d' }}>Semester</span>
          <button className="btn p-0 border-0 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 30, height: 30, background: '#f5f5f5' }} onClick={onClose}>
            <X size={15} color="#888" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pt-3 pb-4">
          <button className="btn p-0 border-0 d-flex align-items-center gap-1 mb-3"
            style={{ color: '#888', fontSize: 14 }} onClick={onBack}>
            ← Back
          </button>

          <div className="d-flex align-items-center justify-content-between mb-3">
            <span style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>Semester:</span>
            <span style={{ fontSize: 13, color: '#f39c12', cursor: 'pointer', fontWeight: 500 }}
              onClick={selectAll}>Select All</span>
          </div>

          {/* 3-column grid */}
          <div className="d-flex gap-3">
            {DEPARTMENTS.map(dept => (
              <div key={dept} style={{ flex: 1 }}>
                {/* Dept header */}
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Checkbox checked={false} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#07333d' }}>{dept}</span>
                </div>
                {SEMESTERS.map(sem => (
                  <div key={sem} className="d-flex align-items-center gap-2 mb-2"
                    style={{ cursor: 'pointer' }} onClick={() => toggle(dept, sem)}>
                    <Checkbox checked={isChecked(dept, sem)} />
                    <span style={{ fontSize: 13, color: '#07333d' }}>
                      {String(sem).padStart(2, '0')}
                    </span>
                  </div>
                ))}
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

export default SemesterModal;