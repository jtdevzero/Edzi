// Optional authenticated AI mentor; NEVER deploy before setting secrets, SQL
// rate limiting and reviewing the privacy terms. The static site has no model API key.
const origin=Deno.env.get('EDZI_ALLOWED_ORIGIN')||'https://jtdevzero.github.io';
const supa=(Deno.env.get('SUPABASE_URL')||'').replace(/\/$/,'');
const anon=Deno.env.get('SUPABASE_ANON_KEY')||'';
const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const anthropic=Deno.env.get('ANTHROPIC_API_KEY')||'';
const model=Deno.env.get('ANTHROPIC_MODEL')||'claude-sonnet-4-6';
const cors={ 'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};
function answer(status:number,data:Record<string,unknown>){
  return new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json'}});
}
function validPayload(p:unknown):p is Record<string,number|null>{
  if(!p||typeof p!=='object'||Array.isArray(p))return false;
  const a=p as Record<string,unknown>;
  const limits:Record<string,[number,number]>={
    recentWorkoutCount:[0,7],recentMinutes:[0,3000],hunterLevel:[1,999],
    currentStreak:[0,365],readiness:[1,5]
  };
  if(Object.keys(a).some(k=>!(k in limits)))return false;
  return Object.entries(limits).every(([k,[min,max]])=>{
    const value=a[k];
    return (k==='readiness'&&value===null) ||
      (typeof value==='number'&&Number.isInteger(value)&&value>=min&&value<=max);
  });
}
Deno.serve(async request=>{
  if(request.headers.get('origin')&&request.headers.get('origin')!==origin)
    return answer(403,{error:'Origin nem engedélyezett.'});
  if(request.method==='OPTIONS')return answer(200,{ok:true});
  if(request.method!=='POST')return answer(405,{error:'Method not allowed'});
  if(!supa||!anon||!service||!anthropic)return answer(503,{error:'Az AI-szolgáltatás nincs konfigurálva.'});
  const auth=request.headers.get('authorization')||'';
  if(!/^Bearer\s+\S{20,}$/.test(auth))return answer(401,{error:'Bejelentkezés szükséges.'});
  try{
    const u=await fetch(supa+'/auth/v1/user',{headers:{apikey:anon,Authorization:auth}});
    if(!u.ok)return answer(401,{error:'Lejárt vagy érvénytelen bejelentkezés.'});
    const user=await u.json();
    if(!user?.id)return answer(401,{error:'Érvénytelen felhasználó.'});
    if(Number(request.headers.get('content-length')||0)>2048)return answer(413,{error:'Túl nagy kérés.'});
    const payload=await request.json();
    if(!validPayload(payload))return answer(400,{error:'Érvénytelen, anonimizált összesítő adatok.'});
    const q=await fetch(supa+'/rest/v1/rpc/edzi_ai_guard',{
      method:'POST',headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json'},
      body:JSON.stringify({p_user_id:user.id})});
    if(!q.ok)return answer(503,{error:'A biztonsági korlát nem elérhető.'});
    if(await q.json()!==true)return answer(429,{error:'A napi 5 AI-kérés elfogyott.'});
    const upstream=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json','x-api-key':anthropic,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model,max_tokens:340,
        system:'You are an encouraging Hungarian-language fitness journal assistant. Be concise, avoid diagnoses, do not prescribe risky increases, prefer rest when energy is low. Use only anonymized aggregate values from the user, never imply access to private training logs. Respond in Hungarian, 3-5 sentences.',
        messages:[{role:'user',content:JSON.stringify(payload)}]})});
    if(!upstream.ok)return answer(502,{error:'Az AI-szolgáltató nem érhető el.'});
    const result=await upstream.json();
    const text=Array.isArray(result.content)?result.content.filter((x:any)=>x.type==='text').map((x:any)=>x.text).join(' '):'';
    if(!text)return answer(502,{error:'Üres AI-válasz.'});
    return answer(200,{message:text.slice(0,1500)});
  }catch{return answer(500,{error:'A kérés feldolgozása sikertelen.'});}
});
