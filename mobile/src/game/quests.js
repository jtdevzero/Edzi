export const QUEST_POOL = {
  physical: [
    { id: 'pushups_50', title: '50 fekvőtámasz', description: 'A nap folyamán, akárhány sorozatban.', xp: 40 },
    { id: 'squats_60', title: '60 guggolás', description: 'Lassan, teljes mozgástartományban.', xp: 40 },
    { id: 'walk_8k', title: '8000 lépés', description: 'Séta, lépcső, bármi számít.', xp: 35 },
    { id: 'plank_3', title: '3 perc plank összesen', description: 'Oszd el, ahogy bírod.', xp: 35 },
    { id: 'gtg_day', title: 'GtG nap', description: '5 kis sorozat húzódzkodás vagy fekvőtámasz a nap folyamán.', xp: 45 },
    { id: 'run_20', title: '20 perc kardió', description: 'Futás, bicikli, ugrókötél.', xp: 45 }
  ],
  mental: [
    { id: 'study_25', title: '1 pomodoro tanulás', description: '25 perc fókusz, telefon nélkül.', xp: 35 },
    { id: 'read_20', title: '20 oldal olvasás', description: 'Könyv, nem közösségi média.', xp: 30 },
    { id: 'learn_new', title: 'Tanulj meg egy új dolgot', description: 'Írd le a naplóba egy mondatban.', xp: 30 },
    { id: 'study_60', title: '2 pomodoro tanulás', description: '2 × 25 perc, közte 5 perc szünet.', xp: 50 }
  ],
  recovery: [
    { id: 'breath_5', title: '5 perc légzés', description: 'Box légzés: 4 be, 4 tart, 4 ki, 4 tart.', xp: 20 },
    { id: 'stretch_10', title: '10 perc nyújtás', description: 'Csípő, hát, váll.', xp: 25 },
    { id: 'journal', title: 'Esti napló', description: 'Mi ment jól ma? Mi a holnapi fő cél?', xp: 25 },
    { id: 'sleep_early', title: 'Lefekvés éjfél előtt', description: 'A regeneráció is edzés.', xp: 25 },
    { id: 'water', title: '2 liter víz', description: 'Egy palack mindig legyen nálad.', xp: 20 }
  ]
};

export const CATEGORY_LABELS = { physical: 'Fizikai', mental: 'Szellemi', recovery: 'Regeneráció' };

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function questsForDay(dayKey) {
  return Object.entries(QUEST_POOL).map(([category, pool]) => {
    const quest = pool[hashString(`${dayKey}:${category}`) % pool.length];
    return { ...quest, category };
  });
}
