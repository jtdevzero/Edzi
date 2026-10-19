import assert from 'node:assert/strict';
import { computeProgress, baseXP, levelFromTotalXP, xpForLevel, dayKey } from '../src/game/gamification';
import { questsForDay } from '../src/game/quests';
import { INITIAL_STATE } from '../src/game/store';

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
assert.equal(p.streak, 2, 'gap resets the run');

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

console.log('Minden játéklogika teszt átment.');
