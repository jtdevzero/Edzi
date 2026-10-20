import { dayKey, addDays, weekKey, QUEST_XP, weeklyGoalFor, WEEKLY_GOAL_BONUS } from './gamification';
import { programDayXP } from './programs';
import { weeklyRewardsByWeek } from './weeklyTrials';
import { bossCampaigns } from './bosses';

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
  for (const p of state.programDays || []) {
    dayOf(p.date).xp += programDayXP(p.programId, p.day);
  }

  const weeks = {};
  for (const [key, d] of Object.entries(days)) {
    const w = (weeks[weekKey(key)] ??= { xp: 0, minutes: 0 });
    w.xp += d.xp;
    w.minutes += d.minutes;
  }

  // Include computed weekly goal and trial bonuses so weekly bars reconcile to overall XP.
  const activeByWeek = {};
  for (const a of state.activities) {
    const week = weekKey(dayKey(a.date));
    (activeByWeek[week] ??= new Set()).add(dayKey(a.date));
  }
  for (const [week, days] of Object.entries(activeByWeek)) {
    if (days.size >= weeklyGoalFor(state.settings, week)) {
      (weeks[week] ??= { xp: 0, minutes: 0 }).xp += WEEKLY_GOAL_BONUS;
    }
  }
  for (const [week, xp] of Object.entries(weeklyRewardsByWeek(state, weekKey, dayKey))) {
    (weeks[week] ??= { xp: 0, minutes: 0 }).xp += xp;
  }
  // Daily and weekly charts include the automatically earned boss XP.
  const bossWeeks=new Set(state.activities.filter(a=>a.type==='workout').map(a=>weekKey(dayKey(a.date))));
  for(const week of bossWeeks){
    const sunday=addDays(week,6);
    const reward=bossCampaigns(state,sunday).filter(b=>b.complete).reduce((n,b)=>n+b.xp,0);
    (weeks[week] ??= {xp:0,minutes:0}).xp+=reward;
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

import { setValue, setWeightKg } from './session';

// Legacy numeric sets are preserved; resistance sets may contain { reps, weightKg }.
export function computeExerciseRecords(state) {
  const records = {};
  const sorted = [...state.activities].sort((a, b) => a.date.localeCompare(b.date));
  for (const a of sorted) {
    for (const ex of a.exercises ?? []) {
      if (!ex.sets?.length) continue;
      const r = (records[ex.name] ??= {
        name: ex.name, unit: ex.unit, bestSet: 0, bestSession: 0,
        total: 0, sessions: 0, history: [], bestWeightKg: 0, volumeKg: 0
      });
      const values = ex.sets.map(setValue);
      const best = Math.max(...values);
      const sum = values.reduce((x, y) => x + y, 0);
      r.bestSet = Math.max(r.bestSet, best);
      r.bestSession = Math.max(r.bestSession, sum);
      r.total += sum;
      r.sessions += 1;
      if (ex.unit === 'reps') {
        r.bestWeightKg = Math.max(r.bestWeightKg, ...ex.sets.map(setWeightKg));
        r.volumeKg += ex.sets.reduce((n, s) => n + setValue(s) * setWeightKg(s), 0);
      }
      const day = dayKey(a.date);
      const last = r.history[r.history.length - 1];
      if (last?.day === day) last.value = Math.max(last.value, best);
      else r.history.push({ day, value: best });
    }
  }
  return records;
}

// Announce improvement over an earlier session, not the initial measurement.
export function newRecords(before, after, names) {
  return names.filter((n) => before[n] && after[n] &&
    (after[n].bestSet > before[n].bestSet || after[n].bestWeightKg > before[n].bestWeightKg));
}
