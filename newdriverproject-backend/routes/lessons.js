// routes/lessons.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendMail } = require('../utils/mailer');

/* ---------- עוזרים ---------- */
const fmtTime = (t) => (t || '').slice(0, 5);
const lessonTimeHeb = (l) => `${l.date} בשעות ${fmtTime(l.start_time)}–${fmtTime(l.end_time)}`;

function teacherEmail(cb) {
  if (process.env.TEACHER_EMAIL) return cb(null, process.env.TEACHER_EMAIL);
  // אם אין לך עמודת role בטבלת users – השורה הזו פשוט לא תמצא כלום ונדלג
  db.query(
    `SELECT email FROM users WHERE role IN ('admin','teacher') AND email IS NOT NULL ORDER BY role='admin' DESC LIMIT 1`,
    (e, rows) => (e ? cb(e) : cb(null, rows && rows[0] ? rows[0].email : null))
  );
}

function fetchLessonWithStudent(id, cb) {
  db.query(
    `SELECT l.*,
            u.name    AS student_name,
            u.email   AS student_email,
            u.address AS student_address
     FROM lessons l
     JOIN users u ON u.user_id = l.user_id
     WHERE l.id = ? LIMIT 1`,
    [id],
    (err, rows) => cb(err, rows && rows[0])
  );
}

function updateStatus(id, status, cb) {
  db.query(`UPDATE lessons SET status=? WHERE id=?`, [status, id], cb);
}

/* ---------- יצירת שיעור ---------- */
/**
 * body: { user_id, date, start_time }
 */
router.post('/', (req, res) => {
  const { user_id, date, start_time } = req.body;
  if (!user_id || !date || !start_time) {
    return res.status(400).send('user_id, date, start_time נדרשים');
  }

  const hour = parseInt(String(start_time).split(':')[0], 10);
  if (isNaN(hour) || hour < 8 || hour > 20) {
    return res.status(400).send('שעה לא חוקית (08:00–20:00)');
  }

  // 1) חסימה (blocks)
  db.query(
    `SELECT 1 FROM blocks WHERE date=? AND start_time=? LIMIT 1`,
    [date, start_time],
    (e1, r1) => {
      if (e1) return res.status(500).send('שגיאה בבדיקת חסימה');
      if (r1.length) return res.status(409).send('השעה חסומה (סגורה)');

      // 2) כבר יש שיעור לסטודנט באותו יום? (רק scheduled)
      db.query(
        `SELECT 1 FROM lessons WHERE user_id=? AND date=? AND status='scheduled' LIMIT 1`,
        [user_id, date],
        (e2, r2) => {
          if (e2) return res.status(500).send('שגיאה בבדיקת שיעור קיים לאותו יום');
          if (r2.length) return res.status(400).send('כבר נקבע לך שיעור ביום זה');

          // 3) השעה תפוסה (רק scheduled)
          db.query(
            `SELECT 1 FROM lessons WHERE date=? AND start_time=? AND status='scheduled' LIMIT 1`,
            [date, start_time],
            (e3, r3) => {
              if (e3) return res.status(500).send('שגיאה בבדיקת שעה תפוסה');
              if (r3.length) return res.status(409).send('שעה זו כבר תפוסה');

              // 4) שמירה
              const [h, m = '00'] = String(start_time).split(':');
              const end_time = String(parseInt(h, 10) + 1).padStart(2, '0') + ':' + m;

              db.query(
                `INSERT INTO lessons (user_id, date, start_time, end_time, created_at, status)
                 VALUES (?, ?, ?, ?, NOW(), 'scheduled')`,
                [user_id, date, start_time, end_time],
                (e4) => {
                  if (e4) {
                    if (e4.code === 'ER_DUP_ENTRY') return res.status(409).send('שעה זו כבר תפוסה');
                    return res.status(500).send('שגיאה בשמירת שיעור');
                  }
                  res.status(201).send('השיעור נקבע בהצלחה');
                }
              );
            }
          );
        }
      );
    }
  );
});

