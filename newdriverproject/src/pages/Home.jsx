// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import SideMenu from '../components/SideMenu';
import '../styles/Home.css';
import { notify } from '../utils/alerts'; // ← SweetAlert2

/** === עזרי תאריך === */
function toLocalDate(dateInput) {
  const d = new Date(dateInput);
  if (!isNaN(d.getTime())) return d;
  const ds = String(dateInput).slice(0, 10); // "2025-08-28"
  const [y, m, dd] = ds.split('-').map((v) => parseInt(v, 10));
  return new Date(y || 1970, (m || 1) - 1, dd || 1);
}
function dtFrom(dateInput, timeStr) {
  const base = toLocalDate(dateInput);
  const [hh = 0, mm = 0] = String(timeStr || '00:00')
    .slice(0, 5)
    .split(':')
    .map((v) => parseInt(v, 10));
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh, mm, 0);
}

/** מחלק שיעורים לעתיד/עבר לפי שעת סיום בפועל + סטטוס */
function partitionLessons(list) {
  const now = new Date();
  const withTimes = (Array.isArray(list) ? list : []).map((l) => ({
    ...l,
    _start: dtFrom(l.date, l.start_time),
    _end: dtFrom(l.date, l.end_time || l.start_time),
  }));

  const upcoming = withTimes
    .filter((l) => (l.status || 'scheduled') === 'scheduled' && l._end > now)
    .sort((a, b) => a._start - b._start);

  const history = withTimes
    .filter((l) => l._end <= now || (l.status && l.status !== 'scheduled'))
    .sort((a, b) => b._start - a._start);

  return { upcoming, history };
}

/** מיפוי סטטוס לתצוגה בעברית, ללא שינוי DB */
function statusLabel(l) {
  // תמיכה גם ב-cancelled_by_ וגם בגרסאות עם רווחים
  const s = String(l.status || 'scheduled').toLowerCase().replace(/_/g, ' ');
  const end = dtFrom(l.date, l.end_time || l.start_time);
  const now = new Date();

  if (s === 'scheduled' && end <= now) return 'נלמד';
  if (s === 'scheduled') return 'נקבע';
  if (s.includes('cancelled by student')) return 'בוטל ע״י תלמיד';
  if (s.includes('cancelled by teacher')) return 'בוטל ע״י מורה';
  if (s === 'completed') return 'נלמד';
  return s;
}

