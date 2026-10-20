import React,{useState} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet} from 'react-native';
import {useGame} from '../game/GameContext';
import {DEFAULT_TRAINING_PLAN,cleanTrainingPlan,trainingToday,nextLoadSuggestion} from '../game/fitnessPro';
import {createSession} from '../game/session';
import {EXERCISE_LIBRARY} from '../game/templates';
import {colors,card} from '../theme';
import {smartLoadAdvice} from '../game/smartTraining';
const WEEKDAYS=['Vasárnap','Hétfő','Kedd','Szerda','Csütörtök','Péntek','Szombat'];
export default function TrainingPlanner(){
  const {state,setTrainingPlan,startSession}=useGame();
  const plan=cleanTrainingPlan(state.trainingPlan||DEFAULT_TRAINING_PLAN);
  const pairs=state.supersets||[];
  const [editing,setEditing]=useState(false);
  const [newDay,setNewDay]=useState(1);
  const [title,setTitle]=useState('');
  const [exercises,setExercises]=useState('');
  const active=trainingToday(plan);
  function addDay(){
    const list=exercises.split(',').map(s=>s.trim()).filter(Boolean).slice(0,10);
    const days=plan.days.filter(d=>d.weekday!==newDay).concat({weekday:newDay,title:title.trim()||'Saját edzés',exercises:list});
    setTrainingPlan({...plan,days:days.sort((a,b)=>a.weekday-b.weekday)});
    setTitle('');setExercises('');setEditing(false);
  }
  function start(day){
    const exercises=day.exercises.map(name=>{
      const known=EXERCISE_LIBRARY.find(e=>e.name===name);
      return {name,unit:known?.unit||'reps',weighted:known?.weighted??true,search:known?.search||''};
    });
    startSession(createSession({title:day.title,exercises}));
  }
  return <View style={[card,styles.box]}>
    <View style={styles.row}><View style={{flex:1}}><Text style={styles.eyebrow}>FITNESS PRO 2.0 / SCHEDULE</Text>
      <Text style={styles.heading}>{plan.title}</Text></View>
      <Pressable onPress={()=>setEditing(v=>!v)} style={styles.edit}><Text style={styles.action}>{editing?'Bezárás':'Szerkesztés'}</Text></Pressable>
    </View>
    {active&&<View style={styles.today}><Text style={styles.todayLabel}>MAI EDZÉS · {active.title}</Text>
      <Pressable onPress={()=>start(active)} style={styles.cta}><Text style={styles.ctaText}>Mai edzés indítása ↗</Text></Pressable></View>}
    {plan.days.map(day=><View key={day.weekday} style={styles.day}>
      <View style={{flex:1}}><Text style={styles.dayName}>{WEEKDAYS[day.weekday]} · {day.title}</Text>
        <Text style={styles.muted}>{day.exercises.length?day.exercises.join(' · '):'Válassz gyakorlatokat a szerkesztőben'}</Text>
        {day.exercises.length>0&&(()=>{const rec=smartLoadAdvice(state,day.exercises[0]);return rec?<Text style={styles.hint}>{day.exercises[0]}: {rec.weightKg!=null?rec.weightKg+' kg · ':''}{rec.reason}</Text>:null;})()}
        {pairs.filter(pair=>pair.names.every(n=>day.exercises.includes(n))).map(pair=><Text key={pair.id} style={styles.hint}>Szuperszett: {pair.names.join(' + ')}</Text>)}
      </View>
      <Pressable onPress={()=>start(day)} style={styles.start}><Text style={styles.action}>▶</Text></Pressable>
    </View>)}
    {editing&&<View style={styles.editor}>
      <Text style={styles.label}>Nap kiválasztása</Text>
      <View style={styles.days}>{WEEKDAYS.map((n,i)=><Pressable key={i} onPress={()=>setNewDay(i)}
        style={[styles.dayChip,newDay===i&&styles.dayOn]}><Text style={styles.dayText}>{n.slice(0,2)}</Text></Pressable>)}</View>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Edzés neve" placeholderTextColor={colors.textMuted}/>
      <TextInput style={styles.input} value={exercises} onChangeText={setExercises} placeholder="Gyakorlatok, vesszővel elválasztva" placeholderTextColor={colors.textMuted}/>
      <Pressable onPress={addDay} style={styles.cta}><Text style={styles.ctaText}>Edzésnap mentése</Text></Pressable>
      <Pressable onPress={()=>{setTrainingPlan(DEFAULT_TRAINING_PLAN);setEditing(false);}} style={styles.reset}><Text style={styles.action}>Alapértelmezett terv visszaállítása</Text></Pressable>
    </View>}
    <Text style={styles.muted}>A terv személyre szabható. A terhelésjavaslat tájékoztató jellegű, nem helyettesíti a technikát és a regenerációt.</Text>
  </View>;
}
const styles=StyleSheet.create({
  box:{gap:15},row:{flexDirection:'row',alignItems:'center',gap:8},
  eyebrow:{color:colors.gold,fontWeight:'900',letterSpacing:1.4,fontSize:10},
  heading:{color:colors.text,fontWeight:'900',fontSize:19,marginTop:6},
  edit:{padding:8},action:{color:colors.gold,fontWeight:'800',fontSize:12},
  today:{gap:8,backgroundColor:'#2E352B',padding:13,borderRadius:13,borderColor:colors.gold,borderWidth:1},
  todayLabel:{color:colors.gold,fontWeight:'900',fontSize:12},
  cta:{padding:13,alignItems:'center',borderRadius:12,backgroundColor:colors.primary},
  ctaText:{color:'white',fontSize:13,fontWeight:'900'},
  day:{borderTopColor:colors.cardBorder,borderTopWidth:1,flexDirection:'row',alignItems:'center',gap:8,paddingTop:11},
  dayName:{color:colors.text,fontWeight:'800',fontSize:13},
  muted:{color:colors.textMuted,fontSize:11,lineHeight:17,marginTop:4},
  hint:{color:colors.cyan,fontSize:10,lineHeight:16,marginTop:6},
  start:{width:45,height:44,borderRadius:12,backgroundColor:colors.input,alignItems:'center',justifyContent:'center'},
  editor:{gap:10},label:{color:colors.textSoft,fontSize:12},
  days:{flexDirection:'row',gap:4},dayChip:{flex:1,paddingVertical:9,borderRadius:8,backgroundColor:colors.input,alignItems:'center'},
  dayOn:{backgroundColor:colors.primary},
  dayText:{color:colors.text,fontSize:10,fontWeight:'800'},
  input:{backgroundColor:colors.input,borderRadius:12,color:colors.text,minHeight:46,paddingHorizontal:12},
  reset:{alignItems:'center',padding:10}
});
