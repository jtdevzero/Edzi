import { dayKey } from './gamification';
import { setValue } from './session';

// Story regions are derived from historical activity, not stored claims.
// No extra XP or exploitable rewards are minted by exploring the map.
export const WORLD_REGIONS = [
  {id:'awakening',title:'Ébredés kapuja',subtitle:'A kezdet minden hősben ott él.',icon:'✦',level:1,kind:'sessions',target:1,gear:'origin',x:15,y:80},
  {id:'ironwoods',title:'Vaserdő',subtitle:'Következetességből kovácsolt erő.',icon:'♣',level:2,kind:'days',target:3,gear:'forest',x:72,y:69},
  {id:'azure',title:'Égszakadék',subtitle:'Öt óra mozgás nyoma.',icon:'◈',level:4,kind:'minutes',target:300,gear:'azure',x:25,y:50},
  {id:'citadel',title:'Árnyékcitadella',subtitle:'A legendák első nagy próbája.',icon:'♜',level:7,kind:'bosses',target:3,gear:'sentinel',x:72,y:31},
  {id:'summit',title:'Csillagcsúcs',subtitle:'Fegyelem, tudás és lendület.',icon:'✧',level:12,kind:'days',target:20,gear:'celestial',x:23,y:12}
];
export const WORLD_GEAR = [
  {id:'origin',name:'Kezdet páncélja',symbol:'◇',accent:'#9B9EE1',description:'Az első lépés jutalma.'},
  {id:'forest',name:'Vaserdő vértje',symbol:'♣',accent:'#5DD1AA',description:'3 különböző edzésnap.'},
  {id:'azure',name:'Égszakadék páncélja',symbol:'◈',accent:'#62C7EF',description:'300 perc edzés.'},
  {id:'sentinel',name:'Citadella őrzője',symbol:'♜',accent:'#E1BE89',description:'3 legyőzött boss.'},
  {id:'celestial',name:'Csillaglovag',symbol:'✧',accent:'#D4A8F0',description:'20 edzésnap.'}
];
export function worldProgress(state, progress, today = dayKey()) {
  const activities=(state.activities||[]).filter(a=>a.type==='workout' && dayKey(a.date)<=today);
  const metrics={
    sessions:activities.length,
    days:new Set(activities.map(a=>dayKey(a.date))).size,
    minutes:activities.reduce((n,a)=>n+a.duration,0),
    bosses:progress.bossWins||0
  };
  let previousComplete=true;
  return WORLD_REGIONS.map(region=>{
    const current=Math.min(region.target,metrics[region.kind]);
    const unlocked=previousComplete && progress.level>=region.level;
    const complete=unlocked && current>=region.target;
    previousComplete=complete;
    return {...region,current,unlocked,complete,metric:metrics[region.kind]};
  });
}
export function worldUnlockedGear(regions) {
  return WORLD_GEAR.map(item=>({...item,unlocked:regions.some(region=>region.gear===item.id&&region.complete)}));
}
export function selectWorldGear(character,regions){
  const all=worldUnlockedGear(regions);
  const preferred=character?.appearance?.gearId;
  return all.find(g=>g.id===preferred&&g.unlocked) || all.filter(g=>g.unlocked).at(-1) || all[0];
}
