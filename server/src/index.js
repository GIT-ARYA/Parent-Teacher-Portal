// server/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connect } = require('./db');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const assignmentRoutes = require('./routes/assignments');
const messageRoutes = require('./routes/messages');

const { auth } = require('./middleware/auth'); // require auth AFTER models/routes are set up if needed

const app = express(); // <-- app must be created before adding routes

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// mount routers
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/messages', messageRoutes);

// simple protected test route — must come after `app` is defined
app.get('/api/test', auth, (req, res) => {
  res.json({ message: 'Auth working!', user: req.user });
});

app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log('Server listening on', PORT)))
  .catch(err => { console.error('DB connection error', err); process.exit(1); });
