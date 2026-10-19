const express = require('express');
const path = require('path');
const fs = require('fs');
const { generateDailyQuests } = require('../services/claudeService');
const { applyXP } = require('../services/gamificationService');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '../data/user.json');

function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

router.get('/daily', async (req, res) => {
  try {
    const userData = readData();
    const today = new Date().toISOString().split('T')[0];

    if (userData.quests.lastGenerated === today && userData.quests.daily.length > 0) {
      return res.json({ quests: userData.quests.daily });
    }

    const quests = await generateDailyQuests(userData);
    userData.quests.daily = quests;
    userData.quests.lastGenerated = today;
    writeData(userData);

    res.json({ quests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    const userData = readData();

    const quest = userData.quests.daily.find(q => q.id === id);
    if (!quest) return res.status(404).json({ error: 'Quest not found' });
    if (quest.completed) return res.status(400).json({ error: 'Quest already completed' });

    quest.completed = true;
    const { xpGained } = applyXP(userData, quest.xpReward);
    writeData(userData);

    res.json({ quest, xpGained: quest.xpReward, stats: userData.stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
