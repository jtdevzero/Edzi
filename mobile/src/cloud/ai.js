import {performanceOverview} from '../game/performance';
import {dayKey,addDays} from '../game/gamification';
// External generative AI is disabled until the project owner deploys a secured
// Supabase Edge Function and provides the already-public Supabase project URL/key.
const BASE=(process.env.EXPO_PUBLIC_SUPABASE_URL||'').replace(/\/$/,'');
const ANON=process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY||'';
export const aiReady=process.env.EXPO_PUBLIC_EDZI_AI_ENABLED==='true' && /^https:\/\/[a-z0-9.-]+$/i.test(BASE)&&ANON.length>20;
export function minimalAIPayload(state,progress,today=dayKey()){
  const overview=performanceOverview(state,today);
  // Share no name, birth date, location, measurements, notes or raw workout history.
  const from=addDays(today,-6);
  const recent=(state.activities||[]).filter(a=>a.type==='workout' &&
    dayKey(a.date)>=from && dayKey(a.date)<=today);
  return {
    recentWorkoutCount:Math.min(recent.length,7),
    recentMinutes:Math.min(3000,recent.reduce((n,a)=>n+a.duration,0)),
    hunterLevel:Math.min(999,Math.max(1,progress.level||1)),
    currentStreak:Math.min(365,Math.max(0,progress.streak||0)),
    readiness:Number.isInteger(overview.recentCheckin?.readiness)
      ? Math.max(1,Math.min(5,overview.recentCheckin.readiness)) : null
  };
}
export async function requestGenerativeCoach(session,state,progress){
  if(!aiReady)throw new Error('Az online AI-edző nincs konfigurálva.');
  if(!session?.token)throw new Error('Jelentkezz be a Karakter / Felhőmentés menüpontban.');
  const response=await fetch(BASE+'/functions/v1/hunter-coach',{
    method:'POST',headers:{'Content-Type':'application/json',apikey:ANON,Authorization:'Bearer '+session.token},
    body:JSON.stringify(minimalAIPayload(state,progress))
  });
  const result=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(result?.error||'Az AI-edző most nem elérhető.');
  if(typeof result?.message!=='string')throw new Error('Érvénytelen AI-válasz.');
  return result.message.slice(0,1500);
}
