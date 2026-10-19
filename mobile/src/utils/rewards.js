import { notify } from './notify';

export function announceReward(result, { title, message }) {
  const lines = [message];
  if (result.achievements?.length) {
    lines.push('', 'Új jelvény:', ...result.achievements.map((a) => `${a.emoji} ${a.title}`));
  }
  let heading = `+${result.xpGained} XP · ${title}`;
  if (result.evolved) heading = `✨ EVOLÚCIÓ! +${result.xpGained} XP`;
  else if (result.leveledUp) heading = `⬆️ SZINTLÉPÉS! ${result.level}. szint · +${result.xpGained} XP`;
  notify(heading, lines.join('\n'));
}
