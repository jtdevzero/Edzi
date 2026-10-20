import { setValue, setWeightKg } from './session';
import { dayKey, addDays } from './gamification';

export const DEFAULT_TRAINING_PLAN = {
  title: 'Személyes edzésterv',
  days: [
    { weekday: 1, title: 'A – teljes test', exercises: ['Guggolás rúddal', 'Fekvenyomás', 'Evezés rúddal'] },
    { weekday: 3, title: 'B – teljes test', exercises: ['Felhúzás', 'Vállból nyomás', 'Húzódzkodás'] },
    { weekday: 5, title: 'C – teljes test', exercises: ['Guggolás rúddal', 'Fekvenyomás', 'Bicepsz kézisúlyzóval'] }
  ]
};
export function cleanTrainingPlan(raw) {
  const fallback = DEFAULT_TRAINING_PLAN;
  if (!raw || typeof raw !== 'object') return fallback;
  const title = String(raw.title || fallback.title).trim().slice(0, 70);
  const days = Array.isArray(raw.days) ? raw.days.filter(d => Number.isInteger(d.weekday) && d.weekday >= 0 && d.weekday <= 6)
    .slice(0, 7).map(d => ({ weekday: d.weekday, title: String(d.title||'Edzésnap').slice(0, 50),
      exercises: Array.isArray(d.exercises) ? d.exercises.filter(x => typeof x === 'string').slice(0, 10) : [] })) : fallback.days;
  return { title, days };
}
export function trainingToday(plan, today = dayKey()) {
  const weekday = new Date(today + 'T12:00:00').getDay();
  return cleanTrainingPlan(plan).days.find(d => d.weekday === weekday) || null;
}
export function validateDetailedSet({ reps, weightKg, rpe, rir, warmup = false }) {
  const n = Number(reps), kg = Number(weightKg);
  if (!Number.isInteger(n) || n < 1 || n > 500 || !Number.isFinite(kg) || kg < 0 || kg > 1500)
    throw new Error('1–500 ismétlés és 0–1500 kg adható meg.');
  const R = rpe == null || rpe === '' ? null : Number(rpe);
  const I = rir == null || rir === '' ? null : Number(rir);
  if (R != null && (!Number.isFinite(R) || R < 1 || R > 10)) throw new Error('Az RPE 1 és 10 között lehet.');
  if (I != null && (!Number.isInteger(I) || I < 0 || I > 10)) throw new Error('A RIR 0–10 közötti egész szám.');
  return { reps:n, weightKg:kg, rpe:R, rir:I, warmup:!!warmup };
}
export function estimatedOneRepMax(reps, weightKg) {
  if (reps < 1 || reps > 12 || weightKg <= 0) return null;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}
export function exerciseInsights(activities, name) {
  let maxWeight=0, bestEstimated1RM=0, volume=0, sets=0;
  const sessions=[];
  for (const activity of [...activities].sort((a,b)=>a.date.localeCompare(b.date))) {
    let activityVolume=0, activitySets=0;
    for (const e of activity.exercises || []) {
      if (e.name !== name || e.unit !== 'reps') continue;
      for (const entry of e.sets || []) {
        const reps=setValue(entry), kg=setWeightKg(entry);
        if (!Number.isFinite(kg) || !Number.isFinite(reps) || reps < 0) continue;
        if (typeof entry === 'object' && entry?.warmup) continue;
        maxWeight=Math.max(maxWeight,kg);
        bestEstimated1RM=Math.max(bestEstimated1RM,estimatedOneRepMax(reps,kg)||0);
        volume+=reps*kg; activityVolume+=reps*kg; sets++; activitySets++;
      }
    }
    if (activitySets) sessions.push({ date:dayKey(activity.date), volumeKg:activityVolume, sets:activitySets });
  }
  return { name,maxWeight,bestEstimated1RM,volumeKg:Math.round(volume),sets,sessions };
}
export function nextLoadSuggestion(activities,name) {
  const recent=[...activities].sort((a,b)=>b.date.localeCompare(a.date)).flatMap(a=>
    (a.exercises||[]).filter(e=>e.name===name&&e.unit==='reps').flatMap(e=>[...(e.sets||[])].reverse()));
  const last=recent.find(x=>typeof x==='object'&&Number.isFinite(x.weightKg)&&!x.warmup);
  if(!last)return null;
  const effort = last.rpe == null ? (last.rir == null ? null : 10-last.rir) : last.rpe;
  if(effort==null)return { weightKg:last.weightKg, rationale:'RPE/RIR nélkül a legutóbbi súlyt javasoljuk.' };
  const suggestion=effort <=7.5 ? last.weightKg + 2.5 : effort >=9 ? last.weightKg : last.weightKg;
  return { weightKg:suggestion, rationale:effort <=7.5 ? 'Az előző sorozat könnyebb volt; óvatos +2,5 kg lehetséges.' :
    'Tartsd a súlyt, és figyeld a technikát és a regenerációt.' };
}
export function planWeekDates(startDay=dayKey()) {
  return Array.from({length:7},(_,i)=>addDays(startDay,i));
}
