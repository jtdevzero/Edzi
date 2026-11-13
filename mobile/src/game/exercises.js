// Exercise catalogue with muscle groups and equipment, plus user-defined exercises.
// Names of the first 18 entries are unchanged, so older logs keep their records.
import { dayKey, addDays } from './gamification';
import { setValue } from './session';

export const MUSCLE_GROUPS = {
  chest: 'Mell',
  back: 'Hát',
  legs: 'Láb',
  shoulders: 'Váll',
  arms: 'Kar',
  core: 'Törzs',
  cardio: 'Kardió',
  mobility: 'Mobilitás'
};

export const EQUIPMENT = {
  barbell: 'Rúd',
  dumbbell: 'Kézisúlyzó',
  machine: 'Gép / kábel',
  kettlebell: 'Kettlebell',
  bodyweight: 'Testsúly',
  other: 'Egyéb'
};

const ex = (name, muscle, equipment, search, extra = {}) =>
  ({ name, muscle, equipment, unit: 'reps', search, ...extra });
const W = { weighted: true };
const SEC = { unit: 'sec' };

export const EXERCISE_LIBRARY = [
  ex('Fekvenyomás', 'chest', 'barbell', 'bench press proper form', W),
  ex('Guggolás rúddal', 'legs', 'barbell', 'barbell squat proper form', W),
  ex('Felhúzás', 'back', 'barbell', 'deadlift proper form', W),
  ex('Evezés rúddal', 'back', 'barbell', 'barbell row proper form', W),
  ex('Vállból nyomás', 'shoulders', 'barbell', 'overhead press proper form', W),
  ex('Bicepsz kézisúlyzóval', 'arms', 'dumbbell', 'dumbbell curl form', W),
  ex('Fekvőtámasz', 'chest', 'bodyweight', 'push up proper form'),
  ex('Húzódzkodás', 'back', 'bodyweight', 'pull up proper form'),
  ex('Guggolás', 'legs', 'bodyweight', 'bodyweight squat proper form'),
  ex('Felülés', 'core', 'bodyweight', 'sit up proper form'),
  ex('Tolódzkodás', 'chest', 'bodyweight', 'dips proper form'),
  ex('Kitörés', 'legs', 'bodyweight', 'lunge proper form'),
  ex('Burpee', 'cardio', 'bodyweight', 'burpee proper form'),
  ex('Ugrásos guggolás', 'legs', 'bodyweight', 'jump squat proper form'),
  ex('Plank', 'core', 'bodyweight', 'plank proper form', SEC),
  ex('Hegymászó', 'core', 'bodyweight', 'mountain climbers proper form', SEC),
  ex('HIIT kör', 'cardio', 'bodyweight', '20 minute hiit no equipment', SEC),
  ex('Nyújtás', 'mobility', 'bodyweight', 'full body stretch 10 minutes', SEC),

  ex('Ferdepados fekvenyomás', 'chest', 'barbell', 'incline bench press proper form', W),
  ex('Fekvenyomás kézisúlyzóval', 'chest', 'dumbbell', 'dumbbell bench press proper form', W),
  ex('Tárogatás kézisúlyzóval', 'chest', 'dumbbell', 'dumbbell fly proper form', W),
  ex('Kábelkereszt', 'chest', 'machine', 'cable crossover proper form', W),
  ex('Mellgép', 'chest', 'machine', 'chest press machine form', W),

  ex('Lehúzás mellhez', 'back', 'machine', 'lat pulldown proper form', W),
  ex('Evezés ülve kábelen', 'back', 'machine', 'seated cable row proper form', W),
  ex('Egykezes evezés', 'back', 'dumbbell', 'one arm dumbbell row form', W),
  ex('T-rudas evezés', 'back', 'barbell', 't bar row proper form', W),
  ex('Hiperhajlítás', 'back', 'bodyweight', 'back extension proper form'),
  ex('Ausztrál húzódzkodás', 'back', 'bodyweight', 'inverted row proper form'),
  ex('Vállvonogatás', 'back', 'dumbbell', 'dumbbell shrug proper form', W),

  ex('Mellső guggolás', 'legs', 'barbell', 'front squat proper form', W),
  ex('Román felhúzás', 'legs', 'barbell', 'romanian deadlift proper form', W),
  ex('Lábtoló', 'legs', 'machine', 'leg press proper form', W),
  ex('Lábnyújtás', 'legs', 'machine', 'leg extension proper form', W),
  ex('Lábhajlítás', 'legs', 'machine', 'leg curl proper form', W),
  ex('Bolgár kitörés', 'legs', 'dumbbell', 'bulgarian split squat form', W),
  ex('Csípőemelés rúddal', 'legs', 'barbell', 'barbell hip thrust proper form', W),
  ex('Serleg guggolás', 'legs', 'kettlebell', 'goblet squat proper form', W),
  ex('Vádliemelés', 'legs', 'machine', 'calf raise proper form', W),
  ex('Kettlebell lendítés', 'legs', 'kettlebell', 'kettlebell swing proper form', W),
  ex('Fali ülés', 'legs', 'bodyweight', 'wall sit proper form', SEC),

  ex('Vállból nyomás kézisúlyzóval', 'shoulders', 'dumbbell', 'dumbbell shoulder press form', W),
  ex('Oldalemelés', 'shoulders', 'dumbbell', 'lateral raise proper form', W),
  ex('Előreemelés', 'shoulders', 'dumbbell', 'front raise proper form', W),
  ex('Döntött oldalemelés', 'shoulders', 'dumbbell', 'rear delt fly proper form', W),
  ex('Arc felé húzás', 'shoulders', 'machine', 'face pull proper form', W),
  ex('Pike fekvőtámasz', 'shoulders', 'bodyweight', 'pike push up proper form'),

  ex('Bicepsz rúddal', 'arms', 'barbell', 'barbell curl proper form', W),
  ex('Kalapács bicepsz', 'arms', 'dumbbell', 'hammer curl proper form', W),
  ex('Tricepsz letolás', 'arms', 'machine', 'triceps pushdown proper form', W),
  ex('Koponyazúzó', 'arms', 'barbell', 'skull crusher proper form', W),
  ex('Tricepsz nyújtás fej fölött', 'arms', 'dumbbell', 'overhead triceps extension form', W),
  ex('Szűk fekvőtámasz', 'arms', 'bodyweight', 'diamond push up proper form'),
  ex('Áll alá húzódzkodás', 'arms', 'bodyweight', 'chin up proper form'),

  ex('Lábemelés függésben', 'core', 'bodyweight', 'hanging leg raise proper form'),
  ex('Lábemelés fekve', 'core', 'bodyweight', 'lying leg raise proper form'),
  ex('Orosz csavar', 'core', 'bodyweight', 'russian twist proper form'),
  ex('Hasprés', 'core', 'bodyweight', 'crunch proper form'),
  ex('Hasgörgő', 'core', 'other', 'ab wheel rollout proper form'),
  ex('Oldalsó plank', 'core', 'bodyweight', 'side plank proper form', SEC),
  ex('Hollow tartás', 'core', 'bodyweight', 'hollow body hold form', SEC),
  ex('Farmer séta', 'core', 'dumbbell', 'farmers walk proper form', SEC),

  ex('Futás', 'cardio', 'other', 'running form beginners', SEC),
  ex('Kerékpár', 'cardio', 'other', 'cycling training beginners', SEC),
  ex('Evezőgép', 'cardio', 'machine', 'rowing machine proper form', SEC),
  ex('Ugrókötél', 'cardio', 'other', 'jump rope beginners', SEC),
  ex('Úszás', 'cardio', 'other', 'swimming technique beginners', SEC),
  ex('Gyaloglás', 'cardio', 'other', 'brisk walking benefits', SEC),
  ex('Lépcsőzés', 'cardio', 'other', 'stair climbing workout', SEC),
  ex('Terpeszugrás', 'cardio', 'bodyweight', 'jumping jacks proper form', SEC),

  ex('Jóga', 'mobility', 'bodyweight', 'yoga for beginners 20 minutes', SEC),
  ex('Csípőnyitás', 'mobility', 'bodyweight', 'hip mobility routine', SEC),
  ex('Vállmobilizálás', 'mobility', 'bodyweight', 'shoulder mobility routine', SEC),
  ex('Hengerezés', 'mobility', 'other', 'foam rolling full body', SEC)
];

