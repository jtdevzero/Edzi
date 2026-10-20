import { normalizeState } from './store';
import { dayKey } from './gamification';

const BACKUP_APP = 'edzi';
const hasDOM = () => typeof document !== 'undefined';

export function serializeBackup(state) {
  return JSON.stringify({ app: BACKUP_APP, exportedAt: new Date().toISOString(), state }, null, 2);
}

export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Ez nem egy Edzi mentésfájl (hibás formátum).');
  }
  const s = data?.state;
  const validNumber = (x, min, max) => typeof x === 'number' && Number.isFinite(x) && x >= min && x <= max;
  const validDate = (d) => typeof d === 'string' && !Number.isNaN(Date.parse(d));
  const validSet = (v) =>
    validNumber(v, 0, 100000) ||
    (v && typeof v === 'object' && validNumber(v.reps, 0, 100000) &&
      validNumber(v.weightKg ?? 0, 0, 1500) &&
      (v.rpe === undefined || v.rpe === null || validNumber(v.rpe, 1, 10)) &&
      (v.rir === undefined || v.rir === null || (Number.isInteger(v.rir) && v.rir>=0 && v.rir<=10)) &&
      (v.warmup === undefined || typeof v.warmup === 'boolean'));
  const validExercises = (a) => a.exercises === undefined ||
    (Array.isArray(a.exercises) && a.exercises.every((e) =>
      e && typeof e.name === 'string' && ['reps', 'sec'].includes(e.unit) &&
      Array.isArray(e.sets) && e.sets.every(validSet)));
  const valid = data?.app === BACKUP_APP && s && typeof s === 'object' && !Array.isArray(s) &&
    Array.isArray(s.activities) && Array.isArray(s.questCompletions) &&
    s.activities.every((a) => a && typeof a.id === 'string' && validDate(a.date) &&
      validNumber(a.duration, 0, 10000) && validNumber(a.intensity, 1, 10) &&
      ['workout', 'study', 'journal'].includes(a.type) && validExercises(a)) &&
    s.questCompletions.every((q) => q && typeof q.questId === 'string' &&
      typeof q.date === 'string') &&
    (s.programDays === undefined || (Array.isArray(s.programDays) &&
      s.programDays.every((d) => d && typeof d.programId === 'string' &&
        typeof d.runStart === 'string' && Number.isInteger(d.day) && d.day > 0 &&
        typeof d.date === 'string' &&
        (d.activityId === undefined || typeof d.activityId === 'string')))) &&
    (s.bodyMeasurements === undefined || (Array.isArray(s.bodyMeasurements) &&
      s.bodyMeasurements.every((m) => m && typeof m.id === 'string' && validDate(m.date) &&
        validNumber(m.weightKg, 20, 600) &&
        ['waistCm', 'chestCm', 'hipsCm', 'armCm', 'thighCm'].every((field) =>
          m[field] == null || validNumber(m[field], 10, 400))))) &&
    (s.recoveryEntries === undefined || (Array.isArray(s.recoveryEntries) &&
      s.recoveryEntries.every(x=>x && typeof x.id==='string' && validDate(x.date) &&
        Number.isInteger(x.readiness) && x.readiness>=1 && x.readiness<=5 &&
        (x.note===undefined || typeof x.note==='string')))) &&
    (s.trainingPlan === undefined || s.trainingPlan === null || (s.trainingPlan &&
      typeof s.trainingPlan==='object' && !Array.isArray(s.trainingPlan) &&
      typeof s.trainingPlan.title==='string' && Array.isArray(s.trainingPlan.days) &&
      s.trainingPlan.days.length<=7 && s.trainingPlan.days.every(d=>d && Number.isInteger(d.weekday) &&
        d.weekday>=0 && d.weekday<=6 && typeof d.title==='string' && Array.isArray(d.exercises) &&
        d.exercises.length<=10 && d.exercises.every(e=>typeof e==='string')))) &&
    (s.preferences===undefined || (s.preferences && typeof s.preferences==='object' &&
      ['hunter','performance'].includes(s.preferences.appMode||'hunter'))) &&
    (s.settings === undefined || (s.settings && typeof s.settings === 'object' &&
      (s.settings.weeklyGoals === undefined || (Array.isArray(s.settings.weeklyGoals) &&
        s.settings.weeklyGoals.every((g) => g && typeof g.from === 'string' &&
          Number.isInteger(g.goal) && g.goal >= 1 && g.goal <= 7)))));
  if (!valid) throw new Error('Ez nem egy Edzi mentésfájl, vagy sérült.');
  return normalizeState(s);
}

export async function downloadBackup(state) {
  if (!hasDOM()) throw new Error('A mentés egyelőre csak a webes verzióban működik.');
  const filename = `edzi-mentes-${dayKey()}.json`;
  const blob = new Blob([serializeBackup(state)], { type: 'application/json' });
  const file = typeof File === 'function' ? new File([blob], filename, { type: 'application/json' }) : null;

  if (file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Edzi mentés' });
      return true;
    } catch (err) {
      if (err?.name === 'AbortError') return false;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

export function pickBackupFile() {
  if (!hasDOM()) return Promise.reject(new Error('A visszatöltés egyelőre csak a webes verzióban működik.'));
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      if (file.size > 5 * 1024 * 1024) return reject(new Error('A mentésfájl túl nagy (maximum 5 MB).'));
      file.text().then((text) => {
        try {
          resolve(parseBackup(text));
        } catch (err) {
          reject(err);
        }
      }, reject);
    };
    input.click();
  });
}
