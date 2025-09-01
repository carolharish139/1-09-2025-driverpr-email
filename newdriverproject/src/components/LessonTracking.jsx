import React, { useEffect, useState } from 'react';
import SideMenu from './SideMenu';
import '../styles/LessonTracking.css';

function LessonTracking() {
  const [lessons, setLessons] = useState([]);
  const [lastLesson, setLastLesson] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);

  useEffect(() => {
    const fetchLessons = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:3001/api/lessons/${userId}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setLessons(data);

          const today = new Date();

          const pastLessons = data.filter(l => new Date(l.date) < today);
          const upcomingLessons = data.filter(l => new Date(l.date) >= today);

          if (pastLessons.length > 0)
            setLastLesson(pastLessons[pastLessons.length - 1]);

          if (upcomingLessons.length > 0)
            setNextLesson(upcomingLessons[0]);
        }
      } catch (error) {
        console.error("שגיאה בשליפת נתוני שיעורים:", error);
      }
    };

    fetchLessons();
  }, []);

  return (
    <div className="lesson-tracking-page">
      <SideMenu />
      <div className="lesson-tracking-container">
        <h2>מעקב שיעורים</h2>
        <div className="lesson-card">
          <p><strong>מספר שיעורים שנקבעו:</strong> {lessons.length}</p>
          <p><strong>תאריך שיעור אחרון:</strong> {lastLesson ? `${lastLesson.date} (${lastLesson.start_time} - ${lastLesson.end_time})` : 'אין'}</p>
          <p><strong>תאריך שיעור הבא:</strong> {nextLesson ? `${nextLesson.date} (${nextLesson.start_time} - ${nextLesson.end_time})` : 'אין'}</p>
        </div>
      </div>
    </div>
  );
}

export default LessonTracking;