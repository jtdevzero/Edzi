const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateCharacter, generateEvolution } = require('../services/claudeService');
const { checkEvolution } = require('../services/gamificationService');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '../data/user.json');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

router.post('/create', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });

    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString('base64');

    const character = await generateCharacter(imageBase64, {});

    const userData = readData();
    userData.character = { ...character, photoPath: `/uploads/${req.file.filename}` };
    writeData(userData);

    res.json({ character: userData.character, stats: userData.stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  try {
    const userData = readData();
    res.json({ character: userData.character, stats: userData.stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/evolve', async (req, res) => {
  try {
    const userData = readData();

    if (!checkEvolution(userData)) {
      return res.status(400).json({ error: 'Evolution not available yet. Reach the next level milestone (5, 10, 15...).' });
    }

    const evolvedCharacter = await generateEvolution(userData, userData.character);

    userData.evolutionHistory.push({
      level: userData.stats.level,
      date: new Date().toISOString(),
      previousTitle: userData.character.title,
      newTitle: evolvedCharacter.title,
      evolutionStage: evolvedCharacter.evolutionStage
    });
    userData.character = { ...evolvedCharacter, photoPath: userData.character.photoPath };
    writeData(userData);

    res.json({ character: userData.character, evolutionHistory: userData.evolutionHistory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
