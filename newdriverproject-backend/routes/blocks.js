// routes/blocks.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// סגירת שעה
router.post('/', (req, res) => {
  const { date, start_time } = req.body;
  if (!date || !start_time) return res.status(400).send('date ו-start_time נדרשים');

  const [h, m='00'] = start_time.split(':');
  const end_time = String(parseInt(h,10)+1).padStart(2,'0') + ':' + m;

  const sql = `INSERT INTO blocks (date, start_time, end_time) VALUES (?, ?, ?)`;
  db.query(sql, [date, start_time, end_time], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).send('השעה כבר סגורה');
      return res.status(500).send('שגיאה בשמירת חסימה');
    }
    res.status(201).send('השעה נסגרה');
  });
});

// פתיחת שעה (ביטול חסימה)
router.delete('/', (req, res) => {
  const { date, start_time } = req.body;
  if (!date || !start_time) return res.status(400).send('date ו-start_time נדרשים');

  db.query(`DELETE FROM blocks WHERE date=? AND start_time=?`, [date, start_time], (err, r) => {
    if (err) return res.status(500).send('שגיאה במחיקת חסימה');
    if (r.affectedRows === 0) return res.status(404).send('השעה לא הייתה סגורה');
    res.send('השעה נפתחה');
  });
});

// סגירת יום שלם 08–20
router.post('/close-day', (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).send('date נדרש');

  const HOURS = Array.from({length:13},(_,i)=>String(8+i).padStart(2,'0')+':00');
  const values = HOURS.map(hh => {
    const [h] = hh.split(':'); const end = String(parseInt(h,10)+1).padStart(2,'0')+':00';
    return [date, hh, end];
  });
  db.query(`INSERT IGNORE INTO blocks (date, start_time, end_time) VALUES ?`, [values], (err)=>{
    if (err) return res.status(500).send('שגיאה בסגירת יום');
    res.status(201).send('היום נסגר כולו');
  });
});

// פתיחת יום שלם
router.delete('/open-day', (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).send('date נדרש');
  db.query(`DELETE FROM blocks WHERE date=?`, [date], (err)=>{
    if (err) return res.status(500).send('שגיאה בפתיחת יום');
    res.send('כל החסימות ליום נמחקו');
  });
});

module.exports = router;
