require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');


const usersRoutes = require('./routes/users');
const availabilityRoutes = require('./routes/availability');
const lessonsRoutes = require('./routes/lessons');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');
const blocksRoutes = require('./routes/blocks');




// 🟢 Middleware קודם
app.use(cors());
app.use(express.json()); // ✅ חייב להיות לפני כל הראוטים

// 🟢 ואז הראוטים
app.use('/api/users', usersRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blocks', blocksRoutes);

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});