const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const {
  calculateXPForActivity,
  applyXP,
  updateStreak,
  checkEvolution,
  getXPMultiplierForStreak
} = require('../services/gamificationService');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '../data/user.json');

function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

router.post('/', (req, res) => {
  try {
    const { type, title, duration, intensity, notes } = req.body;

    if (!type || !duration) {
      return res.status(400).json({ error: 'type and duration are required' });
    }

    const userData = readData();

    const streak = updateStreak(userData);
    const streakMultiplier = getXPMultiplierForStreak(streak);
    const baseXP = calculateXPForActivity(type, Number(duration), Number(intensity) || 5);
    const xpGained = Math.round(baseXP * streakMultiplier);

    const { leveled, newLevel } = applyXP(userData, xpGained);

    const activity = {
      id: uuidv4(),
      type,
      title: title || type,
      duration: Number(duration),
      intensity: Number(intensity) || 5,
      notes: notes || '',
      xpGained,
      date: new Date().toISOString()
    };

    userData.activities.unshift(activity);

    const canEvolve = checkEvolution(userData);
    writeData(userData);

    res.json({
      activity,
      xpGained,
      leveledUp: leveled,
      newLevel,
      streak,
      streakMultiplier,
      canEvolve,
      stats: userData.stats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  try {
    const userData = readData();
    res.json({ activities: userData.activities.slice(0, 20) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
