const express = require('express');
const router = express.Router();

// ייבוא חיבור ספציפי עם Promise — רק כאן
const mysql = require('mysql2/promise');
require('dotenv').config();

// יצירת Pool זמני לעבודה עם async/await
const dbPromise = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// 🔸 שליחת משוב
router.post('/', async (req, res) => {
  const { user_id, message } = req.body;
  console.log("📥 משוב שהתקבל:", req.body);

  if (!user_id || !message)
    return res.status(400).send('חסרים פרטים');

  try {
    await dbPromise.query(
      'INSERT INTO feedback (user_id, message) VALUES (?, ?)',
      [user_id, message]
    );
    res.status(201).send('המשוב נשלח');
  } catch (err) {
    console.error("❌ שגיאה בהכנסת משוב:", err);
    res.status(500).send('שגיאה בשמירת משוב');
  }
});

// 🔸 שליפת כל המשובים (למורה)
router.get('/', async (req, res) => {
  try {
    const [rows] = await dbPromise.query(
      `SELECT f.*, u.name FROM feedback f
       JOIN users u ON f.user_id = u.user_id
       ORDER BY f.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ שגיאה בשליפת משובים:", err);
    res.status(500).send('שגיאה בשליפת משובים');
  }
});

// 🔸 מחיקת משוב לפי ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await dbPromise.query('DELETE FROM feedback WHERE id = ?', [id]);
    res.status(200).send('המשוב נמחק');
  } catch (err) {
    console.error('❌ שגיאה במחיקת משוב:', err);
    res.status(500).send('שגיאה במחיקה');
  }
});

module.exports = router;