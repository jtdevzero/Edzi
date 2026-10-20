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

export const GUILD_RAIDS = [
  {id:'gate',title:'A Titánkapu ostroma',target:540,kind:'minutes',icon:'♜'},
  {id:'rally',title:'Kilencnapos hadjárat',target:9,kind:'days',icon:'⚔'},
  {id:'oracle',title:'Az Orákulum rejtélye',target:180,kind:'focus',icon:'✦'}
];
export function guildRaidProgress(scores=[]){
  const totals={days:0,minutes:0,focus:0};
  for(const score of scores){
    for(const kind of Object.keys(totals)){
      const value=score?.[kind];
      if(Number.isInteger(value)&&value>=0&&value<=10080)totals[kind]+=value;
    }
  }
  return GUILD_RAIDS.map(raid=>({...raid,current:Math.min(raid.target,totals[raid.kind]),
    complete:totals[raid.kind]>=raid.target}));
}
