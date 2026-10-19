const express = require('express');
const path = require('path');
const fs = require('fs');
const { getCoachMessage } = require('../services/claudeService');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '../data/user.json');

router.get('/message', async (req, res) => {
  try {
    const userData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const coachData = await getCoachMessage(userData);
    res.json(coachData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
