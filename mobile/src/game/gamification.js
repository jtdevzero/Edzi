import { getClass, evolutionStage } from './characters';
import { QUEST_POOL } from './quests';

export const ACTIVITY_TYPES = {
  workout: { label: 'Edzés', emoji: '💪', xpMultiplier: 1.5 },
  study: { label: 'Tanulás', emoji: '📚', xpMultiplier: 1.0 },
  journal: { label: 'Napló', emoji: '✍️', xpMultiplier: 0.8 }
};

const XP_BASE = 2;

export function dayKey(date = new Date()) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseDayKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, n) {
  const d = parseDayKey(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

function previousDayKey(key) {
  return addDays(key, -1);
}

export function weekKey(key) {
  const offsetFromMonday = (parseDayKey(key).getDay() + 6) % 7;
  return addDays(key, -offsetFromMonday);
}

export function baseXP(type, duration, intensity) {
  const mult = ACTIVITY_TYPES[type]?.xpMultiplier ?? 1;
  return Math.max(5, Math.round(mult * duration * (intensity / 10) * XP_BASE));
}

export function streakMultiplier(streak) {
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.2;
  if (streak >= 3) return 1.1;
  return 1.0;
}

export function xpForLevel(level) {
  return Math.floor(100 * Math.pow(1.3, level - 1));
}

export function levelFromTotalXP(totalXP) {
  let level = 1;
  let remaining = totalXP;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, xp: remaining, xpToNextLevel: xpForLevel(level) };
}

function attributeGains(activity) {
  const points = Math.max(1, Math.round((activity.duration * activity.intensity) / 100));
  switch (activity.type) {
    case 'workout':
      return activity.intensity >= 7
        ? { strength: points, stamina: points, agility: Math.ceil(points / 2) }
        : { strength: Math.ceil(points / 2), stamina: points };
    case 'study':
      return { intelligence: points };
    case 'journal':
      return { willpower: points };
    default:
      return {};
  }
}

export const QUEST_XP = Object.fromEntries(
  Object.values(QUEST_POOL).flat().map((q) => [q.id, q.xp])
);

// Everything is recomputed from the raw log so deleting an entry stays consistent.
export function computeProgress(state, today = dayKey()) {
  const activities = [...state.activities].sort((a, b) => a.date.localeCompare(b.date));
  const attributes = { ...getClass(state.character?.classId).base };

  let streak = 0;
  let longestStreak = 0;
  let lastDay = null;
  let totalXP = 0;
  const xpById = {};
  // One missed day per Monday-based week is forgiven as a rest day.
  const restDays = new Set();
  const restWeeks = new Set();
  const canRest = (missedDay) => !restWeeks.has(weekKey(missedDay));
  const takeRest = (missedDay) => {
    restDays.add(missedDay);
    restWeeks.add(weekKey(missedDay));
  };

  for (const activity of activities) {
    const day = dayKey(activity.date);
    if (day !== lastDay) {
      if (lastDay && previousDayKey(day) === lastDay) {
        streak += 1;
      } else if (lastDay && addDays(lastDay, 2) === day && canRest(addDays(lastDay, 1))) {
        takeRest(addDays(lastDay, 1));
        streak += 1;
      } else {
        streak = 1;
      }
      longestStreak = Math.max(longestStreak, streak);
      lastDay = day;
    }
    const xp = Math.round(baseXP(activity.type, activity.duration, activity.intensity) * streakMultiplier(streak));
    xpById[activity.id] = xp;
    totalXP += xp;
    for (const [key, value] of Object.entries(attributeGains(activity))) {
      attributes[key] += value;
    }
  }

  for (const completion of state.questCompletions) {
    totalXP += QUEST_XP[completion.questId] ?? 0;
  }

  const yesterday = previousDayKey(today);
  let streakAlive = lastDay === today || lastDay === yesterday;
  let restPending = false;
  if (!streakAlive && lastDay && addDays(lastDay, 2) === today && canRest(yesterday)) {
    streakAlive = true;
    restPending = true;
  }
  const currentStreak = streakAlive ? streak : 0;
  const levelInfo = levelFromTotalXP(totalXP);

  return {
    ...levelInfo,
    totalXP,
    streak: currentStreak,
    longestStreak,
    activeToday: lastDay === today,
    restDays: restPending ? new Set([...restDays, yesterday]) : restDays,
    restUsedThisWeek: restWeeks.has(weekKey(today)) || (restPending && weekKey(yesterday) === weekKey(today)),
    restPending,
    nextStreakMultiplier: streakMultiplier(lastDay === today ? streak : currentStreak + 1),
    attributes,
    evolutionStage: evolutionStage(levelInfo.level),
    xpById
  };
}
