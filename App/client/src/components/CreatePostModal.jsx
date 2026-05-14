import React, { useState } from 'react';
import { X, BookOpen, GraduationCap, Star, Award } from 'lucide-react';
import CourseModal from './CourseModel';
import CourseMessageModal from './CourseMessageModal';
import SemesterModal from './SemesterModal';
import SectionModal from './SectionModel';
import SemesterSectionMessageModal from './SemesterSectionMessageModal';
import { useNavigate } from 'react-router-dom';

const options = [
  { id: 'course',     label: 'Course',            sub: 'Send to specific course',       Icon: BookOpen,      bg: '#eef3ff', color: '#4361ee' },
  { id: 'semester',   label: 'Semester',           sub: 'Send by department & semester', Icon: GraduationCap, bg: '#f0f7ee', color: '#2d8a4e' },
  { id: 'favourites', label: 'Favourite Students', sub: 'Your favourite students',       Icon: Star,          bg: '#fffbea', color: '#e6a817' },
  // { id: 'alumni',     label: 'Alumni',             sub: 'Past students',                 Icon: Award,         bg: '#fef0f0', color: '#e05c5c' },
];

const CreatePostModal = ({ isOpen, onClose, teacherId }) => {
  const [selected, setSelected] = useState(null);
  const [selectedSemesters, setSelectedSemesters] = useState({});
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [selectedCourseNames, setSelectedCourseNames] = useState([]);
  const navigate = useNavigate();
  const me = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user')) || {};
      return u.id ?? u.u_id ?? teacherId;
    } catch {
      return teacherId;
    }
  })();

  if (!isOpen) return null;

  const handleClose = () => {
    setSelected(null);
    setSelectedSemesters({});
    setSelectedSections([]);
    setSelectedCourseIds([]);
    setSelectedCourseNames([]);
    onClose();
  };

  const goBack = () => setSelected(null);

  const handlePick = (id) => {
    if (id === 'favourites') {
      handleClose();
      navigate('/favourite-students');
      return;
    }
    if (id === 'alumni') {
      handleClose();
      navigate('/alumni');
      return;
    }
    setSelected(id);
  };

  if (selected === 'course') {
    return (
      <CourseModal
        isOpen={isOpen}
        onClose={handleClose}
        onBack={goBack}
        teacherId={teacherId}
        onNext={(courseIds, courseNames) => {
          setSelectedCourseIds(Array.isArray(courseIds) ? courseIds : []);
          setSelectedCourseNames(Array.isArray(courseNames) ? courseNames : []);
          setSelected('course-message');
        }}
      />
    );
  }

  if (selected === 'course-message') {
    return (
      <CourseMessageModal
        isOpen={isOpen}
        onClose={handleClose}
        onBack={() => setSelected('course')}
        teacherId={me}
        selectedCourseIds={selectedCourseIds}
        selectedCourseNames={selectedCourseNames}
      />
    );
  }

  if (selected === 'semester') {
    return (
      <SemesterModal
        isOpen={isOpen}
        onClose={handleClose}
        onBack={goBack}
        teacherId={me}
        onNext={(semesters) => {
          setSelectedSemesters(semesters || {});
          setSelected('section');
        }}
      />
    );
  }

  if (selected === 'section') {
    return (
      <SectionModal
        isOpen={isOpen}
        onClose={handleClose}
        onBack={() => setSelected('semester')}
        teacherId={me}
        selectedSemesters={selectedSemesters}
        onNext={(sections) => {
          setSelectedSections(Array.isArray(sections) ? sections : []);
          setSelected('semester-message');
        }}
      />
    );
  }
  if (selected === 'semester-message') {
    return (
      <SemesterSectionMessageModal
        isOpen={isOpen}
        onClose={handleClose}
        onBack={() => setSelected('section')}
        teacherId={me}
        selectedSemesters={selectedSemesters}
        selectedSections={selectedSections}
      />
    );
  }

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
        <div className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{ borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: '#07333d' }}>Create Post</span>
          <button
            className="btn p-0 border-0 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 30, height: 30, background: '#f5f5f5' }}
            onClick={handleClose}
          >
            <X size={15} color="#888" />
          </button>
        </div>

        <div className="px-4 pt-3 pb-4">
          <button className="btn p-0 border-0 d-flex align-items-center gap-1 mb-3"
            style={{ color: '#888', fontSize: 14 }} onClick={handleClose}>
            ← Back
          </button>

          <p className="mb-3" style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>
            Send to:
          </p>

          <div className="d-flex flex-column gap-2">
            {/* eslint-disable-next-line no-unused-vars */}
            {options.map(({ id, label, sub, Icon, bg, color }) => (
              <div
                key={id}
                className="d-flex align-items-center p-3 rounded-3"
                style={{
                  border: '1px solid #efefef', cursor: 'pointer', gap: 13,
                  background: selected === id ? '#fafafa' : '#fff',
                  transition: 'background 0.15s',
                }}
                onClick={() => handlePick(id)}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 10, background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={20} color={color} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="m-0" style={{ fontSize: 15, fontWeight: 600, color: '#07333d' }}>{label}</p>
                  <p className="m-0" style={{ fontSize: 12, color: '#999' }}>{sub}</p>
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