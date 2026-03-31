import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../../config/axiosConfig';

function AddEvent() {
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [file, setFile] = useState(null);
  const [events, setEvents] = useState([]);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // ✅ Fetch all events on load
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/admin/allevents");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Add Event
  const handleAddEvent = async () => {
    if (!eventName || !eventDate) return alert("Fill all fields");

    try {
      let imagePath = null;

      // Store only file name as path
      if (file) {
        imagePath = `/uploads/${file.name}`;
      }

      await api.post("/admin/addevent", {
        event_name: eventName,
        description: "",
        image: imagePath,
        event_date: eventDate,
        created_time: new Date().toISOString(),
        created_by: user.u_id
      });

      alert("Event added successfully");

      setEventName('');
      setEventDate('');
      setFile(null);

      fetchEvents(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Error adding event");
    }
  };

  // ✅ Delete Event
  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/deleteevent/${id}`);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-vh-100 bg-white">
      <Navbar />

      <div className="container py-3">
        <div className="d-flex align-items-center mb-4">
          <button onClick={() => navigate(-1)} className="btn border-0 p-0 me-3">
            <ArrowLeft size={24} color="#07333d" />
          </button>
          <h4 className="m-0 fw-bold" style={{ color: '#07333d' }}>Add Event</h4>
        </div>

        {/* Add Event Form */}
        <div className="card border-0 shadow-sm p-4 mb-5" style={{ borderRadius: '20px' }}>
          
          <input 
            type="text"
            className="form-control mb-3"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />

          <input 
            type="date"
            className="form-control mb-3"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />

          <input 
            type="file"
            className="form-control mb-3"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button 
            onClick={handleAddEvent}
            className="btn w-100 py-3 fw-bold text-white"
            style={{ backgroundColor: '#ffa02e', borderRadius: '15px' }}
          >
            Add Event
          </button>
        </div>

        {/* Events List */}
        <h5 className="fw-bold mb-3">Events List</h5>

        {events.map(event => (
          <div key={event.E_id} className="card border-0 bg-light mb-3 p-3 shadow-sm" style={{ borderRadius: '15px' }}>
            
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="m-0 fw-bold">{event.event_name}</h6>
                <small className="text-muted">{event.event_date}</small>
              </div>

              <button 
                onClick={() => handleDelete(event.E_id)}
                className="btn border-0 p-0 text-danger"
              >
                <Trash2 size={20} />
              </button>
            </div>
          {console.log(`http://localhost:5004${event.image}`)}
            {event.image && (
              <img 
                src={`http://localhost:5004${event.image}`}
                alt={event.event_name}
                className="img-fluid rounded-3 mt-2"
                style={{ width: '20%' }}
              />
            )}

          </div>
        ))}
      </div>
    </div>
  );
}

export default AddEvent;