export const MAX_CUSTOM_EXERCISES = 60;
export const EXERCISE_NAME_MAX = 40;

const sameName = (a, b) => a.toLocaleLowerCase('hu-HU') === b.toLocaleLowerCase('hu-HU');

/** Returns a clean custom exercise or throws a user-facing (Hungarian) error. */
export function sanitizeCustomExercise(input, existing = []) {
  const name = String(input?.name ?? '').replace(/\s+/g, ' ').trim().slice(0, EXERCISE_NAME_MAX);
  if (name.length < 2) throw new Error('Adj meg legalább 2 karakteres gyakorlatnevet.');
  if ([...EXERCISE_LIBRARY, ...existing].some((e) => sameName(e.name, name)))
    throw new Error('Ilyen nevű gyakorlat már van a listában.');
  if (existing.length >= MAX_CUSTOM_EXERCISES)
    throw new Error(`Legfeljebb ${MAX_CUSTOM_EXERCISES} saját gyakorlat menthető.`);
  const muscle = Object.hasOwn(MUSCLE_GROUPS, input?.muscle) ? input.muscle : 'core';
  const unit = input?.unit === 'sec' ? 'sec' : 'reps';
  return { name, muscle, unit, weighted: unit === 'reps' && !!input?.weighted, custom: true };
}

