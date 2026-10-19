require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3002;

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

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/character', require('./routes/character'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/quests', require('./routes/quests'));
app.use('/api/coach', require('./routes/coach'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Anime Fitness backend running on port ${PORT}`);
});

module.exports = app;
