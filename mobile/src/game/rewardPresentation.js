// Pure formatting: can be tested independently of React Native and works offline.
export function rewardPresentation(result, title='Küldetés teljesítve') {
  const value = Number.isFinite(result?.xpGained) ? result.xpGained : 0;
  const evolved = !!result?.evolved;
  const leveledUp = !!result?.leveledUp;
  return {
    heading: evolved ? 'EVOLÚCIÓ!' : leveledUp ? 'SZINTLÉPÉS!' : title,
    subtitle: evolved ? 'Új forma, új lehetőségek.' : leveledUp ? `${result.level}. szint elérve` : 'A következő szint közelebb van.',
    xp: value,
    emblem: evolved ? '✦' : leveledUp ? '⬆' : '⚡',
    achievements: result?.achievements || []
  };
}
