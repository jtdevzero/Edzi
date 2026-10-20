import {dayKey,addDays} from './gamification';
import {setValue,setWeightKg} from './session';

export function activeSets(activity,name) {
  return (activity.exercises||[]).filter(e=>e.name===name&&e.unit==='reps')
    .flatMap(e=>e.sets||[]).filter(s=>!(typeof s==='object'&&s?.warmup)&&setValue(s)>0)
    .map(s=>({reps:setValue(s),weightKg:setWeightKg(s),rpe:typeof s==='object'?s.rpe??null:null,
      rir:typeof s==='object'?s.rir??null:null}));
}
// Suggestions are based on the last completed session, not every single set.
export function smartLoadAdvice(state,exercise,today=dayKey()) {
  const sessions=[...(state.activities||[])].filter(a=>a.type==='workout'&&dayKey(a.date)<=today)
    .sort((a,b)=>b.date.localeCompare(a.date))
    .map(a=>({date:dayKey(a.date),sets:activeSets(a,exercise)})).filter(s=>s.sets.length);
  if(!sessions.length)return {kind:'baseline',title:'Kezdő terhelés',weightKg:null,
    reason:'Még nincs korábbi sorozat. Válassz kontrollált, technikailag kényelmes súlyt.'};
  const latest=sessions[0],weighted=latest.sets.filter(s=>s.weightKg>0);
  if(!weighted.length)return {kind:'technique',title:'Technika először',weightKg:null,
    reason:'Ez jelenleg testsúlyos vagy terhelés nélkül naplózott gyakorlat.'};
  const last=weighted.at(-1),maxRpe=Math.max(...weighted.map(s=>
    s.rpe!=null?s.rpe:s.rir!=null?10-s.rir:0));
  const recovery=[...(state.recoveryEntries||[])].filter(r=>dayKey(r.date)<=today)
    .sort((a,b)=>b.date.localeCompare(a.date))[0];
  const readiness=recovery && dayKey(recovery.date)>=addDays(today,-2)?recovery.readiness:null;
  if(readiness!=null&&readiness<=2)return {kind:'recovery',title:'Regeneráció előtérben',
    weightKg:Math.round(last.weightKg*0.9*2)/2,
    reason:'Az utóbbi két napban alacsony közérzetet jelöltél. A csökkentett terhelés csak opcionális támpont.'};
  if(maxRpe>=9 || weighted.some(s=>s.rir===0))return {kind:'hold',title:'Tartsd a terhelést',
    weightKg:last.weightKg,reason:'Magas RPE vagy nulla tartalék után ne emelj automatikusan.'};
  const known=weighted.filter(s=>s.rpe!=null||s.rir!=null);
  if(known.length && known.every(s=>(s.rpe==null?10-s.rir:s.rpe)<=7.5) && sessions.length>=2)
    return {kind:'progress',title:'Óvatos fejlődési javaslat',weightKg:Math.round((last.weightKg+2.5)*2)/2,
      reason:'Két edzés után, könnyebb terhelésérzettel: +2,5 kg csak megfelelő technika mellett.'};
  return {kind:'hold',title:'Stabil ismétlés',weightKg:last.weightKg,
    reason:'Figyeld a mozgás minőségét, az ismétlésszámot és a regenerációt.'};
}
export function groupSuperset(exercises,first,second) {
  if(first===second||!exercises.includes(first)||!exercises.includes(second))
    throw new Error('Két különböző meglévő gyakorlat szükséges.');
  return {id:first+'::'+second,names:[first,second]};
}
export function workoutWeekSummary(state,today=dayKey()) {
  const from=addDays(today,-6);
  const recent=(state.activities||[]).filter(a=>a.type==='workout'&&dayKey(a.date)>=from&&dayKey(a.date)<=today);
  return {sessions:recent.length,minutes:recent.reduce((n,a)=>n+a.duration,0),
    days:new Set(recent.map(a=>dayKey(a.date))).size};
}