/* ---------- “השיעורים שלי” ---------- */
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  db.query(
    `SELECT id, date, start_time, end_time, status
     FROM lessons
     WHERE user_id=? AND status='scheduled'
     ORDER BY date, start_time`,
    [userId],
    (err, rows) => (err ? res.status(500).send('שגיאה בשליפת שיעורים') : res.json(rows))
  );
});

/* ---------- שיעורי יום מסוים (לתצוגת מורה) ---------- */
router.get('/by-date/:date', (req, res) => {
  const { date } = req.params;
  db.query(
    `SELECT 
       l.id,
       l.user_id,
       u.name    AS student_name,
       u.address AS student_address,
       l.date,
       l.start_time,
       l.end_time,
       l.status
     FROM lessons l
     JOIN users u ON u.user_id = l.user_id
     WHERE l.date = ? AND l.status='scheduled'
     ORDER BY l.start_time`,
    [date],
    (err, rows) => (err ? res.status(500).send('שגיאה בשליפת שיעורים') : res.json(rows))
  );
});

/* ---------- שליחת מיילים בעת ביטול ---------- */
function notifyCancellation(by, lesson, cb) {
  if (by === 'teacher') {
    // מייל לתלמיד
    const to = lesson.student_email;
    if (!to) return cb();
    sendMail({
      to,
      subject: 'ביטול שיעור – מורה נהיגה',
      html: `
        <p>שלום ${lesson.student_name || ''},</p>
        <p>המורה ביטל את השיעור שתואם ל־${lessonTimeHeb(lesson)}.</p>
        <p>ניתן לקבוע מועד חלופי באפליקציה.</p>
      `,
    }).then(() => cb()).catch(() => cb());
  } else {
    // מייל למורה
    teacherEmail((e, tEmail) => {
      if (e || !tEmail) return cb();
      sendMail({
        to: tEmail,
        subject: 'ביטול שיעור ע״י תלמיד',
        html: `
          <p>התלמיד/ה <strong>${lesson.student_name || lesson.user_id}</strong> ביטל/ה שיעור.</p>
          <p>מועד: ${lessonTimeHeb(lesson)}</p>
          <p>כתובת התלמיד: ${lesson.student_address || '-'}</p>
        `,
      }).then(() => cb()).catch(() => cb());
    });
  }
}

/* ---------- ביטול שיעור כללי (מורה/תלמיד) ---------- */
/**
 * POST /api/lessons/:id/cancel  body: { by: "teacher" | "student" }
 */
router.post('/:id/cancel', (req, res) => {
  const { id } = req.params;
  const by = String(req.body?.by || '').toLowerCase();
  if (!['teacher', 'student'].includes(by)) {
    return res.status(400).send('חובה לציין by=teacher|student');
  }

  fetchLessonWithStudent(id, (e1, lesson) => {
    if (e1) return res.status(500).send('שגיאה בשליפת שיעור');
    if (!lesson) return res.status(404).send('השיעור לא נמצא');

    // === נקודת העדכון החשובה (קו תחתי) ===
    const status = by === 'teacher' ? 'cancelled_by_teacher' : 'cancelled_by_student';
    updateStatus(id, status, (e2) => {
      if (e2) return res.status(500).send('שגיאה בעדכון סטטוס');
      notifyCancellation(by, lesson, () => res.send('השיעור בוטל ונשלח מייל התראה'));
    });
  });
});

/* ---------- תאימות לאחור: מורה מבטל (DELETE) ---------- */
// אם הפרונט קורא DELETE /api/lessons/:id – זה יחשב כמורה
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  fetchLessonWithStudent(id, (e1, lesson) => {
    if (e1) return res.status(500).send('שגיאה בשליפת שיעור');
    if (!lesson) return res.status(404).send('השיעור לא נמצא');

    updateStatus(id, 'cancelled_by_teacher', (e2) => {
      if (e2) return res.status(500).send('שגיאה בעדכון סטטוס');
      notifyCancellation('teacher', lesson, () => res.send('השיעור בוטל ע״י מורה ונשלח מייל לתלמיד'));
    });
  });
});

module.exports = router;

