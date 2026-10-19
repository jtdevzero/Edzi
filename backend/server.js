require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = Number(process.env.PORT || 3002);
const AUTH_TOKEN = process.env.BACKEND_ACCESS_TOKEN;
if (!AUTH_TOKEN || AUTH_TOKEN.length < 24) {
  throw new Error('Set a random BACKEND_ACCESS_TOKEN of at least 24 characters before starting the backend.');
}
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((x) => x.trim()).filter(Boolean);

const DATA_PATH = path.join(__dirname, 'data/user.json');

const defaultUserData = {
  character: null,
  stats: { level: 1, xp: 0, xpToNextLevel: 100, totalXP: 0, streak: 0, lastActivityDate: null },
  activities: [],
  achievements: [],
  quests: { daily: [], lastGenerated: null },
  evolutionHistory: []
};

if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(defaultUserData, null, 2));
}

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS origin not allowed'));
  }
}));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', (req, res, next) => {
  const header = req.get('authorization') || '';
  if (header !== `Bearer ${AUTH_TOKEN}`) return res.status(401).json({ error: 'Unauthorized' });
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', (req, res, next) => {
  const header = req.get('authorization') || '';
  if (header !== `Bearer ${AUTH_TOKEN}`) return res.status(401).json({ error: 'Unauthorized' });
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.use('/api/character', require('./routes/character'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/quests', require('./routes/quests'));
app.use('/api/coach', require('./routes/coach'));

app.listen(PORT, () => {
  console.log(`Anime Fitness backend running on port ${PORT}`);
});

module.exports = app;
