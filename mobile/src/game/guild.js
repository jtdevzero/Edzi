import {dayKey,weekKey} from './gamification';
export const GUILD_TARGETS=[
  {id:'days',title:'Közös lendület',icon:'⚔',kind:'days',target:3},
  {id:'minutes',title:'Edzésmaraton',icon:'⌛',kind:'minutes',target:180},
  {id:'focus',title:'Tiszta elme',icon:'✦',kind:'focus',target:60}
];
export function sanitizeGuild(raw) {
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
  const name=String(raw.name||'').trim().slice(0,35);
  if(!name)return null;
  const members=Array.isArray(raw.members)?raw.members.filter(x=>typeof x==='string')
    .map(x=>x.trim().slice(0,24)).filter(Boolean).slice(0,6):[];
  return {name,members};
}
// Local squad challenges show ONLY this device's logs; friend's scores aren't inferred.
export function localGuildChallenges(state,today=dayKey()) {
  const week=weekKey(today);
  const all=(state.activities||[]).filter(a=>weekKey(dayKey(a.date))===week && dayKey(a.date)<=today);
  const workout=all.filter(a=>a.type==='workout');
  const metrics={
    days:new Set(workout.map(a=>dayKey(a.date))).size,
    minutes:workout.reduce((n,a)=>n+a.duration,0),
    focus:all.filter(a=>a.type==='study'||a.type==='journal').reduce((n,a)=>n+a.duration,0)
  };
  return GUILD_TARGETS.map(q=>({...q,current:Math.min(q.target,metrics[q.kind]),complete:metrics[q.kind]>=q.target}));
}