function Home() {
  // “שיעור קרוב”
  const [studentName, setStudentName] = useState('');
  const [nextLesson, setNextLesson] = useState(null);
  const [loadingNext, setLoadingNext] = useState(true);

  // “קביעת שיעור”
  const [selectedDate, setSelectedDate] = useState(''); // ISO YYYY-MM-DD
  const [availableHours, setAvailableHours] = useState([]);
  const [selectedHour, setSelectedHour] = useState('');

  // רשימות
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [historyLessons, setHistoryLessons] = useState([]);
  const [learnedCount, setLearnedCount] = useState(0);

  const userId = localStorage.getItem('userId');
  const todayISO = new Date().toISOString().split('T')[0];

  /** שליפת שם המשתמש */
  const loadUser = async () => {
    if (!userId) return;
    try {
      const r = await fetch(`http://localhost:3001/api/users/${userId}`);
      const data = await r.json();
      if (data?.name) setStudentName(data.name);
    } catch {
      // שקט; לא קריטי לתצוגה
    }
  };

  /** שליפת שיעורים + חלוקה לעתיד/עבר + שיעור קרוב */
  const loadLessonsAndNext = async () => {
    if (!userId) return;
    try {
      const r = await fetch(`http://localhost:3001/api/lessons/user/${userId}`);
      const rows = await r.json();
      const { upcoming, history } = partitionLessons(rows);
      setUpcomingLessons(upcoming);
      setHistoryLessons(history);
      setLearnedCount(history.length);
      setNextLesson(upcoming[0] || null);
    } catch {
      // אפשר להוסיף notify.error אם תרצה
    } finally {
      setLoadingNext(false);
    }
  };

  /** שליפת שעות פנויות לתאריך שנבחר */
  const loadAvailability = async (dateStr) => {
    if (!dateStr || !userId) return setAvailableHours([]);
    try {
      const res = await fetch(
        `http://localhost:3001/api/availability/by-date/${dateStr}?user_id=${userId}`
      );
      const data = await res.json();
      const hours = Array.isArray(data)
        ? data.map((item) => (item.start_time || '').slice(0, 5))
        : [];
      setAvailableHours(hours);
    } catch {
      setAvailableHours([]);
    }
  };

  useEffect(() => {
    loadUser();
    loadLessonsAndNext();
  }, [userId]);

  useEffect(() => {
    loadAvailability(selectedDate);
  }, [selectedDate, userId]);

  // רענון אוטומטי כל דקה כדי ששיעור שעבר יזוז להיסטוריה
  useEffect(() => {
    const id = setInterval(() => loadLessonsAndNext(), 60_000);
    return () => clearInterval(id);
  }, [userId]);

  const isWeekend = (dateString) => {
    const day = new Date(dateString).getDay();
    return day === 5 || day === 6; // שישי/שבת
  };

  /** סינון שעות שחלפו אם התאריך הוא היום */
  const filteredHours = React.useMemo(() => {
    if (!selectedDate) return [];
    const now = new Date();
    return availableHours.filter((hh) => {
      const slot = dtFrom(selectedDate, hh);
      if (selectedDate === todayISO) return slot > now;
      return true;
    });
  }, [availableHours, selectedDate, todayISO]);

  // אם נבחרה שעה שנעלמה אחרי הסינון – ננקה את הבחירה
  useEffect(() => {
    if (selectedHour && !filteredHours.includes(selectedHour)) {
      setSelectedHour('');
    }
  }, [filteredHours, selectedHour]);

  /** קביעת שיעור */
  const handleSchedule = async () => {
    if (!selectedDate || !selectedHour) {
      notify.warn('יש לבחור תאריך ושעה לפני קביעת שיעור');
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          date: selectedDate,
          start_time: selectedHour,
        }),
      });
      const txt = await response.text();
      if (response.ok) {
        notify.toast('השיעור נקבע בהצלחה', 'success');
        setSelectedHour('');
        await Promise.all([loadAvailability(selectedDate), loadLessonsAndNext()]);
      } else {
        notify.error(txt || 'לא ניתן לקבוע את השיעור');
      }
    } catch {
      notify.error('שגיאה בחיבור לשרת');
    }
  };

  /** ביטול שיעור (תלמיד) — רק לעתיד */
  const handleCancel = async (lessonId) => {
    const ok = await notify.confirm('לבטל את השיעור?', 'הפעולה אינה ניתנת לשחזור');
    if (!ok) return;

    try {
      const res = await fetch(`http://localhost:3001/api/lessons/${lessonId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ by: 'student' }),
      });
      const txt = await res.text();
      if (res.ok) {
        notify.toast('השיעור בוטל', 'success');
        await Promise.all([loadAvailability(selectedDate), loadLessonsAndNext()]);
      } else {
        notify.error(txt || 'שגיאה בביטול שיעור');
      }
    } catch {
      notify.error('שגיאה בביטול שיעור');
    }
  };

  return (
    <div className="home-page">
      <SideMenu />
      <div className="home-content">
        {/* כותרת שלום */}
        <h2 className="home-title">שלום {studentName}</h2>

        {/* שיעור קרוב */}
        <section className="home-card">
          <h3>תזכורת לשיעור הבא</h3>
          {loadingNext ? (
            <p>טוען מידע...</p>
          ) : nextLesson ? (
            <p>
              השיעור הקרוב שלך נקבע ל־{' '}
              <strong>{new Date(nextLesson.date).toLocaleDateString('he-IL')}</strong>{' '}
              בשעה <strong>{(nextLesson.start_time || '').slice(0, 5)}</strong>.
            </p>
          ) : (
            <p>אין שיעור קרוב כרגע.</p>
          )}
        </section>

        {/* קביעת שיעור */}
        <section className="home-card">
          <h3>קביעת שיעור חדש</h3>

          <div className="home-date-row">
            <label>בחר תאריך:</label>
            <input
              className="home-date-input"
              type="date"
              lang="he-IL"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedHour('');
              }}
              min={todayISO}
            />
          </div>

          {selectedDate && isWeekend(selectedDate) && (
            <p style={{ color: '#ef4444', fontWeight: 700 }}>
              לא ניתן לקבוע שיעור בשישי או שבת
            </p>
          )}

          {selectedDate && !isWeekend(selectedDate) && (
            <>
              <p style={{ margin: '8px 0 6px' }}>
                שעות זמינות ל־{toLocalDate(selectedDate).toLocaleDateString('he-IL')}
              </p>
              <div className="home-hours-grid">
                {filteredHours.map((hh) => (
                  <button
                    key={hh}
                    className={`home-hour-btn ${selectedHour === hh ? 'selected' : ''}`}
                    onClick={() => setSelectedHour(hh)}
                  >
                    {hh}
                  </button>
                ))}
                {filteredHours.length === 0 && <p>אין שעות פנויות ביום זה</p>}
              </div>

              <button className="home-primary-btn" onClick={handleSchedule}>
                קבע שיעור
              </button>
            </>
          )}
        </section>

        {/* טבלת שיעורים עתידיים */}
        <section className="home-card">
          <h3>השיעורים שלי</h3>
          <table className="home-table">
            <thead>
              <tr>
                <th>תאריך</th>
                <th>שעה</th>
                <th>ביטול</th>
              </tr>
            </thead>
            <tbody>
              {upcomingLessons.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>
                    אין שיעורים עתידיים
                  </td>
                </tr>
              ) : (
                upcomingLessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td>
                      {lesson.date
                        ? new Date(lesson.date).toLocaleDateString('he-IL')
                        : ''}
                    </td>
                    <td>{lesson.start_time ? lesson.start_time.slice(0, 5) : ''}</td>
                    <td>
                      <button
                        className="home-cancel-btn"
                        onClick={() => handleCancel(lesson.id)}
                      >
                        בטל
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* היסטוריית שיעורים + מונה */}
        <section className="home-card">
          <h3>
            היסטוריית שיעורים{' '}
            <span style={{ fontSize: 14, color: '#555' }}>
              (נלמדו עד עכשיו: {learnedCount})
            </span>
          </h3>
          <table className="home-table">
            <thead>
              <tr>
                <th>תאריך</th>
                <th>שעת התחלה</th>
                <th>שעת סיום</th>
                <th>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {historyLessons.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>
                    אין שיעורים בהיסטוריה
                  </td>
                </tr>
              ) : (
                historyLessons.map((lesson) => (
                  <tr key={`h-${lesson.id}`}>
                    <td>
                      {lesson.date
                        ? new Date(lesson.date).toLocaleDateString('he-IL')
                        : ''}
                    </td>
                    <td>{lesson.start_time ? lesson.start_time.slice(0, 5) : ''}</td>
                    <td>{lesson.end_time ? lesson.end_time.slice(0, 5) : ''}</td>
                    <td>{statusLabel(lesson)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export default Home;
