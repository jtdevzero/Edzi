import React,{useState} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet} from 'react-native';
import {useCloudSession} from '../cloud/session';
import {cloudEnabled} from '../cloud/supabase';
import {createOnlineGuild,joinOnlineGuild,fetchOnlineGuild,uploadGuildContribution,leaveOnlineGuild} from '../cloud/guild';
import {useGame} from '../game/GameContext';
import {guildRaidProgress} from '../game/guild';
import {confirm} from '../utils/notify';
import {colors,card} from '../theme';
export default function OnlineGuild(){
  const {session}=useCloudSession();
  const {state}=useGame();
  const [name,setName]=useState(''),[nickname,setNickname]=useState(''),[code,setCode]=useState('');
  const [snapshot,setSnapshot]=useState(null),[loading,setLoading]=useState(false),[message,setMessage]=useState('');
  if(!cloudEnabled)return null;
  async function act(fn){
    if(loading)return;
    setLoading(true);try{await fn();}catch(e){setMessage(e.message)}finally{setLoading(false)}
  }
  function refresh(){return act(async()=>{setSnapshot(await fetchOnlineGuild(session));setMessage('Céhadatok lekérve.')})}
  if(!session)return <View style={[card,styles.root]}><Text style={styles.tag}>ONLINE GUILD / OPT-IN</Text>
    <Text style={styles.note}>Online céhhez jelentkezz be a Karakter / Felhőmentés menüpontban. Semmilyen edzésadat nem osztódik meg automatikusan.</Text></View>;
  return <View style={[card,styles.root]}>
    <Text style={styles.tag}>ONLINE GUILD / SELF-REPORTED TOTALS</Text>
    <Text style={styles.title}>Céhes kapcsolódás</Text>
    <Text style={styles.note}>Csak az általad elküldött heti aktív napok, edzés- és fókuszpercek osztódnak meg a céhtársaiddal. Név, testméret, terhelés és naplóbejegyzés nem.</Text>
    <Pressable style={styles.secondary} onPress={refresh}><Text style={styles.secondaryText}>Online céhem frissítése ↻</Text></Pressable>
    {snapshot?.guild?<><Text style={styles.title}>{snapshot.guild.name}</Text>
      <Text style={styles.members}>Meghívókód: {snapshot.guild.invite_code}</Text>
      {snapshot.members.map(member=>{
        const score=snapshot.scores.find(s=>s.user_id===member.user_id);
        return <View key={member.user_id} style={styles.member}><Text style={styles.memberName}>{member.nickname}</Text>
          <Text style={styles.note}>{score?`${score.days} nap · ${score.minutes} perc · ${score.focus} fókuszperc`:'Nincs beküldött eredmény'}</Text>
        </View>;
      })}
      <Text style={styles.tag}>COOPERATIVE RAID / SELF REPORTED</Text>
      {guildRaidProgress(snapshot.scores).map(raid=><View key={raid.id} style={styles.raid}>
        <View style={styles.raidHead}><Text style={styles.raidName}>{raid.icon} {raid.title}</Text>
          <Text style={styles.raidCount}>{raid.current}/{raid.target}</Text></View>
        <View style={styles.raidTrack}><View style={[styles.raidFill,{width:`${100*raid.current/raid.target}%`,
          backgroundColor:raid.complete?colors.green:colors.gold}]}/></View>
      </View>)}
      <Pressable style={styles.primary} onPress={()=>confirm('Heti összesítők megosztása',
        'Elküldjük a heti edzésnapjaid számát, edzés- és fókuszperceidet. A többi céhtag ezeket látni fogja. Küldhetjük?',
        ()=>act(async()=>{await uploadGuildContribution(session,snapshot.guild.id,state);
          setSnapshot(await fetchOnlineGuild(session));setMessage('Heti összesítés elküldve.');}))}>
        <Text style={styles.primaryText}>Heti eredmény megosztása</Text></Pressable>
      <Pressable style={styles.leave} onPress={()=>confirm('Céh elhagyása',
        'Kilépés után a saját heti céhes eredményeid törlődnek. Folytatod?',()=>act(async()=>{
          await leaveOnlineGuild(session,snapshot.guild.id);setSnapshot(null);setMessage('Kiléptél a céhből.');}))}>
        <Text style={styles.leaveText}>Online céh elhagyása</Text></Pressable>
    </>:<>
      <TextInput style={styles.input} maxLength={24} value={nickname} onChangeText={setNickname}
        placeholder="Publikus becenév a céhben" placeholderTextColor={colors.textMuted}/>
      <TextInput style={styles.input} maxLength={35} value={name} onChangeText={setName}
        placeholder="Új céh neve" placeholderTextColor={colors.textMuted}/>
      <Pressable style={styles.primary} disabled={loading} onPress={()=>act(async()=>{
        await createOnlineGuild(session,name,nickname);
        setSnapshot(await fetchOnlineGuild(session));setMessage('Online céh létrehozva.');
      })}><Text style={styles.primaryText}>Online céh alapítása</Text></Pressable>
      <TextInput style={styles.input} maxLength={32} value={code} onChangeText={setCode}
        placeholder="Meghívókód egy meglévő céhhez" placeholderTextColor={colors.textMuted}/>
      <Pressable style={styles.secondary} disabled={loading} onPress={()=>act(async()=>{
        await joinOnlineGuild(session,code,nickname);
        setSnapshot(await fetchOnlineGuild(session));setMessage('Csatlakoztál a céhhez.');
      })}><Text style={styles.secondaryText}>Csatlakozás meghívókóddal</Text></Pressable>
    </>}
    {message?<Text style={styles.status}>{message}</Text>:null}
    <Text style={styles.note}>A céh szervere csak saját Supabase-projektben telepített RLS + hitelesített RPC esetén érhető el. Az eredmények önbevalláson alapulnak, nem ellenőrzött sporteredmények.</Text>
  </View>;
}
const styles=StyleSheet.create({
  raid:{gap:7,backgroundColor:'#21253A',padding:12,borderRadius:13},
  raidHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
  raidName:{color:colors.text,fontSize:12,fontWeight:'900',flex:1},
  raidCount:{color:colors.gold,fontSize:11,fontWeight:'900'},
  raidTrack:{height:7,backgroundColor:colors.track,borderRadius:7,overflow:'hidden'},
  raidFill:{height:'100%',borderRadius:7},
  root:{gap:13,borderColor:'#69607D'},
  tag:{color:colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.2},
  title:{color:colors.text,fontSize:19,fontWeight:'900'},
  note:{color:colors.textMuted,fontSize:11,lineHeight:19},
  members:{color:colors.gold,fontSize:12,fontWeight:'800'},
  member:{borderColor:colors.cardBorder,borderTopWidth:1,paddingVertical:8,gap:3},
  memberName:{color:colors.text,fontWeight:'900',fontSize:13},
  input:{minHeight:46,backgroundColor:colors.input,borderRadius:12,paddingHorizontal:12,color:colors.text},
  primary:{backgroundColor:colors.primary,borderRadius:12,minHeight:48,alignItems:'center',justifyContent:'center',padding:9},
  primaryText:{fontWeight:'900',fontSize:12,color:'white'},
  secondary:{borderColor:colors.gold,borderWidth:1,borderRadius:12,minHeight:48,alignItems:'center',justifyContent:'center',padding:9},
  secondaryText:{color:colors.gold,fontWeight:'900',fontSize:12},
  leave:{alignItems:'center',padding:12},
  leaveText:{color:colors.red,fontWeight:'800',fontSize:11},
  status:{color:colors.cyan,fontSize:12,lineHeight:18}
});
