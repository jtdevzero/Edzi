import { dayKey, addDays, weekKey } from './gamification';
import { setValue,setWeightKg } from './session';
export function performanceOverview(state,today=dayKey()) {
  const workouts=(state.activities||[]).filter(a=>a.type==='workout' && dayKey(a.date)<=today);
  const first=addDays(today,-6), priorStart=addDays(today,-13),priorEnd=addDays(today,-7);
  const within=(start,end)=>workouts.filter(a=>dayKey(a.date)>=start && dayKey(a.date)<=end);
  const current=within(first,today),previous=within(priorStart,priorEnd);
  const mins=a=>a.reduce((n,e)=>n+e.duration,0);
  const volume=a=>a.reduce((n,e)=>n+(e.exercises||[]).reduce((v,ex)=>v+(ex.unit==='reps'?
    (ex.sets||[]).reduce((v,s)=>v+(typeof s==='object'&&s?.warmup?0:setValue(s)*setWeightKg(s)),0):0),0),0);
  const uniqueDays=a=>new Set(a.map(e=>dayKey(e.date))).size;
  const m=mins(current),prev=mins(previous),v=volume(current),pv=volume(previous);
  const change=(current,old)=>old>0?Math.round((current-old)/old*100):null;
  const latestCheckin=[...(state.recoveryEntries||[])].filter(x=>dayKey(x.date)<=today).sort((a,b)=>b.date.localeCompare(a.date))[0]||null;
  // Descriptive only. Not a medical recommendation or injury prediction.
  let insight='A fejlődés hosszú távon követhető; a pihenőnapok is fontosak.';
  if(latestCheckin?.readiness<=2)insight='Alacsony energiaszintet jelöltél. Ma lehet, hogy a könnyebb mozgás vagy a pihenés jobb.';
  else if(prev>0 && m>prev*1.5)insight='Az edzéspercek jelentősen nőttek az előző héthez képest. Figyeld a terhelhetőségedet.';
  else if(current.length===0)insight='Ezen a héten még nincs rögzített edzésed.';
  return {current:{minutes:m,volumeKg:Math.round(v),sessions:current.length,days:uniqueDays(current)},
    previous:{minutes:prev,volumeKg:Math.round(pv),sessions:previous.length},
    change:{minutesPct:change(m,prev),volumePct:change(v,pv)},
    recentCheckin:latestCheckin,insight };
}
export function validateRecovery(readiness,note=''){
  const val=Number(readiness);
  if(!Number.isInteger(val)||val<1||val>5)throw new Error('A közérzet 1–5 között értékelhető.');
  return {readiness:val,note:String(note).trim().slice(0,300)};
}
