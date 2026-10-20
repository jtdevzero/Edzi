import React,{useState} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet} from 'react-native';
import {useGame} from '../game/GameContext';
import {cloudEnabled,requestEmailCode,verifyEmailCode,uploadCloudSnapshot,readCloudSnapshot,deleteCloudSnapshot} from '../cloud/supabase';
import {confirm,notify} from '../utils/notify';
import {colors,card} from '../theme';
import {useCloudSession} from '../cloud/session';

export default function CloudBackup(){
  const {state,importState,markBackedUp}=useGame();
  const [email,setEmail]=useState(''),[code,setCode]=useState(''),[submitted,setSubmitted]=useState('');
  const {session,setSession,signOut}=useCloudSession();
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState('');
  if(!cloudEnabled) return <View style={[card,styles.root]}>
    <Text style={styles.eyebrow}>CLOUD / NOT CONFIGURED</Text>
    <Text style={styles.title}>Felhőmentés előkészítve</Text>
    <Text style={styles.note}>A funkció csak saját Supabase-projekt, biztonságos hozzáférési szabályok és konfiguráció után kapcsolható be. Addig a JSON-mentés működik.</Text>
  </View>;
  async function act(fn){
    if(busy)return;setBusy(true);
    try{await fn();}catch(e){setStatus(e.message);notify('Felhőmentés',e.message);}
    finally{setBusy(false);}
  }
  return <View style={[card,styles.root]}>
    <Text style={styles.eyebrow}>SECURE VAULT / OPT-IN</Text>
    <Text style={styles.title}>Felhőmentés és visszaállítás</Text>
    <Text style={styles.note}>A teljes mentésed a saját, bejelentkezett fiókodhoz kerül. Csak akkor töltsd fel, ha ezt akarod; a felhőszolgáltató tárolni fogja az edzés- és testmérési adataidat.</Text>
    {!session?<>
      <TextInput style={styles.input} keyboardType="email-address" autoCapitalize="none" value={email}
        onChangeText={setEmail} placeholder="E-mail-cím" placeholderTextColor={colors.textMuted}/>
      <Pressable disabled={busy} style={styles.btn} onPress={()=>act(async()=>{
        setSubmitted(await requestEmailCode(email));setStatus('Ellenőrzőkódot kértünk. Nézd meg az e-mailjeidet.');
      })}><Text style={styles.btnText}>Belépőkód kérése</Text></Pressable>
      {submitted&&<>
        <TextInput style={styles.input} value={code} onChangeText={setCode} keyboardType="number-pad"
          placeholder="E-mailben kapott kód" placeholderTextColor={colors.textMuted}/>
        <Pressable disabled={busy} style={styles.btn} onPress={()=>act(async()=>{
          setSession(await verifyEmailCode(submitted,code));setCode('');setStatus('Bejelentkezés sikeres.');
        })}><Text style={styles.btnText}>Bejelentkezés</Text></Pressable>
      </>}
    </>:<>
      <Text style={styles.logged}>Bejelentkezve: {session.email}</Text>
      <Pressable disabled={busy} style={styles.btn} onPress={()=>confirm('Felhő felülírása',
        'A jelenlegi HELYI adatokkal felülírod a fiókod távoli mentését. Folytatod?',
        ()=>act(async()=>{const rev=await uploadCloudSnapshot(session,state);markBackedUp();setStatus(`Felhőmentés kész (verzió ${rev}).`);} ))}>
        <Text style={styles.btnText}>Helyi adatok mentése a felhőbe</Text>
      </Pressable>
      <Pressable disabled={busy} style={styles.secondary} onPress={()=>act(async()=>{
        const remote=await readCloudSnapshot(session);
        if(!remote){setStatus('Ehhez a fiókhoz még nincs felhőmentés.');return;}
        confirm('Távoli adatok visszaállítása',
          `A ${new Date(remote.updatedAt).toLocaleString('hu-HU')} időpontú mentés felülírja a HELYI adataidat. Előbb exportálj JSON-mentést! Folytatod?`,
          ()=>{importState(remote.state);setStatus('Távoli mentés betöltve.');});
      })}><Text style={styles.secondaryText}>Felhőmentés visszatöltése</Text></Pressable>
      <Pressable disabled={busy} onPress={()=>confirm('Felhőmentés törlése',
        'A távoli mentés végleg törlődik. A HELYI adataid megmaradnak. Előbb készíts JSON-exportot. Biztos?',
        ()=>act(async()=>{await deleteCloudSnapshot(session);setStatus('A felhőmentést töröltük. A helyi adatok változatlanok.');}))}
        style={styles.delete}><Text style={styles.deleteText}>Távoli adataim törlése</Text></Pressable>
      <Pressable onPress={()=>{signOut();setStatus('Kijelentkezve.');}}><Text style={styles.logout}>Kijelentkezés</Text></Pressable>
    </>}
    {status?<Text style={styles.status}>{status}</Text>:null}
    <Text style={styles.note}>A kapcsolat HTTPS-t használ, hozzáférést a Supabase RLS korlátozza. Nincs automatikus háttérszinkron, a belépés csak ebben a munkamenetben él.</Text>
  </View>;
}
const styles=StyleSheet.create({
  root:{gap:12},eyebrow:{color:colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.4},
  title:{color:colors.text,fontSize:19,fontWeight:'900'},note:{color:colors.textMuted,fontSize:11,lineHeight:18},
  input:{backgroundColor:colors.input,borderRadius:12,minHeight:47,color:colors.text,paddingHorizontal:12},
  btn:{backgroundColor:colors.primary,borderRadius:12,minHeight:48,justifyContent:'center',alignItems:'center'},
  btnText:{color:'white',fontSize:12,fontWeight:'900'},
  secondary:{borderWidth:1,borderColor:colors.gold,borderRadius:12,minHeight:47,justifyContent:'center',alignItems:'center'},
  secondaryText:{color:colors.gold,fontWeight:'800'},
  logged:{color:colors.green,fontSize:12},logout:{color:colors.textMuted,textAlign:'center',padding:10},
  status:{color:colors.cyan,fontSize:12,lineHeight:18},
  delete:{borderColor:colors.red,borderWidth:1,borderRadius:11,alignItems:'center',padding:12},
  deleteText:{color:colors.red,fontSize:12,fontWeight:'800'}
});
