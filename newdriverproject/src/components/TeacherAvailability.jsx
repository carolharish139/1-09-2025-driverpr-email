import React, { useState, useEffect } from 'react';
import '../styles/TeacherAvailability.css';
import TeacherSideMenu from './TeacherSideMenu';

const HOURS_BASE = Array.from({ length: 13 }, (_, i) =>
  String(8 + i).padStart(2, '0') + ':00'
);

function TeacherAvailability() {
  const [selectedDate, setSelectedDate] = useState('');
  const [freeHours, setFreeHours] = useState([]);
  const [bookedHours, setBookedHours] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [todayLessons, setTodayLessons] = useState([]);
  const [tomorrowLessons, setTomorrowLessons] = useState([]);

  const [message, setMessage] = useState('');

  const closedHours = HOURS_BASE.filter(
    (hh) => !freeHours.includes(hh) && !bookedHours.includes(hh)
  );

  const isWeekend = (dateString) => {
    const day = new Date(dateString).getDay();
    return day === 5 || day === 6;
  };

  const iso = (d) => d.toISOString().split('T')[0];
  const fmtHe = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('he-IL') : '';

  const loadFixedSummaries = async () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayISO = iso(today);
    const tomorrowISO = iso(tomorrow);

    try {
      const r1 = await fetch(`http://localhost:3001/api/lessons/by-date/${todayISO}`);
      setTodayLessons(r1.ok ? await r1.json() : []);
    } catch {
      setTodayLessons([]);
    }

    try {
      const r2 = await fetch(`http://localhost:3001/api/lessons/by-date/${tomorrowISO}`);
      setTomorrowLessons(r2.ok ? await r2.json() : []);
    } catch {
      setTomorrowLessons([]);
    }
  };

  const loadDayData = async (date) => {
    setMessage('');
    if (!date) return;

    try {
      const resFree = await fetch(`http://localhost:3001/api/availability/by-date/${date}`);
      const freeData = resFree.ok ? await resFree.json() : [];
      setFreeHours(
        Array.isArray(freeData) ? freeData.map((i) => (i.start_time || '').slice(0, 5)) : []
      );
    } catch {}

    try {
      const resBooked = await fetch(`http://localhost:3001/api/lessons/by-date/${date}`);
      const bookedData = resBooked.ok ? await resBooked.json() : [];
      setBookedHours(
        Array.isArray(bookedData) ? bookedData.map((i) => (i.start_time || '').slice(0, 5)) : []
      );
      setLessons(Array.isArray(bookedData) ? bookedData : []);
    } catch {}
  };

  useEffect(() => {
    loadFixedSummaries();
  }, []);

  useEffect(() => {
    if (selectedDate) loadDayData(selectedDate);
  }, [selectedDate]);

  const toggleHour = async (hour) => {
    if (!selectedDate) return;
    if (bookedHours.includes(hour)) {
      setMessage('אי אפשר לשנות שעה שכבר יש עליה שיעור');
      return;
    }
    const isClosed = closedHours.includes(hour);

    try {
      if (isClosed) {
        const res = await fetch('http://localhost:3001/api/blocks', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: selectedDate, start_time: hour }),
        });
        const txt = await res.text();
        setMessage(res.ok ? (txt || 'השעה נפתחה') : `שגיאה: ${txt}`);
      } else {
        const res = await fetch('http://localhost:3001/api/blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: selectedDate, start_time: hour }),
        });
        const txt = await res.text();
        setMessage(res.ok ? (txt || 'השעה נסגרה') : `שגיאה: ${txt}`);
      }
      await loadDayData(selectedDate);
    } catch {
      setMessage('שגיאה בשינוי שעה');
    }
  };

  const closeAll = async () => {
    if (!selectedDate) return;
    try {
      const res = await fetch('http://localhost:3001/api/blocks/close-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate }),
      });
      const txt = await res.text();
      setMessage(res.ok ? (txt || 'היום נסגר כולו') : `שגיאה: ${txt}`);
      await loadDayData(selectedDate);
    } catch {
      setMessage('שגיאה בסגירת יום');
    }
  };

  const openAll = async () => {
    if (!selectedDate) return;
    try {
      const res = await fetch('http://localhost:3001/api/blocks/open-day', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate }),
      });
      const txt = await res.text();
      setMessage(res.ok ? (txt || 'כל החסימות נמחקו') : `שגיאה: ${txt}`);
      await loadDayData(selectedDate);
    } catch {
      setMessage('שגיאה בפתיחת יום');
    }
  };

  const cancelLesson = async (lessonId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      const txt = await res.text();
      setMessage(res.ok ? (txt || 'השיעור בוטל') : `שגיאה: ${txt}`);
      await loadDayData(selectedDate);
      await loadFixedSummaries();
    } catch {
      setMessage('שגיאה בביטול שיעור');
    }
  };

  const todayISO = iso(new Date());
  const tomorrowD = new Date(); tomorrowD.setDate(new Date().getDate() + 1);
  const tomorrowISO = iso(tomorrowD);

  return (
    <div className="teacher-availability-page" dir="rtl">
      {/* התוכן בעמודה הראשונה */}
      <div className="availability-content">
        <h2>דף ראשי למורה – אילוצים ושיעורים</h2>

        {/* היום */}
        <h3>השיעורים של היום · {fmtHe(todayISO)}</h3>
        <div className="lessons-section">
          <table className="lesson-table">
            <thead>
              <tr>
                <th>שעה</th>
                <th>כתובת</th>
                <th>שעת סיום</th>
                <th>תלמיד</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {todayLessons.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign:'center'}}>אין שיעורים היום</td></tr>
              ) : (
                todayLessons.map((l) => (
                  <tr key={`today-${l.id}`}>
                    <td className="time-cell">{(l.start_time || '').slice(0,5)}</td>
                    <td>{l.student_address || '-'}</td>
                    <td className="time-cell">{(l.end_time || '').slice(0,5)}</td>
                    <td>{l.student_name || l.user_id}</td>
                    <td><button onClick={() => cancelLesson(l.id)}>בטל</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* מחר */}
        <h3 style={{marginTop:16}}>השיעורים של מחר · {fmtHe(tomorrowISO)}</h3>
        <div className="lessons-section">
          <table className="lesson-table">
            <thead>
              <tr>
                <th>שעה</th>
                <th>כתובת</th>
                <th>שעת סיום</th>
                <th>תלמיד</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {tomorrowLessons.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign:'center'}}>אין שיעורים מחר</td></tr>
              ) : (
                tomorrowLessons.map((l) => (
                  <tr key={`tomorrow-${l.id}`}>
                    <td className="time-cell">{(l.start_time || '').slice(0,5)}</td>
                    <td>{l.student_address || '-'}</td>
                    <td className="time-cell">{(l.end_time || '').slice(0,5)}</td>
                    <td>{l.student_name || l.user_id}</td>
                    <td><button onClick={() => cancelLesson(l.id)}>בטל</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* תאריך לניהול אילוצים + שיעורי אותו יום */}
        <div className="date-row" style={{marginTop:24}}>
          <label>בחר תאריך: </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={iso(new Date())}
          />
        </div>

        {selectedDate && isWeekend(selectedDate) && (
          <p className="ta-error">לא ניתן לבחור שישי או שבת</p>
        )}

        {selectedDate && !isWeekend(selectedDate) && (
          <>
            <h3>ניהול שעות ל־{fmtHe(selectedDate)}</h3>

            <div className="day-actions">
              <button onClick={openAll}>פתח יום שלם</button>
              <button onClick={closeAll}>סגור יום שלם</button>
            </div>

            <div className="hours-grid">
              {HOURS_BASE.map((hour) => {
                const isBooked = bookedHours.includes(hour);
                const isClosed = closedHours.includes(hour);

                let cls = 'hour-pill';
                if (isBooked) cls += ' booked';
                else if (isClosed) cls += ' unavailable';
                else cls += ' available';

                return (
                  <button
                    key={hour}
                    onClick={() => !isBooked && toggleHour(hour)}
                    className={cls}
                    disabled={isBooked}
                    title={isBooked ? 'שעה עם שיעור שנקבע' : (isClosed ? 'סגור' : 'פתוח')}
                    aria-pressed={isClosed}
                  >
                    {hour}
                  </button>
                );
              })}
            </div>

            <h3 style={{ marginTop: 24 }}>
              השיעורים ל־{fmtHe(selectedDate)}
            </h3>
            <div className="lessons-section">
              <table className="lesson-table">
                <thead>
                  <tr>
                    <th>שעה</th>
                    <th>כתובת</th>
                    <th>שעת סיום</th>
                    <th>תלמיד</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>
                        אין שיעורים ליום זה
                      </td>
                    </tr>
                  ) : (
                    lessons.map((l) => (
                      <tr key={l.id}>
                        <td className="time-cell">{(l.start_time || '').slice(0, 5)}</td>
                        <td>{l.student_address || '-'}</td>
                        <td className="time-cell">{(l.end_time || '').slice(0, 5)}</td>
                        <td>{l.student_name || l.user_id}</td>
                        <td>
                          <button onClick={() => cancelLesson(l.id)}>בטל</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {message && <p className="message-success" style={{ marginTop: 16 }}>{message}</p>}
      </div>

      {/* תפריט בעמודה השנייה (לא מכסה) */}
      <aside className="ta-sidemenu">
        <TeacherSideMenu />
      </aside>
    </div>
  );
}

export default TeacherAvailability;
