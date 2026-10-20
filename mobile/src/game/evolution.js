import { evolutionStage, getClass } from './characters';

// Cosmetic unlocks are derived from real progress. No purchase, random drops or server.
export const HUNTER_STYLES = [
  { id: 'origin', name: 'Kezdet', emblem: '◇', minLevel: 1, accent: '#B9ACFF' },
  { id: 'vanguard', name: 'Előőrs', emblem: '⚔', minLevel: 6, accent: '#63CDEB' },
  { id: 'sentinel', name: 'Őrszem', emblem: '✦', minLevel: 11, accent: '#E6B976' },
  { id: 'ascendant', name: 'Felemelkedett', emblem: '◆', minLevel: 16, accent: '#BB9FFF' },
  { id: 'legend', name: 'Legenda', emblem: '♛', minLevel: 21, accent: '#FFD897' }
];
export const COSMETIC_TRAILS = [
  { id: 'none', name: 'Alap aura', minimumBosses: 0 },
  { id: 'ember', name: 'Parázs aura', minimumBosses: 1 },
  { id: 'aurora', name: 'Aurora aura', minimumBosses: 4 }
];
export function hunterEvolution(character, progress, bossWins = 0) {
  const classInfo = getClass(character?.classId);
  const stage = evolutionStage(progress.level);
  const styles = HUNTER_STYLES.map(s => ({ ...s, unlocked: progress.level >= s.minLevel }));
  const trails = COSMETIC_TRAILS.map(s => ({ ...s, unlocked: bossWins >= s.minimumBosses }));
  const preferred = character?.appearance?.styleId;
  const trail = character?.appearance?.trailId;
  return {
    title: classInfo.titles[stage], stage,
    styles, trails,
    style: styles.find(s => s.id === preferred && s.unlocked) || styles.filter(s => s.unlocked).at(-1),
    trail: trails.find(s => s.id === trail && s.unlocked) || trails[0],
    nextLevel: HUNTER_STYLES.find(s => !s.unlocked)?.minLevel || null
  };
}
export function validAppearanceChoice(type, id, evolution) {
  const options = type === 'style' ? evolution.styles : type === 'trail' ? evolution.trails : [];
  return options.some(s => s.id === id && s.unlocked);
}
