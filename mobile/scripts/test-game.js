import assert from 'node:assert/strict';
import { computeProgress, baseXP, levelFromTotalXP, xpForLevel, dayKey } from '../src/game/gamification';
import { questsForDay } from '../src/game/quests';
import { INITIAL_STATE } from '../src/game/store';
import { computeStats } from '../src/game/stats';
import { serializeBackup, parseBackup } from '../src/game/backup';
import { computeAchievements, newlyUnlocked } from '../src/game/achievements';
import { PROGRAMS, programRunStatus, programDayXP, finishedPrograms, PROGRAM_FINISH_BONUS } from '../src/game/programs';

const character = { name: 'Teszt', classId: 'hero' };
const at = (day, hour = 12) => new Date(`${day}T${String(hour).padStart(2, '0')}:00:00`).toISOString();
const workout = (id, day) => ({ id, type: 'workout', title: 'x', duration: 30, intensity: 7, date: at(day) });
const state = (activities, questCompletions = []) => ({ ...INITIAL_STATE, character, activities, questCompletions });

assert.equal(baseXP('workout', 30, 7), 63);
assert.equal(baseXP('journal', 1, 1), 5);

assert.deepEqual(levelFromTotalXP(0), { level: 1, xp: 0, xpToNextLevel: 100 });
assert.equal(levelFromTotalXP(99).level, 1);
assert.equal(levelFromTotalXP(100).level, 2);
assert.equal(levelFromTotalXP(100 + xpForLevel(2)).level, 3);

const today = '2026-10-19';
let p = computeProgress(state([workout('a', '2026-10-17'), workout('b', '2026-10-18'), workout('c', today)]), today);
assert.equal(p.streak, 3);
assert.equal(p.activeToday, true);
assert.equal(p.xpById.c, Math.round(63 * 1.1));

p = computeProgress(state([workout('a', '2026-10-17'), workout('b', '2026-10-18')]), today);
assert.equal(p.streak, 2, 'streak survives until the end of the next day');
assert.equal(p.activeToday, false);

p = computeProgress(state([workout('a', '2026-10-15')]), today);
assert.equal(p.streak, 0, 'streak breaks after a missed day');

p = computeProgress(state([workout('a', '2026-10-16'), workout('b', '2026-10-18'), workout('c', today)]), today);
assert.equal(p.streak, 3, 'one missed day is a rest day');
assert.ok(p.restDays.has('2026-10-17'));

p = computeProgress(state([workout('a', '2026-10-15'), workout('b', '2026-10-18'), workout('c', today)]), today);
assert.equal(p.streak, 2, 'two missed days break the streak');

p = computeProgress(state([
  workout('a', '2026-10-12'), workout('b', '2026-10-14'), workout('c', '2026-10-16'), workout('d', '2026-10-17')
]), '2026-10-17');
assert.equal(p.streak, 2, 'second rest day in the same week breaks the streak');
assert.equal(p.longestStreak, 2);

p = computeProgress(state([workout('a', '2026-10-09'), workout('b', '2026-10-11'), workout('c', '2026-10-13')]), '2026-10-13');
assert.equal(p.streak, 3, 'rest days in different weeks both count');

p = computeProgress(state([workout('a', '2026-10-17')]), today);
assert.equal(p.streak, 1, 'missing yesterday keeps the streak alive as a pending rest day');
assert.equal(p.restPending, true);
assert.equal(p.nextStreakMultiplier, 1.0);

p = computeProgress(state([workout('a', today), { ...workout('b', today), date: at(today, 18) }]), today);
assert.equal(p.streak, 1, 'two entries on one day count once');

const full = state([workout('a', '2026-10-18'), workout('b', today)]);
const withoutB = { ...full, activities: full.activities.filter((a) => a.id !== 'b') };
assert.equal(computeProgress(withoutB, today).totalXP, computeProgress(state([workout('a', '2026-10-18')]), today).totalXP);

const quests = questsForDay(today);
assert.equal(quests.length, 3);
assert.deepEqual(quests.map((q) => q.category), ['physical', 'mental', 'recovery']);
assert.deepEqual(questsForDay(today), quests, 'same quests all day');
const q = quests[0];
p = computeProgress(state([], [{ questId: q.id, date: today }]), today);
assert.equal(p.totalXP, q.xp);

p = computeProgress(state([]), today);
assert.deepEqual(p.attributes, { strength: 14, stamina: 12, agility: 8, intelligence: 6, willpower: 10 });
p = computeProgress(state([workout('a', today)]), today);
assert.equal(p.attributes.strength, 16);

assert.equal(dayKey(new Date(2026, 0, 5)), '2026-01-05');

