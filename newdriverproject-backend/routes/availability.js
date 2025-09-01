// routes/availability.js
const express = require('express');
const router = express.Router();
const db = require('../db');

const HOURS_BASE = Array.from({length:13},(_,i)=>String(8+i).padStart(2,'0')+':00');

// לתלמיד: מחזיר שעות פנויות ליום (בסיס 08–20 פחות חסימות ופחות שיעורים של אחרים)
router.get('/by-date/:date', (req, res) => {
  const { date } = req.params;
  const { user_id } = req.query; // נשאיר לתלמיד לראות את השעה שלו אם כבר קבע

  const qBlocks = `SELECT start_time FROM blocks WHERE date=?`;
  const qLessons = `SELECT user_id, start_time FROM lessons WHERE date=?`;

  db.query(qBlocks, [date], (e1, blocks) => {
    if (e1) return res.status(500).send('שגיאה בשליפת חסימות');

    const blocked = new Set(blocks.map(r => (r.start_time||'').slice(0,5)));

    db.query(qLessons, [date], (e2, lessons) => {
      if (e2) return res.status(500).send('שגיאה בשליפת שיעורים');

      const taken = new Set();
      lessons.forEach(r => {
        const hh = (r.start_time||'').slice(0,5);
        if (!user_id || String(r.user_id) !== String(user_id)) taken.add(hh);
      });

      const free = HOURS_BASE.filter(h => !blocked.has(h) && !taken.has(h));
      const result = free.map(hh => ({
        id: `${date}:${hh}`,
        date,
        start_time: hh,
        end_time: String(parseInt(hh.split(':')[0],10)+1).padStart(2,'0')+':00'
      }));
      res.json(result);
    });
  });
});

module.exports = router;