export function validCustomExercise(e) {
  return !!e && typeof e === 'object' && typeof e.name === 'string' &&
    e.name.length >= 2 && e.name.length <= EXERCISE_NAME_MAX &&
    Object.hasOwn(MUSCLE_GROUPS, e.muscle) && ['reps', 'sec'].includes(e.unit) &&
    (e.weighted === undefined || typeof e.weighted === 'boolean');
}

export function allExercises(state) {
  const custom = (state?.customExercises ?? []).map((e) => ({ equipment: 'other', search: '', ...e, custom: true }));
  return [...EXERCISE_LIBRARY, ...custom];
}

export function findExercise(state, name) {
  return allExercises(state).find((e) => e.name === name) ?? null;
}

/** Session-ready exercise for a name; unknown names fall back to weighted reps (as before). */
export function sessionExercise(state, name, fallback = {}) {
  const known = findExercise(state, name);
  return {
    name,
    unit: known?.unit ?? fallback.unit ?? 'reps',
    weighted: known ? !!known.weighted : fallback.weighted ?? true,
    search: known?.search ?? ''
  };
}

export function searchExercises(state, query = '', muscle = null) {
  const q = query.trim().toLocaleLowerCase('hu-HU');
  return allExercises(state).filter((e) =>
    (!muscle || e.muscle === muscle) && (!q || e.name.toLocaleLowerCase('hu-HU').includes(q)));
}

/**
 * Working sets (and timed minutes) per muscle group in the 7 days ending today,
 * next to the 7 days before. Warm-up sets and unknown exercises are not counted.
 */
export function muscleGroupVolume(state, today = dayKey()) {
  const from = addDays(today, -6), prevFrom = addDays(today, -13);
  const rows = Object.fromEntries(Object.keys(MUSCLE_GROUPS).map((id) =>
    [id, { id, label: MUSCLE_GROUPS[id], sets: 0, previousSets: 0, minutes: 0 }]));
  const byName = new Map(allExercises(state).map((e) => [e.name, e.muscle]));
  for (const a of state.activities ?? []) {
    if (a.type !== 'workout') continue;
    const day = dayKey(a.date);
    if (day < prevFrom || day > today) continue;
    const current = day >= from;
    for (const e of a.exercises ?? []) {
      const row = rows[byName.get(e.name)];
      if (!row) continue;
      const working = (e.sets ?? []).filter((s) => !(typeof s === 'object' && s?.warmup));
      if (current) {
        row.sets += working.length;
        if (e.unit === 'sec') row.minutes += working.reduce((n, s) => n + setValue(s), 0) / 60;
      } else row.previousSets += working.length;
    }
  }
  return Object.values(rows).map((r) => ({ ...r, minutes: Math.round(r.minutes) }));
}
