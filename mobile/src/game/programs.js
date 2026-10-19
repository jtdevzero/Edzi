export const PROGRAM_DAY_XP = 40;
export const PROGRAM_REST_DAY_XP = 20;
export const PROGRAM_FINISH_BONUS = 200;

const lerp = (from, to, i, n) => Math.round(from + ((to - from) * i) / (n - 1));

function saitamaDays() {
  return Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    if (day % 7 === 0) {
      return { rest: true, title: 'Regeneráció', tasks: ['10 perc nyújtás', 'Könnyű séta'] };
    }
    const reps = lerp(10, 100, i, 30);
    const km = Math.min(10, 1 + Math.floor(i / 3));
    return {
      title: `${reps} ismétlés`,
      tasks: [`${reps} fekvőtámasz`, `${reps} felülés`, `${reps} guggolás`, `${km} km futás`]
    };
  });
}

function gtgDays() {
  const weeks = [
    { sets: 5, reps: 2 },
    { sets: 6, reps: 3 },
    { sets: 7, reps: 3 },
    { sets: 8, reps: 4 }
  ];
  return Array.from({ length: 28 }, (_, i) => {
    const day = i + 1;
    const w = weeks[Math.floor(i / 7)];
    if (day % 7 === 0) {
      return { rest: true, title: 'Max teszt + pihenő', tasks: ['1 sorozat húzódzkodás, ameddig bírod', 'Írd be a naplóba, hányat csináltál'] };
    }
    return {
      title: `${w.sets} × ${w.reps} húzódzkodás`,
      tasks: [`${w.sets} sorozat × ${w.reps} húzódzkodás a nap folyamán`, 'Sorozatok között legalább 1 óra', 'Soha ne menj kifáradásig']
    };
  });
}

function breathingDays() {
  return Array.from({ length: 14 }, (_, i) => {
    const minutes = lerp(3, 10, i, 14);
    return {
      title: `${minutes} perc légzés`,
      tasks: [`${minutes} perc box légzés (4-4-4-4)`, `${Math.max(5, minutes)} perc nyújtás`, 'Utána 1 mondat a naplóba: hogy érzed magad?']
    };
  });
}

export const PROGRAMS = [
  {
    id: 'saitama30',
    name: 'Saitama 30 nap',
    anime: 'One Punch Man',
    emoji: '👊',
    description: '10-ről 100 ismétlésre 30 nap alatt. Minden 7. nap pihenő.',
    days: saitamaDays()
  },
  {
    id: 'gtg_pullup',
    name: 'GtG húzódzkodás 4 hét',
    anime: 'Attack on Titan',
    emoji: '🪽',
    description: 'Grease the Groove: sok kis sorozat a nap folyamán, hetente egy max teszttel.',
    days: gtgDays()
  },
  {
    id: 'breathing14',
    name: 'Démonvadász légzés 14 nap',
    anime: 'Demon Slayer',
    emoji: '🔥',
    description: 'Napi légzés és nyújtás, 3-ról 10 percre. Fókusz és nyugalom.',
    days: breathingDays()
  }
];

export function getProgram(id) {
  return PROGRAMS.find((p) => p.id === id) ?? null;
}

export function programDayXP(programId, day) {
  const program = getProgram(programId);
  const info = program?.days[day - 1];
  if (!info) return 0;
  const base = info.rest ? PROGRAM_REST_DAY_XP : PROGRAM_DAY_XP;
  return day === program.days.length ? base + PROGRAM_FINISH_BONUS : base;
}

export function programRunStatus(state, today) {
  if (!state.program) return null;
  const program = getProgram(state.program.id);
  if (!program) return null;
  const done = state.programDays.filter(
    (d) => d.programId === state.program.id && d.runStart === state.program.startDate
  );
  const doneToday = done.some((d) => d.date === today);
  const nextDay = done.length + 1;
  return {
    program,
    doneCount: done.length,
    doneToday,
    finished: done.length >= program.days.length,
    currentDay: doneToday ? done.length : nextDay,
    today: program.days[(doneToday ? done.length : nextDay) - 1] ?? null
  };
}

export function finishedPrograms(state) {
  const runs = {};
  for (const d of state.programDays) {
    const key = `${d.programId}:${d.runStart}`;
    runs[key] = Math.max(runs[key] ?? 0, d.day);
  }
  return Object.entries(runs).filter(([key, maxDay]) => maxDay >= (getProgram(key.split(':')[0])?.days.length ?? Infinity)).length;
}
