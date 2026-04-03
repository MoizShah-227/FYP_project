import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import api from '../../config/axiosConfig.js'

const CourseModal = ({ isOpen, onClose, onBack, onNext, teacherId }) => {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState([]);
  
  const user=JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!isOpen) return;
    const fetchCourses = async () => {
        try {
          const coursesRes = await api.get(`/showTeacherModel/courses/${user.id}`);
        //   console.log(coursesRes.data);
          setCourses(coursesRes.data);   
        } catch (error) {
          console.error('Failed to courses:', error.response?.data || error.message);
        }
      };
      fetchCourses();
    }, [isOpen, teacherId]);
    // console.log(courses[0]);

if (!isOpen) return null;

  const toggleCourse = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
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
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{ borderBottom: '1px solid #f0f0f0' }}
        >
          <span style={{ fontSize: 17, fontWeight: 600, color: '#07333d' }}>Courses</span>
          <button
            className="btn p-0 border-0 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 30, height: 30, background: '#f5f5f5' }}
            onClick={onClose}
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
            onClick={onBack}
          >
            ← Back
          </button>

          <p className="mb-3" style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>
            Select Course:
          </p>

          <div className="d-flex flex-column gap-2">
            {courses.map(course => {
              const isChecked = selected.includes(course.C_id);
              return (
                <div
                  key={course.C_id}
                  className="d-flex align-items-center gap-3 px-3 py-3 rounded-3"
                  style={{ border: '1px solid #efefef', cursor: 'pointer' }}
                  onClick={() => toggleCourse(course.C_id)}
                >
                  {/* Custom checkbox */}
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 5,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isChecked ? '#2ecc71' : 'transparent',
                      border: isChecked ? 'none' : '1.5px solid #ccc',
                      transition: 'background 0.15s',
                    }}
                  >
                    {isChecked && <Check size={14} color="#fff" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: 15, color: '#07333d' }}>{course.name}</span>
                </div>
              );
            })}
          </div>

          {/* Next button */}
          <div className="d-flex justify-content-end mt-4">
            <button
              style={{
                background: '#f39c12',
                color: '#fff',
                border: 'none',
                borderRadius: 50,
                padding: '10px 32px',
                fontSize: 15,
                fontWeight: 500,
                cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
                opacity: selected.length === 0 ? 0.6 : 1,
              }}
              disabled={selected.length === 0}
              onClick={() => onNext(selected)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;