{
  const st = state([workout('a', '2026-10-13'), workout('b', '2026-10-14'), { ...workout('c', today), type: 'study', duration: 60 }]);
  const pr = computeProgress(st, today);
  const stats = computeStats(st, pr, today);
  assert.equal(stats.heatmap.length, 12);
  assert.equal(stats.heatmap[11][0].key, today, 'last row starts on this Monday');
  assert.equal(stats.heatmap[11][0].level, 3);
  assert.equal(stats.heatmap[11][1].future, true);
  assert.equal(stats.heatmap[10][1].level, 2, '30 min on 2026-10-13');
  assert.equal(stats.weeklyXP.length, 8);
  assert.equal(stats.weeklyXP[6].xp, pr.xpById.a + pr.xpById.b);
  assert.equal(stats.minutesByType.study, 60);
  assert.equal(stats.records.bestWeekMinutes, 60);
  assert.equal(stats.records.activeDays, 3);
}

{
  const st = state([workout('a', today)], [{ questId: 'water', date: today }]);
  assert.deepEqual(parseBackup(serializeBackup(st)).activities, st.activities);
  assert.deepEqual(parseBackup(serializeBackup({ ...st, settings: undefined })).settings.weeklyGoals, [], 'old saves get defaults');
  assert.throws(() => parseBackup('nem json'), /hibás formátum/);
  assert.throws(() => parseBackup(JSON.stringify({ app: 'mas', state: {} })), /nem egy Edzi/);
  assert.throws(() => parseBackup(JSON.stringify({ app: 'edzi', state: { activities: [{ id: 1 }], questCompletions: [] } })), /nem egy Edzi/);
}

{
  const week = ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15'].map((d, i) => workout(`w${i}`, d));
  const three = computeProgress(state(week.slice(0, 3)), '2026-10-15');
  const four = computeProgress(state(week), '2026-10-15');
  assert.equal(three.weeksGoalMet, 0);
  assert.equal(four.weeksGoalMet, 1);
  assert.equal(four.totalXP - three.totalXP, four.xpById.w3 + 50, 'goal bonus is +50');
  assert.equal(four.thisWeekActiveDays, 4);

  const loweredLater = { ...state(week.slice(0, 2)), settings: { weeklyGoals: [{ from: '2026-10-19', goal: 1 }] } };
  assert.equal(computeProgress(loweredLater, today).weeksGoalMet, 0, 'lowering the goal does not pay out past weeks');
  assert.equal(computeProgress(loweredLater, today).weeklyGoal, 1);
  const loweredBefore = { ...state(week.slice(0, 2)), settings: { weeklyGoals: [{ from: '2026-10-12', goal: 2 }] } };
  assert.equal(computeProgress(loweredBefore, today).weeksGoalMet, 1);
}

{
  assert.deepEqual(PROGRAMS.map((p) => p.days.length), [30, 28, 14]);
  assert.match(PROGRAMS[0].days[0].tasks[0], /^10 fekvőtámasz/);
  assert.match(PROGRAMS[0].days[29].tasks[0], /^100 fekvőtámasz/);
  assert.equal(PROGRAMS[0].days[6].rest, true);
  assert.equal(programDayXP('saitama30', 30), 40 + PROGRAM_FINISH_BONUS);

  const run = { id: 'breathing14', startDate: '2026-10-18' };
  let st = { ...state([]), program: run, programDays: [{ programId: 'breathing14', runStart: '2026-10-18', day: 1, date: '2026-10-18' }] };
  let s1 = programRunStatus(st, today);
  assert.equal(s1.doneToday, false);
  assert.equal(s1.currentDay, 2);
  st = { ...st, programDays: [...st.programDays, { programId: 'breathing14', runStart: '2026-10-18', day: 2, date: today }] };
  s1 = programRunStatus(st, today);
  assert.equal(s1.doneToday, true);
  assert.equal(s1.currentDay, 2);
  assert.equal(computeProgress(st, today).totalXP, programDayXP('breathing14', 1) + programDayXP('breathing14', 2));

  const done = Array.from({ length: 14 }, (_, i) => ({ programId: 'breathing14', runStart: 'x', day: i + 1, date: `d${i}` }));
  assert.equal(finishedPrograms({ programDays: done }), 1);
  assert.equal(finishedPrograms({ programDays: done.slice(0, 13) }), 0);
}

{
  const empty = state([]);
  const before = computeAchievements(empty, computeProgress(empty, today));
  assert.ok(before.length >= 20);
  assert.equal(before.filter((a) => a.unlocked).length, 0);
  const one = state([{ ...workout('a', today), date: at(today, 6) }]);
  const after = computeAchievements(one, computeProgress(one, today));
  assert.deepEqual(newlyUnlocked(before, after).map((a) => a.id).sort(), ['early', 'first_log']);
  const logs10 = after.find((a) => a.id === 'logs_10');
  assert.deepEqual([logs10.current, logs10.target], [1, 10]);
}

console.log('Minden játéklogika teszt átment.');
