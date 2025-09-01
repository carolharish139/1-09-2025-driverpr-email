import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/TeacherHome.css'; // נשאיר את העיצוב שלך
import { notify } from '../utils/alerts'; // ← SweetAlert2 utility

function TeacherHome() {
  const [availability, setAvailability] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // עזרי תצוגה
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('he-IL') : '');
  const fmtTime = (t) => (t ? String(t).slice(0, 5) : '');

  // שליפת אילוצים
  const fetchAvailability = async () => {
    try {
      setLoadingAvail(true);
      const res = await axios.get('http://localhost:3001/api/availability');
      setAvailability(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('שגיאה בשליפת אילוצים', err);
      notify.error('שגיאה בשליפת אילוצים');
    } finally {
      setLoadingAvail(false);
    }
  };

  // שליפת שיעורים
  const fetchLessons = async () => {
    try {
      setLoadingLessons(true);
      const res = await axios.get('http://localhost:3001/api/lessons');
      setLessons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('שגיאה בשליפת שיעורים', err);
      notify.error('שגיאה בשליפת שיעורים');
    } finally {
      setLoadingLessons(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
    fetchLessons();
  }, []);

  return (
    <div className="teacher-home">
      <h2>דף ראשי - מורה</h2>

      {/* חלק האילוצים */}
      <div className="teacher-section">
        <div className="section-header">
          <h3>האילוצים שלי</h3>
          <button onClick={fetchAvailability} disabled={loadingAvail}>
            {loadingAvail ? 'טוען…' : 'רענן'}
          </button>
        </div>

        <table className="teacher-table">
          <thead>
            <tr>
              <th>תאריך</th>
              <th>שעת התחלה</th>
              <th>שעת סיום</th>
              <th>תיאור</th>
            </tr>
          </thead>
          <tbody>
            {availability.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  {loadingAvail ? 'טוען…' : 'אין אילוצים'}
                </td>
              </tr>
            ) : (
              availability.map((a, idx) => (
                <tr key={idx}>
                  <td>{fmtDate(a.date)}</td>
                  <td>{fmtTime(a.start_time)}</td>
                  <td>{fmtTime(a.end_time)}</td>
                  <td>{a.description || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* חלק השיעורים */}
      <div className="teacher-section">
        <div className="section-header">
          <h3>השיעורים שלי</h3>
          <button onClick={fetchLessons} disabled={loadingLessons}>
            {loadingLessons ? 'טוען…' : 'רענן'}
          </button>
        </div>

        <table className="teacher-table">
          <thead>
            <tr>
              <th>תאריך</th>
              <th>שעת התחלה</th>
              <th>שעת סיום</th>
              <th>תלמיד</th>
            </tr>
          </thead>
          <tbody>
            {lessons.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  {loadingLessons ? 'טוען…' : 'אין שיעורים'}
                </td>
              </tr>
            ) : (
              lessons.map((l, idx) => (
                <tr key={idx}>
                  <td>{fmtDate(l.date)}</td>
                  <td>{fmtTime(l.start_time)}</td>
                  <td>{fmtTime(l.end_time)}</td>
                  <td>{l.student_name || l.user_name || l.user_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeacherHome;