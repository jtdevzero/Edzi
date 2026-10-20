import { serializeBackup,parseBackup } from '../game/backup';

// Explicit opt-in remote snapshots only. No background upload and no embedded secret.
// Supabase's publishable/anon key is public; row-level security is mandatory.
const URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/,'');
const KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const cloudEnabled = /^https:\/\/[A-Za-z0-9.-]+$/.test(URL) && KEY.length > 20;
function endpoint(path){if(!cloudEnabled)throw new Error('A felhő nincs konfigurálva.');return URL+path;}
async function request(path,options={},token=null){
  const resp=await fetch(endpoint(path),{
    ...options,
    headers:{apikey:KEY,Authorization:'Bearer '+(token||KEY),'Content-Type':'application/json',
      ...(options.headers||{})}
  });
  let data=null;
  try {data=await resp.json();}catch{}
  if(!resp.ok)throw new Error(data?.msg||data?.error_description||data?.message||`Felhő hiba (${resp.status})`);
  return data;
}
export async function requestEmailCode(email) {
  const address=String(email||'').trim().toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(address)||address.length>254)throw new Error('Adj meg egy érvényes email-címet.');
  await request('/auth/v1/otp',{method:'POST',body:JSON.stringify({email:address,create_user:true})});
  return address;
}
export async function verifyEmailCode(email,code) {
  const value=String(code||'').trim();
  if(!/^\d{6,8}$/.test(value))throw new Error('Add meg az emailben érkezett ellenőrzőkódot.');
  const auth=await request('/auth/v1/verify',{method:'POST',body:JSON.stringify({email,token:value,type:'email'})});
  if(!auth?.access_token)throw new Error('Sikertelen bejelentkezés.');
  const user=await request('/auth/v1/user',{},auth.access_token);
  if(!user?.id)throw new Error('Hiányzó felhasználói azonosító.');
  return {token:auth.access_token,userId:user.id,email:user.email||email};
}
async function remoteRow(session) {
  const userId=encodeURIComponent(session.userId);
  const result=await request(`/rest/v1/edzi_snapshots?user_id=eq.${userId}&select=revision,data,updated_at&limit=1`,{},session.token);
  return Array.isArray(result) ? result[0] || null : null;
}
export async function readCloudSnapshot(session){
  const row=await remoteRow(session);
  if(!row)return null;
  // The remote data is not trusted, even if written from the same account.
  const state=parseBackup(JSON.stringify({app:'edzi',state:row.data}));
  return {state,revision:row.revision,updatedAt:row.updated_at};
}
export async function uploadCloudSnapshot(session,state) {
  if(!session?.token)throw new Error('Először jelentkezz be.');
  // Revalidate local data using the same validator as file imports.
  const snapshot=parseBackup(serializeBackup(state));
  const current=await remoteRow(session);
  const path='/rest/v1/edzi_snapshots';
  if(!current){
    await request(path,{method:'POST',headers:{Prefer:'return=representation'},
      body:JSON.stringify({user_id:session.userId,revision:1,data:snapshot})},session.token);
    return 1;
  }
  if(!Number.isInteger(current.revision)||current.revision<1)throw new Error('Érvénytelen távoli verzió.');
  const next=current.revision+1;
  const rows=await request(`${path}?user_id=eq.${encodeURIComponent(session.userId)}&revision=eq.${current.revision}`,{
    method:'PATCH',headers:{Prefer:'return=representation'},
    body:JSON.stringify({revision:next,data:snapshot,updated_at:new Date().toISOString()})
  },session.token);
  if(!Array.isArray(rows)||rows.length!==1)throw new Error('A távoli mentés időközben változott. Ellenőrizd újra.');
  return next;
}

export async function deleteCloudSnapshot(session){
  if(!session?.token)throw new Error('Először jelentkezz be.');
  await request(`/rest/v1/edzi_snapshots?user_id=eq.${encodeURIComponent(session.userId)}`,
    {method:'DELETE'},session.token);
  return true;
}
