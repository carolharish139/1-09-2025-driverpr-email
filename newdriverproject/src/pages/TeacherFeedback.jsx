import React, { useEffect, useState } from 'react';
import TeacherSideMenu from '../components/TeacherSideMenu';
import '../styles/TeacherFeedback.css';

const TeacherFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  const fetchFeedbacks = () => {
    fetch('http://localhost:3001/api/feedback')
      .then(res => res.json())
      .then(data => setFeedbacks(data))
      .catch(err => console.error('שגיאה בשליפת משובים', err));
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/feedback/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setFeedbacks(prev => prev.filter(fb => fb.id !== id));
      }
    } catch (err) {
      console.error('שגיאה במחיקת משוב', err);
    }
  };

  return (
    <div className="teacher-feedback-page">
      <TeacherSideMenu />
      <div className="teacher-feedback-container">
        <h2 className="title">📋 משובים שהתקבלו</h2>
        {feedbacks.length === 0 ? (
          <p className="no-feedback">אין משובים להצגה</p>
        ) : (
          feedbacks.map((fb) => (
            <div key={fb.id} className="feedback-card">
              <div className="feedback-header">
                <span className="feedback-name">🧑‍🎓 {fb.name}</span>
                <span className="feedback-date">📅 {new Date(fb.created_at).toLocaleString('he-IL')}</span>
              </div>
              <p className="feedback-message">{fb.message}</p>
              <button className="mark-button" onClick={() => handleMarkAsRead(fb.id)}>נקראה</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherFeedback;