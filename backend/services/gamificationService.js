function calculateXPForActivity(type, duration, intensity) {
  const multipliers = { workout: 1.5, study: 1.0, journal: 0.8 };
  const multiplier = multipliers[type] || 1.0;
  const xp = Math.round(multiplier * duration * (intensity / 10) * 10);
  return Math.max(10, xp);
}

function applyXP(userData, xpGained) {
  userData.stats.xp += xpGained;
  userData.stats.totalXP += xpGained;
  let leveled = false;
  let newLevel = userData.stats.level;

  while (userData.stats.xp >= userData.stats.xpToNextLevel) {
    userData.stats.xp -= userData.stats.xpToNextLevel;
    userData.stats.level += 1;
    newLevel = userData.stats.level;
    userData.stats.xpToNextLevel = Math.floor(100 * Math.pow(1.3, newLevel - 1));
    leveled = true;
  }

  return { leveled, newLevel, xpGained };
}

function updateStreak(userData) {
  const today = new Date().toISOString().split('T')[0];
  const last = userData.stats.lastActivityDate;

  if (!last) {
    userData.stats.streak = 1;
  } else if (last === today) {
    // already logged today, keep streak
  } else {
    const lastDate = new Date(last);
    const todayDate = new Date(today);
    const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      userData.stats.streak += 1;
    } else {
      userData.stats.streak = 1;
    }
  }

  userData.stats.lastActivityDate = today;
  return userData.stats.streak;
}

function checkEvolution(userData) {
  const { level } = userData.stats;
  if (!userData.character) return false;
  if (level % 5 !== 0) return false;

  const lastEvolution = userData.evolutionHistory[userData.evolutionHistory.length - 1];
  if (lastEvolution && lastEvolution.level === level) return false;

  return true;
}

function getXPMultiplierForStreak(streak) {
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.2;
  if (streak >= 3) return 1.1;
  return 1.0;
}

module.exports = {
  calculateXPForActivity,
  applyXP,
  updateStreak,
  checkEvolution,
  getXPMultiplierForStreak
};
