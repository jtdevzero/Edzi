import {cloudEnabled} from './supabase';
// Explicit launch gate: Cloud Vault setup alone must not switch on social sharing.
export const onlineGuildReady=cloudEnabled && process.env.EXPO_PUBLIC_EDZI_ONLINE_GUILDS_ENABLED==='true';
import {dayKey,weekKey} from '../game/gamification';
const BASE=(process.env.EXPO_PUBLIC_SUPABASE_URL||'').replace(/\/$/,'');
const KEY=process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY||'';
function api(session){
  if(!onlineGuildReady||!session?.token||!session.userId)throw new Error('A bejelentkezett felhőfiók szükséges.');
  return {headers:{apikey:KEY,Authorization:'Bearer '+session.token,'Content-Type':'application/json'}};
}
async function call(session,path,opts={}){
  const auth=api(session);
  const response=await fetch(BASE+'/rest/v1/'+path,{...opts,headers:{...auth.headers,...opts.headers}});
  const data=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(data?.message||data?.hint||'Céh szolgáltatás hiba.');
  return data;
}
export async function createOnlineGuild(session,name,nickname){
  return call(session,'rpc/edzi_create_guild',{method:'POST',body:JSON.stringify({p_name:name,p_nickname:nickname})});
}
export async function joinOnlineGuild(session,code,nickname){
  return call(session,'rpc/edzi_join_guild',{method:'POST',body:JSON.stringify({p_code:code,p_nickname:nickname})});
}
export async function fetchOnlineGuild(session,today=dayKey()){
  const user=encodeURIComponent(session.userId);
  const own=await call(session,'edzi_guild_members?user_id=eq.'+user+'&select=guild_id,nickname&limit=1');
  if(!own?.length)return null;
  const id=encodeURIComponent(own[0].guild_id);
  const [guilds,members,scores]=await Promise.all([
    call(session,'edzi_guilds?id=eq.'+id+'&select=id,name,invite_code&limit=1'),
    call(session,'edzi_guild_members?guild_id=eq.'+id+'&select=user_id,nickname'),
    call(session,'edzi_guild_contributions?guild_id=eq.'+id+'&week=eq.'+weekKey(today)+'&select=user_id,days,minutes,focus')
  ]);
  return {guild:guilds?.[0]||null,members:members||[],scores:scores||[]};
}
export function minimalGuildStats(state,today=dayKey()){
  const week=weekKey(today);
  const logs=(state.activities||[]).filter(a=>weekKey(dayKey(a.date))===week && dayKey(a.date)<=today);
  const w=logs.filter(a=>a.type==='workout');
  return {week,days:new Set(w.map(a=>dayKey(a.date))).size,
    minutes:Math.min(10080,w.reduce((n,a)=>n+a.duration,0)),
    focus:Math.min(10080,logs.filter(a=>['study','journal'].includes(a.type)).reduce((n,a)=>n+a.duration,0))};
}
export async function uploadGuildContribution(session,guildId,state){
  const payload={guild_id:guildId,user_id:session.userId,...minimalGuildStats(state)};
  await call(session,'edzi_guild_contributions?on_conflict=guild_id,user_id,week',{
    method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(payload)});
  return payload;
}
export async function leaveOnlineGuild(session,guildId){
  await call(session,'edzi_guild_members?guild_id=eq.'+encodeURIComponent(guildId)+'&user_id=eq.'+
    encodeURIComponent(session.userId),{method:'DELETE'});
}
