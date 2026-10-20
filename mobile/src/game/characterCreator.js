export const VISORS=[
  {id:'aurora',name:'Aurora',color:'#77DBF3'},
  {id:'ember',name:'Parázs',color:'#F7B46B'},
  {id:'violet',name:'Ultraibolya',color:'#B9A1FF'},
  {id:'mint',name:'Jade',color:'#66E5B9'}
];
export const HELMETS=[
  {id:'vanguard',name:'Vanguard'},
  {id:'shadow',name:'Árnyék'},
  {id:'royal',name:'Királyi'}
];
export function safeCreatorChoice(type,id){
  const list=type==='visor'?VISORS:type==='helmet'?HELMETS:[];
  return list.some(x=>x.id===id);
}
export function portraitOptions(character,gear) {
  const visor=VISORS.find(v=>v.id===character?.appearance?.visorId)||VISORS[0];
  const helmet=HELMETS.find(h=>h.id===character?.appearance?.helmetId)||HELMETS[0];
  return {visorColor:visor.color,helmetStyle:helmet.id,armorAccent:gear?.accent||'#AFA5EE'};
}
