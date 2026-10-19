import { notify } from './notify';
import { rewardPresentation } from '../game/rewardPresentation';
let listener = null;
export function subscribeRewards(callback) {
  listener = callback;
  return () => { if (listener === callback) listener = null; };
}
export function announceReward(result, { title, message }) {
  const payload = { ...rewardPresentation(result, title), message: message || '' };
  if (listener) listener(payload);
  else notify(`${payload.heading} · +${payload.xp} XP`, message || '');
}
