import { dayKey, weekKey } from './gamification';
import { setValue, setWeightKg } from './session';
// Boss progress and XP are derived from activity logs; no separate claim or duplicate state.
export const BOSSES = [
  { id:'iron_guardian', title:'Vasőrző', emoji:'⚔', description:'Edzés 2 külön napon', kind:'days', target:2, xp:35 },
  { id:'time_wraith', title:'Időlidérc', emoji:'⌛', description:'Legalább 90 perc edzés', kind:'minutes', target:90, xp:45 },
  { id:'titan', title:'Titán', emoji:'♜', description:'15 valódi erősítő sorozat', kind:'sets', target:15, xp:65 }
];
export function bossCampaigns(state, today = dayKey()) {
  const w=weekKey(today);
  const workouts=(state.activities||[]).filter(a=>a.type==='workout' && weekKey(dayKey(a.date))===w && dayKey(a.date)<=today);
  const days=new Set(workouts.map(a=>dayKey(a.date))).size;
  const minutes=workouts.reduce((t,a)=>t+a.duration,0);
  const sets=workouts.reduce((t,a)=>t+(a.exercises||[]).reduce((n,e)=>n+
    (e.unit==='reps'?(e.sets||[]).filter(s=>setValue(s)>0 && setWeightKg(s)>=0).length:0),0),0);
  const metrics={days,minutes,sets};
  return BOSSES.map(b=>({...b,progress:Math.min(b.target,metrics[b.kind]),complete:metrics[b.kind]>=b.target,week:w}));
}
export function earnedBossRewards(state) {
  const weeks=new Set((state.activities||[]).filter(a=>a.type==='workout').map(a=>weekKey(dayKey(a.date))));
  let xp=0,wins=0;
  for(const week of weeks){
    // Evaluation at Sunday prevents future logs from changing rewards for earlier weeks.
    const sunday=new Date(week+'T12:00:00');sunday.setDate(sunday.getDate()+6);
    const key=dayKey(sunday);
    for(const b of bossCampaigns(state,key))if(b.complete){xp+=b.xp;wins++;}
  }
  return {xp,wins};
}
