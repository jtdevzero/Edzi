export const ATTRIBUTES = [
  { key: 'strength', label: 'Erő' },
  { key: 'stamina', label: 'Állóképesség' },
  { key: 'agility', label: 'Gyorsaság' },
  { key: 'intelligence', label: 'Intelligencia' },
  { key: 'willpower', label: 'Akaraterő' }
];

export const CLASSES = [
  {
    id: 'hero',
    name: 'Hős',
    anime: 'One Punch Man',
    emoji: '👊',
    color: '#f59e0b',
    description: 'Egyszerű, kemény, napi edzés. Az erő a kitartásból jön.',
    base: { strength: 14, stamina: 12, agility: 8, intelligence: 6, willpower: 10 },
    titles: ['C-osztályú hős', 'B-osztályú hős', 'A-osztályú hős', 'S-osztályú hős', 'Együtéses legenda']
  },
  {
    id: 'shadow',
    name: 'Árnyvadász',
    anime: 'Solo Leveling',
    emoji: '🗡️',
    color: '#7c3aed',
    description: 'A leggyengébbként indulsz, és szintről szintre felülmúlod magad.',
    base: { strength: 10, stamina: 10, agility: 12, intelligence: 8, willpower: 10 },
    titles: ['E-rangú vadász', 'C-rangú vadász', 'A-rangú vadász', 'S-rangú vadász', 'Árnyak ura']
  },
  {
    id: 'slayer',
    name: 'Démonvadász',
    anime: 'Demon Slayer',
    emoji: '🔥',
    color: '#ef4444',
    description: 'Légzés, fókusz és technika. A test és az elme együtt fejlődik.',
    base: { strength: 9, stamina: 11, agility: 11, intelligence: 8, willpower: 11 },
    titles: ['Mizunoto kadét', 'Hinoe vadász', 'Kinoe vadász', 'Hashira', 'A Nap légzés mestere']
  },
  {
    id: 'scout',
    name: 'Felderítő',
    anime: 'Attack on Titan',
    emoji: '🪽',
    color: '#06b6d4',
    description: 'Állóképesség és gyorsaság. Soha nem adod fel.',
    base: { strength: 9, stamina: 14, agility: 13, intelligence: 7, willpower: 7 },
    titles: ['Újonc', 'Felderítő', 'Osztagvezető', 'Kapitány', 'Az emberiség legerősebbje']
  },
  {
    id: 'monk',
    name: 'Szerzetes',
    anime: 'Naruto',
    emoji: '📜',
    color: '#22c55e',
    description: 'A tanulás és a napló a fegyvered. A tudás is erő.',
    base: { strength: 7, stamina: 8, agility: 8, intelligence: 15, willpower: 12 },
    titles: ['Genin', 'Chunin', 'Jonin', 'Sannin', 'Hokage']
  }
];

export function getClass(id) {
  return CLASSES.find((c) => c.id === id) ?? CLASSES[0];
}

export const LEVELS_PER_EVOLUTION = 5;

export function evolutionStage(level) {
  return Math.min(Math.floor((level - 1) / LEVELS_PER_EVOLUTION), 4);
}

export function characterTitle(classId, level) {
  return getClass(classId).titles[evolutionStage(level)];
}
