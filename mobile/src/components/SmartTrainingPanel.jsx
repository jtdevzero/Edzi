import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {useGame} from '../game/GameContext';
import {smartLoadAdvice,groupSuperset} from '../game/smartTraining';
import {DEFAULT_TRAINING_PLAN,cleanTrainingPlan} from '../game/fitnessPro';
import {colors,card} from '../theme';
export default function SmartTrainingPanel(){
  const {state,updateSuperset,clearSuperset}=useGame();
  const plan=cleanTrainingPlan(state.trainingPlan||DEFAULT_TRAINING_PLAN);
  const names=[...new Set(plan.days.flatMap(d=>d.exercises))].slice(0,12);
  const [a,setA]=useState(names[0]||''),[b,setB]=useState(names[1]||'');
  const advice=a?smartLoadAdvice(state,a):null;
  return <View style={[card,styles.box]}>
    <Text style={styles.eyebrow}>SMART TRAINING / PROGRESSION</Text>
    <Text style={styles.title}>Edzésmotor</Text>
    <Text style={styles.description}>A következő terhelést az előző, ténylegesen naplózott sorozatokhoz és regenerációhoz igazítjuk.</Text>
    <View style={styles.choices}>{names.map(name=><Pressable key={name} onPress={()=>setA(name)}
      style={[styles.choice,a===name&&styles.on]}><Text style={styles.choiceLabel} numberOfLines={1}>{name}</Text></Pressable>)}</View>
    {advice&&<View style={styles.advice}>
      <Text style={styles.eyebrow}>{advice.kind.toUpperCase()} / SUGGESTION</Text>
      <Text style={styles.adviceTitle}>{advice.title}</Text>
      {advice.weightKg!=null&&<Text style={styles.weight}>{advice.weightKg} kg</Text>}
      <Text style={styles.description}>{advice.reason}</Text></View>}
    <Text style={styles.eyebrow}>SUPERSET PAIRS</Text>
    <Text style={styles.description}>Jelölj ki két gyakorlatot a heti tervből. A párosítás az edzésindításnál is megjelenik.</Text>
    <View style={styles.choices}>{names.filter(n=>n!==a).map(n=><Pressable key={n} onPress={()=>setB(n)}
      style={[styles.choice,n===b&&styles.on]}><Text style={styles.choiceLabel} numberOfLines={1}>{n}</Text></Pressable>)}</View>
    <Pressable disabled={!a||!b||a===b} onPress={()=>updateSuperset(a,b)} style={styles.button}>
      <Text style={styles.buttonText}>Szuperszett párosítása</Text></Pressable>
    {(state.supersets||[]).map(pair=><View key={pair.id} style={styles.pair}>
      <Text style={styles.pairLabel}>{pair.names.join(' + ')}</Text>
      <Pressable onPress={()=>clearSuperset(pair.id)}><Text style={styles.remove}>Törlés ×</Text></Pressable>
    </View>)}
    <Text style={styles.note}>A szuperszett jelenleg edzéstervbeli párosítás, nem automatikusan naplózott két sorozat. Fájdalom, sérülés vagy rossz technika esetén ne növeld a terhelést.</Text>
  </View>;
}
const styles=StyleSheet.create({
  box:{gap:13},eyebrow:{color:colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.3},
  title:{color:colors.text,fontSize:21,fontWeight:'900'},
  description:{color:colors.textMuted,fontSize:12,lineHeight:19},
  choices:{flexDirection:'row',flexWrap:'wrap',gap:7},
  choice:{maxWidth:'100%',padding:10,borderRadius:11,backgroundColor:colors.input,borderColor:colors.cardBorder,borderWidth:1},
  on:{borderColor:colors.gold,backgroundColor:'#403649'},
  choiceLabel:{color:colors.text,fontSize:11,fontWeight:'800'},
  advice:{backgroundColor:'#222235',padding:14,borderRadius:15,gap:8},
  adviceTitle:{color:colors.text,fontSize:16,fontWeight:'900'},
  weight:{color:colors.gold,fontSize:24,fontWeight:'900'},
  button:{backgroundColor:colors.primary,borderRadius:12,alignItems:'center',padding:12},
  buttonText:{color:'#fff',fontWeight:'900'},
  pair:{flexDirection:'row',justifyContent:'space-between',gap:10,alignItems:'center',paddingVertical:8,borderBottomColor:colors.cardBorder,borderBottomWidth:1},
  pairLabel:{flex:1,color:colors.textSoft,fontSize:12},remove:{color:colors.red,fontWeight:'800',fontSize:11},
  note:{color:colors.textMuted,fontSize:10,lineHeight:17}
});
