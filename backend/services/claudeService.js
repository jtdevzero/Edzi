const Anthropic = require('@anthropic-ai/sdk');
const { v4: uuidv4 } = require('uuid');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function parseJSON(text, fallback) {
  try {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return JSON.parse(match ? match[0] : text);
  } catch {
    return fallback;
  }
}

async function generateCharacter(imageBase64, userInfo = {}) {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are an anime character generator for a fitness RPG app.',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 }
            },
            {
              type: 'text',
              text: 'Based on this person\'s photo, create an anime-style RPG character for their fitness journey. Consider their appearance and create a character that embodies their potential as a warrior. Return ONLY valid JSON with these exact fields: {"name": string, "title": string, "description": string, "class": string, "animeStyle": string, "stats": {"strength": number 1-100, "stamina": number 1-100, "intelligence": number 1-100, "agility": number 1-100, "willpower": number 1-100}, "abilities": [3 strings], "backstory": string, "evolutionStage": 1, "weaknesses": [2 strings]}'
            }
          ]
        }
      ]
    });

    return parseJSON(response.content[0].text, {
      name: 'Unknown Warrior',
      title: 'The Awakened',
      description: 'A warrior whose power has yet to be fully realized.',
      class: 'Fighter',
      animeStyle: 'Shonen',
      stats: { strength: 50, stamina: 50, intelligence: 50, agility: 50, willpower: 50 },
      abilities: ['Iron Will', 'Rapid Strike', 'Endurance Aura'],
      backstory: 'A warrior forged through countless trials.',
      evolutionStage: 1,
      weaknesses: ['Impatience', 'Overconfidence']
    });
  } catch (err) {
    console.error('generateCharacter error:', err.message);
    throw err;
  }
}

async function generateDailyQuests(userData) {
  const { level, streak } = userData.stats;
  const recentActivities = (userData.activities || []).slice(-5).map(a => a.type).join(', ') || 'none';

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are a quest generator for an anime fitness RPG. Generate engaging daily quests.',
      messages: [
        {
          role: 'user',
          content: `Generate 3 daily quests for a level ${level} warrior with a ${streak}-day streak. Recent activities: ${recentActivities}. Return ONLY a JSON array of exactly 3 quest objects with fields: {"id": string, "title": string, "description": string, "xpReward": number, "category": "physical"|"mental"|"recovery", "difficulty": "easy"|"medium"|"hard", "youtubeId": string or null}`
        }
      ]
    });

    const quests = parseJSON(response.content[0].text, null);
    if (Array.isArray(quests) && quests.length === 3) {
      return quests.map(q => ({ ...q, id: q.id || uuidv4(), completed: false }));
    }
    return defaultQuests();
  } catch (err) {
    console.error('generateDailyQuests error:', err.message);
    return defaultQuests();
  }
}

function defaultQuests() {
  return [
    { id: uuidv4(), title: '30-Minute Workout', description: 'Complete any 30-minute workout session.', xpReward: 80, category: 'physical', difficulty: 'easy', youtubeId: 'ml6cT4AZdqI', completed: false },
    { id: uuidv4(), title: 'Study Session', description: 'Focus on learning for 45 minutes without distractions.', xpReward: 60, category: 'mental', difficulty: 'medium', youtubeId: null, completed: false },
    { id: uuidv4(), title: 'Recovery & Stretch', description: 'Do a 15-minute stretching or meditation session.', xpReward: 40, category: 'recovery', difficulty: 'easy', youtubeId: 'g_tea8ZNk5A', completed: false }
  ];
}

async function getCoachMessage(userData) {
  const { level, streak, totalXP } = userData.stats;
  const characterName = userData.character ? userData.character.name : 'Warrior';
  const recentActivity = userData.activities && userData.activities.length > 0
    ? userData.activities[userData.activities.length - 1].title
    : 'nothing yet';

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: 'You are a wise anime sensei coach in a fitness RPG. Speak with wisdom, occasionally stern but always motivating.',
      messages: [
        {
          role: 'user',
          content: `Give a motivational message to ${characterName}, a level ${level} warrior with a ${streak}-day streak and ${totalXP} total XP. Their last activity was: ${recentActivity}. Return ONLY valid JSON: {"message": string (2-3 sentences), "mood": "encouraging"|"stern"|"proud"|"mysterious", "quote": string (a short anime-style quote)}`
        }
      ]
    });

    return parseJSON(response.content[0].text, {
      message: `${characterName}, your journey has only just begun. Keep training every day and your power will grow beyond imagination.`,
      mood: 'encouraging',
      quote: 'The path of a warrior is never easy, but always worthwhile.'
    });
  } catch (err) {
    console.error('getCoachMessage error:', err.message);
    return {
      message: `${characterName}, your journey has only just begun. Keep training every day.`,
      mood: 'encouraging',
      quote: 'The path of a warrior is never easy, but always worthwhile.'
    };
  }
}

async function generateEvolution(userData, currentCharacter) {
  const { level } = userData.stats;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are an anime character evolution specialist for a fitness RPG.',
      messages: [
        {
          role: 'user',
          content: `Evolve this anime character who has reached level ${level}: ${JSON.stringify(currentCharacter)}. Increase all stats by 5-15 points (max 100), give them a new title, updated description, and new abilities reflecting their growth. Return ONLY valid JSON with the same structure as the input character, but evolved. Keep the same "name" field.`
        }
      ]
    });

    const evolved = parseJSON(response.content[0].text, null);
    if (evolved && evolved.name) {
      evolved.evolutionStage = (currentCharacter.evolutionStage || 1) + 1;
      return evolved;
    }
    return {
      ...currentCharacter,
      title: `${currentCharacter.title} (Evolved)`,
      evolutionStage: (currentCharacter.evolutionStage || 1) + 1,
      stats: Object.fromEntries(
        Object.entries(currentCharacter.stats).map(([k, v]) => [k, Math.min(100, v + 10)])
      )
    };
  } catch (err) {
    console.error('generateEvolution error:', err.message);
    return {
      ...currentCharacter,
      evolutionStage: (currentCharacter.evolutionStage || 1) + 1,
      stats: Object.fromEntries(
        Object.entries(currentCharacter.stats).map(([k, v]) => [k, Math.min(100, v + 10)])
      )
    };
  }
}

module.exports = { generateCharacter, generateDailyQuests, getCoachMessage, generateEvolution };
