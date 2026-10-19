// Weekly trials are computed from completed logs; no manual claiming or duplicate reward state.
export const WEEKLY_TRIALS = [
  { id: 'three_days', emoji: '⚔️', title: 'Kitartó harcos', detail: 'Edzés legalább 3 különböző napon.', target: 3, xp: 60 },
  { id: 'training_120', emoji: '🔥', title: 'Erőpróba', detail: 'Összesen 120 perc edzés.', target: 120, xp: 50 },
  { id: 'focus_60', emoji: '📚', title: 'Harcos elme', detail: '60 perc tanulás vagy naplózás.', target: 60, xp: 40 }
];
function weekGroups(state, weekKey, dayKey) {
  const groups = {};
  for (const a of state.activities || []) {
    const day = dayKey(a.date);
    const week = weekKey(day);
    const g = (groups[week] ??= { trainingDays: new Set(), trainingMinutes: 0, focusMinutes: 0 });
    if (a.type === 'workout') {
      g.trainingDays.add(day);
      g.trainingMinutes += a.duration;
    } else if (a.type === 'study' || a.type === 'journal') g.focusMinutes += a.duration;
  }
  return groups;
}
function fromGroup(group) {
  const g = group || { trainingDays: new Set(), trainingMinutes: 0, focusMinutes: 0 };
  const metrics = [g.trainingDays.size, g.trainingMinutes, g.focusMinutes];
  return WEEKLY_TRIALS.map((trial, i) => ({
    ...trial,
    current: Math.min(metrics[i], trial.target),
    completed: metrics[i] >= trial.target
  }));
}
export function trialsForWeek(state, week, weekKey, dayKey) {
  return fromGroup(weekGroups(state, weekKey, dayKey)[week]);
}
export function weeklyRewardsByWeek(state, weekKey, dayKey) {
  return Object.fromEntries(Object.entries(weekGroups(state, weekKey, dayKey)).map(([week, group]) => [
    week, fromGroup(group).filter((t) => t.completed).reduce((xp, t) => xp + t.xp, 0)
  ]));
}
export function earnedWeeklyTrials(state, weekKey, dayKey) {
  const rewards = weeklyRewardsByWeek(state, weekKey, dayKey);
  return {
    xp: Object.values(rewards).reduce((n, xp) => n + xp, 0),
    completed: Object.values(weekGroups(state, weekKey, dayKey))
      .reduce((n, group) => n + fromGroup(group).filter((t) => t.completed).length, 0)
  };
}
