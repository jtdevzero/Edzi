// Saved personal routines, "repeat a workout" and previous-performance lookups.
import { dayKey } from './gamification';
import { formatSet } from './session';
import { sessionExercise } from './exercises';

export const MAX_ROUTINES = 30;
export const ROUTINE_TITLE_MAX = 50;
const MAX_ROUTINE_EXERCISES = 20;

// Finished activities do not store `weighted`; a logged weight tells us instead.
const isWeighted = (e) => e.weighted ?? (e.sets ?? []).some((s) => typeof s === 'object' && s?.weightKg > 0);

export function validRoutine(r) {
  return !!r && typeof r === 'object' && typeof r.id === 'string' && r.id.length <= 60 &&
    typeof r.title === 'string' && r.title.length >= 1 && r.title.length <= ROUTINE_TITLE_MAX &&
    Array.isArray(r.exercises) && r.exercises.length >= 1 && r.exercises.length <= MAX_ROUTINE_EXERCISES &&
    r.exercises.every((e) => e && typeof e.name === 'string' && e.name.length >= 1 && e.name.length <= 100 &&
      ['reps', 'sec'].includes(e.unit) && (e.weighted === undefined || typeof e.weighted === 'boolean'));
}

/** Builds a routine from anything that has { title, exercises: [{ name, unit, weighted? }] }. */
export function buildRoutine(source, id, title = source?.title) {
  const seen = new Set();
  const exercises = (source?.exercises ?? [])
    .filter((e) => e && typeof e.name === 'string' && e.name && ['reps', 'sec'].includes(e.unit))
    .filter((e) => !seen.has(e.name) && seen.add(e.name))
    .slice(0, MAX_ROUTINE_EXERCISES)
    .map((e) => ({
      name: e.name.slice(0, 100),
      unit: e.unit,
      weighted: isWeighted(e)
    }));
  const cleanTitle = String(title ?? '').replace(/\s+/g, ' ').trim().slice(0, ROUTINE_TITLE_MAX);
  if (!exercises.length) throw new Error('A rutinhoz legalább egy gyakorlat kell.');
  if (!cleanTitle) throw new Error('Adj nevet a rutinnak.');
  return { id, title: cleanTitle, exercises };
}

export function addRoutine(routines, routine) {
  const others = routines.filter((r) => r.id !== routine.id && r.title !== routine.title);
  if (others.length >= MAX_ROUTINES) throw new Error(`Legfeljebb ${MAX_ROUTINES} rutin menthető.`);
  return [...others, routine];
}

/** Exercises for createSession(); library metadata wins so video links and units stay right. */
export function routineSessionExercises(state, routine) {
  // Also accepts a logged activity (same shape, plus sets).
  return routine.exercises.map((e) => sessionExercise(state, e.name, { unit: e.unit, weighted: isWeighted(e) }));
}

export function lastWorkoutWithExercises(state) {
  return [...(state.activities ?? [])]
    .filter((a) => a.type === 'workout' && a.exercises?.length)
    .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}

/** Sets of the most recent earlier session that contained this exercise. */
export function lastPerformance(state, name, before = null) {
  const sessions = [...(state.activities ?? [])]
    .filter((a) => a.type === 'workout' && (!before || a.date < before))
    .sort((a, b) => b.date.localeCompare(a.date));
  for (const a of sessions) {
    const match = (a.exercises ?? []).filter((e) => e.name === name && e.sets?.length);
    if (!match.length) continue;
    const unit = match[0].unit;
    const sets = match.flatMap((e) => e.sets);
    return { date: dayKey(a.date), unit, sets, summary: sets.map((s) => formatSet(s, unit)).join(' · ') };
  }
  return null;
}

export const HISTORY_FILTERS = { all: 'Mind', workout: 'Edzés', study: 'Tanulás', journal: 'Napló' };

export function filterHistory(activities, filter = 'all', limit = 20) {
  const list = [...(activities ?? [])]
    .filter((a) => filter === 'all' || a.type === filter)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { items: list.slice(0, limit), total: list.length, hasMore: list.length > limit };
}
