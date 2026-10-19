import { dayKey } from './gamification';
import { finishedPrograms } from './programs';
import { setValue, setWeightKg } from './session';

function countBy(list, fn) {
  return list.reduce((n, x) => n + (fn(x) ? 1 : 0), 0);
}

function buildContext(state, progress) {
  const typesByDay = {};
  for (const a of state.activities) {
    (typesByDay[dayKey(a.date)] ??= new Set()).add(a.type);
  }
  const questsByDay = {};
  for (const c of state.questCompletions) {
    questsByDay[c.date] = (questsByDay[c.date] ?? 0) + 1;
  }
  const hours = state.activities.map((a) => new Date(a.date).getHours());
  const exerciseTotal = (name) =>
    state.activities.reduce(
      (sum, a) => sum + (a.exercises ?? []).filter((e) => e.name === name).reduce((s, e) => s + e.sets.reduce((x, y) => x + setValue(y), 0), 0),
      0
    );
  const resistanceSets = state.activities.reduce((n, a) =>
    n + (a.exercises || []).reduce((total, e) =>
      total + (e.unit === 'reps' ? (e.sets?.length || 0) : 0), 0), 0);
  const volumeKg = state.activities.reduce((n, a) =>
    n + (a.exercises || []).reduce((total, e) =>
      total + (e.unit === 'reps' ? e.sets.reduce((v, s) =>
        v + setValue(s) * setWeightKg(s), 0) : 0), 0), 0);
  return {
    state,
    progress,
    resistanceSets,
    volumeKg,
    pushups: exerciseTotal('Fekvőtámasz'),
    pullups: exerciseTotal('Húzódzkodás'),
    plankSec: exerciseTotal('Plank'),
    logs: state.activities.length,
    study: countBy(state.activities, (a) => a.type === 'study'),
    journal: countBy(state.activities, (a) => a.type === 'journal'),
    workoutMinutes: state.activities.filter((a) => a.type === 'workout').reduce((s, a) => s + a.duration, 0),
    fullDays: Object.values(typesByDay).filter((t) => t.size === 3).length,
    allQuestDays: Object.values(questsByDay).filter((n) => n >= 3).length,
    early: countBy(hours, (h) => h < 7),
    late: countBy(hours, (h) => h >= 22),
    programsDone: finishedPrograms(state)
  };
}

const at = (current, target) => ({ current: Math.min(current, target), target });

