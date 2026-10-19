import { dayKey, addDays, weekKey, QUEST_XP } from './gamification';

export const HEATMAP_WEEKS = 12;
export const CHART_WEEKS = 8;

function heatLevel(minutes) {
  if (minutes <= 0) return 0;
  if (minutes <= 15) return 1;
  if (minutes <= 30) return 2;
  if (minutes <= 60) return 3;
  return 4;
}

export function computeStats(state, progress, today = dayKey()) {
  const days = {};
  const dayOf = (key) => (days[key] ??= { minutes: 0, xp: 0, count: 0 });
  const minutesByType = { workout: 0, study: 0, journal: 0 };

  for (const a of state.activities) {
    const d = dayOf(dayKey(a.date));
    d.minutes += a.duration;
    d.xp += progress.xpById[a.id] ?? 0;
    d.count += 1;
    minutesByType[a.type] = (minutesByType[a.type] ?? 0) + a.duration;
  }
  for (const c of state.questCompletions) {
    dayOf(c.date).xp += QUEST_XP[c.questId] ?? 0;
  }

  const weeks = {};
  for (const [key, d] of Object.entries(days)) {
    const w = (weeks[weekKey(key)] ??= { xp: 0, minutes: 0 });
    w.xp += d.xp;
    w.minutes += d.minutes;
  }

  const thisWeek = weekKey(today);
  const heatmapStart = addDays(thisWeek, -7 * (HEATMAP_WEEKS - 1));
  const heatmap = Array.from({ length: HEATMAP_WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, i) => {
      const key = addDays(heatmapStart, w * 7 + i);
      return {
        key,
        future: key > today,
        rest: progress.restDays.has(key),
        level: heatLevel(days[key]?.minutes ?? 0)
      };
    })
  );

  const weeklyXP = Array.from({ length: CHART_WEEKS }, (_, i) => {
    const key = addDays(thisWeek, -7 * (CHART_WEEKS - 1 - i));
    return { week: key, xp: weeks[key]?.xp ?? 0 };
  });

  const bestWeekMinutes = Math.max(0, ...Object.values(weeks).map((w) => w.minutes));

  return {
    heatmap,
    weeklyXP,
    minutesByType,
    records: {
      longestStreak: progress.longestStreak,
      bestWeekMinutes,
      activeDays: Object.values(days).filter((d) => d.count > 0).length,
      totalMinutes: minutesByType.workout + minutesByType.study + minutesByType.journal
    }
  };
}

export function computeExerciseRecords(state) {
  const records = {};
  const sorted = [...state.activities].sort((a, b) => a.date.localeCompare(b.date));
  for (const a of sorted) {
    for (const ex of a.exercises ?? []) {
      if (!ex.sets?.length) continue;
      const r = (records[ex.name] ??= { name: ex.name, unit: ex.unit, bestSet: 0, bestSession: 0, total: 0, sessions: 0, history: [] });
      const best = Math.max(...ex.sets);
      const sum = ex.sets.reduce((x, y) => x + y, 0);
      r.bestSet = Math.max(r.bestSet, best);
      r.bestSession = Math.max(r.bestSession, sum);
      r.total += sum;
      r.sessions += 1;
      const day = dayKey(a.date);
      const last = r.history[r.history.length - 1];
      if (last?.day === day) last.value = Math.max(last.value, best);
      else r.history.push({ day, value: best });
    }
  }
  return records;
}

// A first-ever entry is not announced as a record, only beating an existing best.
export function newRecords(before, after, names) {
  return names.filter((n) => before[n] && after[n] && after[n].bestSet > before[n].bestSet);
}
