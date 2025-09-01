const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// התחברות משתמש
router.post('/login', (req, res) => {
  const { idNumber, password } = req.body;

  const query = 'SELECT * FROM users WHERE user_id = ?';
  db.query(query, [idNumber], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('שגיאה בשרת');
    }

    if (results.length === 0) {
      return res.status(401).send('תעודת זהות לא קיימת');
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('סיסמה שגויה');
    }

    res.json({
      message: 'התחברת בהצלחה!',
      user: {
        idNumber: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        birthDate: user.birth_date,
        address: user.address,
        role: user.role
      }
    });
  });
});


// קבלת כל המשתמשים
router.get('/', (req, res) => {
  const query = 'SELECT * FROM users';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching users');
    }
    res.json(results);
  });
});

// הרשמת משתמש
router.post('/register', async (req, res) => {
  const { idNumber, name, email, phone, password, birth_date, address } = req.body;

  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error checking email');
    }

    if (results.length > 0) {
      return res.status(400).send('כתובת המייל כבר קיימת במערכת');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO users (user_id, name, email, phone, password, birth_date, address, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(insertQuery,
        [idNumber, name, email, phone, hashedPassword, birth_date, address, 'student'],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Error registering user');
          }
          res.status(201).send('המשתמש נוצר בהצלחה');
        });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error hashing password');
    }
  });
});



// שליפת משתמש לפי ID
router.get('/:id', (req, res) => {
  const userId = req.params.id;

  const query = 'SELECT * FROM users WHERE user_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ message: 'Error fetching user' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];
    res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birth_date: user.birth_date,
      address: user.address,
      role: user.role
    });
  });
});

// 🔧 עדכון פרטי משתמש לפי ID
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email, phone, birth_date, address } = req.body;

  const query = `
    UPDATE users 
    SET name = ?, email = ?, phone = ?, birth_date = ?, address = ?
    WHERE user_id = ?
  `;

  db.query(query, [name, email, phone, birth_date, address, userId], (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ message: 'Error updating user' });
    }

    res.json({ message: 'המשתמש עודכן בהצלחה' });
  });
});

module.exports = router;