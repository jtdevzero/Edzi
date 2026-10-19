export function setValue(entry) {
  return typeof entry === 'number' ? entry : (entry && typeof entry.reps === 'number' ? entry.reps : 0);
}
export function setWeightKg(entry) {
  return typeof entry === 'object' && entry && Number.isFinite(entry.weightKg) ? entry.weightKg : 0;
}
export function formatSet(entry, unit) {
  if (unit === 'sec') return formatClock(setValue(entry));
  const kg = setWeightKg(entry);
  return kg > 0 ? `${setValue(entry)} × ${kg} kg` : `${setValue(entry)} ism.`;
}
export const REST_OPTIONS = [60, 90, 120];
export const INTERVAL_PRESETS = [
  { label: '40/20 × 8', work: 40, rest: 20, rounds: 8 },
  { label: '30/30 × 10', work: 30, rest: 30, rounds: 10 },
  { label: '20/10 × 8 (Tabata)', work: 20, rest: 10, rounds: 8 }
];

export function createSession({ title, templateId = null, program = null, exercises }, now = Date.now()) {
  return {
    startedAt: now,
    title,
    templateId,
    program,
    exercises: exercises.map((e) => ({ name: e.name, unit: e.unit, weighted: !!e.weighted, search: e.search, target: e.target ?? null, sets: [] })),
    current: 0,
    restSeconds: 90,
    restEndsAt: null,
    stopwatchStartedAt: null,
    interval: null
  };
}

export function elapsedSeconds(since, now = Date.now()) {
  return Math.max(0, Math.floor((now - since) / 1000));
}

export function sessionMinutes(session, now = Date.now()) {
  return Math.max(1, Math.round((now - session.startedAt) / 60000));
}

export function restRemaining(session, now = Date.now()) {
  if (!session.restEndsAt) return 0;
  return Math.max(0, Math.ceil((session.restEndsAt - now) / 1000));
}

export function intervalStatus(interval, now = Date.now()) {
  const { work, rest, rounds, startedAt } = interval;
  const cycle = work + rest;
  const t = elapsedSeconds(startedAt, now);
  const total = cycle * rounds - rest;
  if (t >= total) return { done: true, round: rounds, phase: 'done', remaining: 0, workSeconds: work * rounds };
  const round = Math.floor(t / cycle) + 1;
  const inCycle = t % cycle;
  const working = inCycle < work;
  return {
    done: false,
    round,
    phase: working ? 'work' : 'rest',
    remaining: working ? work - inCycle : cycle - inCycle,
    workSeconds: (round - 1) * work + (working ? inCycle : work)
  };
}

export function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const POMODORO = { focus: 25, break: 5 };

export function pomodoroStatus(startedAt, now = Date.now(), { focus, break: brk } = POMODORO) {
  const t = elapsedSeconds(startedAt, now);
  const cycle = (focus + brk) * 60;
  const round = Math.floor(t / cycle) + 1;
  const inCycle = t % cycle;
  const focusing = inCycle < focus * 60;
  const focusSeconds = (round - 1) * focus * 60 + Math.min(inCycle, focus * 60);
  return {
    round,
    phase: focusing ? 'focus' : 'break',
    remaining: focusing ? focus * 60 - inCycle : cycle - inCycle,
    completedRounds: focusing ? round - 1 : round,
    focusMinutes: Math.floor(focusSeconds / 60)
  };
}
