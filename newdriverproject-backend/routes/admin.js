const express = require('express');
const router = express.Router();
const db = require('../db');

// קבלת כל התלמידים
router.get('/students', (req, res) => {
  const query = "SELECT * FROM users WHERE role='student'";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching students');
    }
    res.json(results);
  });
});

// הוספת אילוצים חדשים
router.post('/availability', (req, res) => {
  const { teacher_id, date, start_time, end_time } = req.body;
  const insertQuery = `
    INSERT INTO availability (teacher_id, date, start_time, end_time)
    VALUES (?, ?, ?, ?)
  `;
  db.query(insertQuery, [teacher_id, date, start_time, end_time], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error inserting availability');
    }
    res.status(201).send('אילוץ נוסף בהצלחה');
  });
});

// מחיקת תלמיד
router.delete('/student/:id', (req, res) => {
  const { id } = req.params;
  const deleteQuery = 'DELETE FROM users WHERE id_number = ?';
  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error deleting student');
    }
    res.send('התלמיד נמחק בהצלחה');
  });
});

// עדכון פרטי תלמיד
router.put('/student/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, birth_date, address } = req.body;
  const updateQuery = `
    UPDATE users
    SET name=?, email=?, phone=?, birth_date=?, address=?
    WHERE id_number=?
  `;
  db.query(updateQuery, [name, email, phone, birth_date, address, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating student');
    }
    res.send('פרטי התלמיד עודכנו בהצלחה');
  });
});

module.exports = router;