export const ACHIEVEMENTS = [
  { id: 'trial_1', emoji: '🌟', title: 'Első hőspróba', description: 'Teljesíts egy heti hőspróbát.', check: (c) => at(c.progress.weeklyTrialsCompleted, 1) },
  { id: 'trial_10', emoji: '✨', title: 'Kitartás legendája', description: 'Teljesíts 10 heti hőspróbát.', check: (c) => at(c.progress.weeklyTrialsCompleted, 10) },
  { id: 'sets_30', emoji: '🏋️', title: 'Acélakarat', description: 'Rögzíts 30 ismétléses sorozatot.', check: (c) => at(c.resistanceSets, 30) },
  { id: 'volume_5000', emoji: '⚙️', title: 'Vaslovag', description: 'Mozgass meg összesen 5000 kg-ot naplózott súlyzós sorozatokkal.', check: (c) => at(c.volumeKg, 5000) },
  { id: 'first_log', emoji: '🌱', title: 'Az ébredés', description: 'Az első bejegyzés.', check: (c) => at(c.logs, 1) },
  { id: 'logs_10', emoji: '📒', title: 'Rendszeres', description: '10 bejegyzés.', check: (c) => at(c.logs, 10) },
  { id: 'logs_50', emoji: '📚', title: 'Krónikás', description: '50 bejegyzés.', check: (c) => at(c.logs, 50) },
  { id: 'streak_3', emoji: '🔥', title: 'Szikra', description: '3 napos streak.', check: (c) => at(c.progress.longestStreak, 3) },
  { id: 'streak_7', emoji: '🔥', title: 'Lángoló hét', description: '7 napos streak.', check: (c) => at(c.progress.longestStreak, 7) },
  { id: 'streak_30', emoji: '☄️', title: 'Kioltatlan tűz', description: '30 napos streak.', check: (c) => at(c.progress.longestStreak, 30) },
  { id: 'level_5', emoji: '⭐', title: 'Felfelé', description: 'Érd el az 5. szintet.', check: (c) => at(c.progress.level, 5) },
  { id: 'level_10', emoji: '🌟', title: 'Kétszámjegyű', description: 'Érd el a 10. szintet.', check: (c) => at(c.progress.level, 10) },
  { id: 'level_20', emoji: '👑', title: 'Legenda útján', description: 'Érd el a 20. szintet.', check: (c) => at(c.progress.level, 20) },
  { id: 'xp_1000', emoji: '💎', title: 'Ezres klub', description: '1000 XP összesen.', check: (c) => at(c.progress.totalXP, 1000) },
  { id: 'xp_5000', emoji: '💠', title: 'Ötezres', description: '5000 XP összesen.', check: (c) => at(c.progress.totalXP, 5000) },
  { id: 'study_10', emoji: '🧠', title: 'Tudásvadász', description: '10 tanulási alkalom.', check: (c) => at(c.study, 10) },
  { id: 'journal_7', emoji: '✍️', title: 'Belső hang', description: '7 naplóbejegyzés.', check: (c) => at(c.journal, 7) },
  { id: 'workout_600', emoji: '💪', title: '10 óra izzadás', description: 'Összesen 600 perc edzés.', check: (c) => at(c.workoutMinutes, 600) },
  { id: 'full_day', emoji: '⚔️', title: 'Teljes harcos', description: 'Edzés, tanulás és napló ugyanazon a napon.', check: (c) => at(c.fullDays, 1) },
  { id: 'quests_day', emoji: '🏆', title: 'Hibátlan nap', description: 'Mind a 3 napi quest egy napon.', check: (c) => at(c.allQuestDays, 1) },
  { id: 'quests_30', emoji: '📜', title: 'Küldetésmester', description: '30 teljesített quest.', check: (c) => at(c.state.questCompletions.length, 30) },
  { id: 'goal_1', emoji: '🎯', title: 'Célba ért', description: 'Teljesítsd a heti célt.', check: (c) => at(c.progress.weeksGoalMet, 1) },
  { id: 'goal_4', emoji: '🗓️', title: 'Egy hónap fegyelem', description: '4 héten teljesített heti cél.', check: (c) => at(c.progress.weeksGoalMet, 4) },
  { id: 'program_1', emoji: '🥋', title: 'Kihívás teljesítve', description: 'Fejezz be egy kihívás programot.', check: (c) => at(c.programsDone, 1) },
  { id: 'pushups_100', emoji: '🙌', title: 'Száz fekvő', description: '100 fekvőtámasz összesen edzésmódban.', check: (c) => at(c.pushups, 100) },
  { id: 'pushups_1000', emoji: '🦾', title: 'Ezer fekvő', description: '1000 fekvőtámasz összesen.', check: (c) => at(c.pushups, 1000) },
  { id: 'pullups_50', emoji: '🧗', title: 'Felhúzó', description: '50 húzódzkodás összesen.', check: (c) => at(c.pullups, 50) },
  { id: 'plank_300', emoji: '🪨', title: 'Kőszikla', description: '5 perc plank összesen.', check: (c) => at(c.plankSec, 300) },
  { id: 'early', emoji: '🌅', title: 'Hajnali harcos', description: 'Naplózz reggel 7 előtt.', check: (c) => at(c.early, 1) },
  { id: 'late', emoji: '🌙', title: 'Éjjeli bagoly', description: 'Naplózz este 10 után.', check: (c) => at(c.late, 1) }
];

export function computeAchievements(state, progress) {
  const ctx = buildContext(state, progress);
  return ACHIEVEMENTS.map(({ check, ...a }) => {
    const { current, target } = check(ctx);
    return { ...a, current, target, unlocked: current >= target };
  });
}

export function newlyUnlocked(before, after) {
  const was = new Set(before.filter((a) => a.unlocked).map((a) => a.id));
  return after.filter((a) => a.unlocked && !was.has(a.id));
}
