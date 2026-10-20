import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {useGame} from '../game/GameContext';
import {useCloudSession} from '../cloud/session';
import {aiReady,requestGenerativeCoach} from '../cloud/ai';
import {confirm,notify} from '../utils/notify';
import {mentorBrief} from '../game/mentor';
import {colors,card} from '../theme';
import {MythicIcon} from './MythicIcon';
export default function HunterMentor(){
  const {state,progress}=useGame();
  const {session}=useCloudSession();
  const [aiAnswer,setAiAnswer]=useState(null);
  const [busy,setBusy]=useState(false);
  function askAI(){
    if(busy||!session)return;
    confirm('Önkéntes AI-tanács','Az online AI-edzőhöz csak a heti edzésszám, percek, szint, streak és 1–5 közérzetérték kerül elküldésre. Név, edzésjegyzet, súly és testméret nem. Küldhetjük?',()=>{
      setBusy(true);
      requestGenerativeCoach(session,state,progress).then(setAiAnswer)
        .catch(e=>notify('AI-edző',e.message)).finally(()=>setBusy(false));
    });
  }
  const insight=mentorBrief(state,progress);
  return <View style={[card,styles.box]}>
    <View style={styles.top}><MythicIcon name="monk" size={47} color={colors.gold}/><View style={{flex:1,gap:5}}>
      <Text style={styles.eyebrow}>SENSEI / PRIVATE INTELLIGENCE</Text>
      <Text style={styles.heading}>{insight.title}</Text></View></View>
    <Text style={styles.body}>{insight.advice}</Text>
    {insight.training&&<View style={styles.tip}>
      <Text style={styles.tipLabel}>EDZŐI TÁMPONT · {insight.exercise}</Text>
      <Text style={styles.tipTitle}>{insight.training.title}
        {insight.training.weightKg!=null?` · ${insight.training.weightKg} kg`:''}</Text>
      <Text style={styles.body}>{insight.training.reason}</Text></View>}
    <Text style={styles.eyebrow}>MI ALAPJÁN?</Text>
    {insight.explanation.map((line,i)=><View key={i} style={{flexDirection:'row',alignItems:'center',gap:7}}><MythicIcon name="quest" size={14} color={colors.cyan}/><Text style={[styles.reason,{flex:1}]}>{line}</Text></View>)}
    <Text style={styles.note}>A fenti mentor offline, szabályalapú és nem továbbít személyes adatot.</Text>
    {aiReady && <View style={styles.remote}>
      <Text style={styles.eyebrow}>ONLINE AI SENSEI / KÜLÖN BELEEGYEZÉS</Text>
      <Text style={styles.note}>{session?'A generatív tanács külön gombnyomással kérhető; napi maximum 5 kérés.':'Az AI-edzőhöz jelentkezz be a Karakter / Felhőmentés menüpontban.'}</Text>
      {session&&<Pressable disabled={busy} onPress={askAI} style={styles.ask}><Text style={styles.askText}>{busy?'AI válasz készül…':'Generatív AI-edző megkérdezése'}</Text></Pressable>}
      {aiAnswer&&<Text style={styles.body}>{aiAnswer}</Text>}
    </View>}
  </View>;
}
const styles=StyleSheet.create({
  remote:{gap:12,padding:14,backgroundColor:'#182C2E',borderRadius:14,borderWidth:1,borderColor:'#47736A'},
  ask:{backgroundColor:colors.primary,borderRadius:12,minHeight:45,alignItems:'center',justifyContent:'center'},
  askText:{color:'#fff',fontSize:12,fontWeight:'900'},
  box:{gap:12,borderColor:'#486D66'},
  top:{flexDirection:'row',alignItems:'center',gap:13},
  symbol:{fontSize:39,color:colors.gold},
  eyebrow:{color:colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.4},
  heading:{color:colors.text,fontSize:20,fontWeight:'900'},
  body:{color:colors.textSoft,fontSize:13,lineHeight:21},
  tip:{backgroundColor:'#202F30',borderRadius:14,padding:14,gap:8},
  tipLabel:{color:colors.gold,fontSize:10,fontWeight:'900'},
  tipTitle:{color:colors.text,fontSize:15,fontWeight:'900'},
  reason:{color:colors.textMuted,fontSize:11,lineHeight:18},
  note:{color:colors.textMuted,fontSize:10,lineHeight:17}
});
