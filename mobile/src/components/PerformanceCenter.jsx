import React,{useState} from 'react';
import {View,Text,Pressable,TextInput,StyleSheet} from 'react-native';
import {useGame} from '../game/GameContext';
import {performanceOverview} from '../game/performance';
import {exerciseInsights} from '../game/fitnessPro';
import {colors,card} from '../theme';
const MOODS=['Nagyon fáradt','Fáradt','Közepes','Jól vagyok','Kiváló'];
function Tile({value,label,delta}){
  return <View style={styles.tile}><Text style={styles.value}>{value}</Text><Text style={styles.tileTitle}>{label}</Text>
    {delta!=null&&<Text style={styles.delta}>{delta>0?'+':''}{delta}% az előző 7 naphoz</Text>}</View>;
}
export default function PerformanceCenter(){
  const {state,addRecoveryCheckin}=useGame();
  const m=performanceOverview(state);
  const [rating,setRating]=useState(3),[note,setNote]=useState('');
  const exercises=[...new Set(state.activities.flatMap(a=>(a.exercises||[]).map(e=>e.name)))].slice(0,8);
  return <View style={styles.group}>
    <View style={[card,styles.panel]}>
      <Text style={styles.eyebrow}>PERFORMANCE / LAST 7 DAYS</Text>
      <Text style={styles.heading}>Valódi fejlődés</Text>
      <View style={styles.tiles}>
        <Tile value={m.current.minutes+' p'} label="EDZÉSIDŐ" delta={m.change.minutesPct}/>
        <Tile value={m.current.volumeKg+' kg'} label="EDZÉSVOLUMEN" delta={m.change.volumePct}/>
        <Tile value={m.current.sessions} label="EDZÉSEK"/>
        <Tile value={m.current.days} label="AKTÍV NAPOK"/>
      </View>
      <Text style={styles.insight}>{m.insight}</Text>
    </View>
    {exercises.length>0&&<View style={[card,styles.panel]}>
      <Text style={styles.eyebrow}>STRENGTH / RECORDS</Text>
      <Text style={styles.heading}>Erő- és volumenelemzés</Text>
      {exercises.map(name=>{const insight=exerciseInsights(state.activities,name);return <View key={name} style={styles.exercise}>
        <Text style={styles.exerciseName}>{name}</Text>
        <Text style={styles.stats}>{insight.maxWeight} kg max · {insight.volumeKg} kg volumen · {insight.sets} sorozat</Text>
        {insight.bestEstimated1RM>0&&<Text style={styles.estimate}>Becsült 1RM: {insight.bestEstimated1RM} kg (legfeljebb 12 ismétlésből)</Text>}
      </View>})}
      <Text style={styles.fine}>Az 1RM matematikai becslés, nem biztonságos maximális terhelésre szóló javaslat.</Text>
    </View>}
    <View style={[card,styles.panel]}>
      <Text style={styles.eyebrow}>RECOVERY / CHECK-IN</Text>
      <Text style={styles.heading}>Hogy érzed magad?</Text>
      <Text style={styles.sub}>Saját közérzeted 1–5 skálán. Nincs büntetés a pihenőért.</Text>
      <View style={styles.ratings}>{MOODS.map((label,i)=><Pressable key={i} onPress={()=>setRating(i+1)}
        accessibilityLabel={label} style={[styles.rating,i+1===rating&&styles.ratingActive]}>
        <Text style={styles.ratingText}>{i+1}</Text>
      </Pressable>)}</View>
      <Text style={styles.sub}>{MOODS[rating-1]}</Text>
      <TextInput style={styles.input} value={note} onChangeText={setNote} maxLength={300}
        placeholder="Opcionális megjegyzés…" placeholderTextColor={colors.textMuted}/>
      <Pressable style={styles.save} onPress={()=>{addRecoveryCheckin(rating,note);setNote('')}}><Text style={styles.saveText}>Közérzet mentése</Text></Pressable>
      {m.recentCheckin&&<Text style={styles.fine}>Legutóbbi: {m.recentCheckin.readiness}/5 · {new Date(m.recentCheckin.date).toLocaleDateString('hu-HU')}</Text>}
    </View>
  </View>;
}
const styles=StyleSheet.create({
  group:{gap:17},panel:{gap:13},
  eyebrow:{color:colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.5},
  heading:{color:colors.text,fontWeight:'900',fontSize:20},
  tiles:{flexDirection:'row',flexWrap:'wrap',gap:8},
  tile:{width:'47%',flexGrow:1,backgroundColor:colors.input,borderRadius:13,padding:13,gap:4,minWidth:0},
  value:{color:colors.text,fontSize:19,fontWeight:'900'},tileTitle:{color:colors.textMuted,fontSize:10,fontWeight:'800'},
  delta:{color:colors.cyan,fontSize:10},insight:{color:colors.textSoft,lineHeight:19,fontSize:12},
  exercise:{gap:4,borderTopWidth:1,borderTopColor:colors.cardBorder,paddingTop:9},
  exerciseName:{color:colors.text,fontWeight:'800'},stats:{color:colors.textMuted,fontSize:12},
  estimate:{color:colors.gold,fontSize:11},
  fine:{color:colors.textMuted,fontSize:10,lineHeight:17},sub:{color:colors.textMuted,fontSize:12},
  ratings:{flexDirection:'row',gap:7},rating:{flex:1,padding:12,backgroundColor:colors.input,borderRadius:10,alignItems:'center'},
  ratingActive:{backgroundColor:'#394F47',borderWidth:1,borderColor:colors.gold},
  ratingText:{color:colors.text,fontSize:16,fontWeight:'900'},
  input:{backgroundColor:colors.input,color:colors.text,padding:13,borderRadius:12},
  save:{backgroundColor:colors.primary,padding:13,borderRadius:12,alignItems:'center'},
  saveText:{color:'white',fontWeight:'900'}
});
