import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {useGame} from '../game/GameContext';
import {mentorBrief} from '../game/mentor';
import {colors,card} from '../theme';
export default function HunterMentor(){
  const {state,progress}=useGame();
  const insight=mentorBrief(state,progress);
  return <View style={[card,styles.box]}>
    <View style={styles.top}><Text style={styles.symbol}>✧</Text><View style={{flex:1,gap:5}}>
      <Text style={styles.eyebrow}>SENSEI / PRIVATE INTELLIGENCE</Text>
      <Text style={styles.heading}>{insight.title}</Text></View></View>
    <Text style={styles.body}>{insight.advice}</Text>
    {insight.training&&<View style={styles.tip}>
      <Text style={styles.tipLabel}>EDZŐI TÁMPONT · {insight.exercise}</Text>
      <Text style={styles.tipTitle}>{insight.training.title}
        {insight.training.weightKg!=null?` · ${insight.training.weightKg} kg`:''}</Text>
      <Text style={styles.body}>{insight.training.reason}</Text></View>}
    <Text style={styles.eyebrow}>MI ALAPJÁN?</Text>
    {insight.explanation.map((line,i)=><Text key={i} style={styles.reason}>◈ {line}</Text>)}
    <Text style={styles.note}>Ez a mentor jelenleg helyben működő, szabályalapú rendszer. Nem generatív AI, és nem küldi el az egészség- vagy edzésadataidat külső szolgáltatónak.</Text>
  </View>;
}
const styles=StyleSheet.create({
  box:{gap:12,borderColor:'#5E5775'},
  top:{flexDirection:'row',alignItems:'center',gap:13},
  symbol:{fontSize:39,color:colors.gold},
  eyebrow:{color:colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.4},
  heading:{color:colors.text,fontSize:20,fontWeight:'900'},
  body:{color:colors.textSoft,fontSize:13,lineHeight:21},
  tip:{backgroundColor:'#222137',borderRadius:14,padding:14,gap:8},
  tipLabel:{color:colors.gold,fontSize:10,fontWeight:'900'},
  tipTitle:{color:colors.text,fontSize:15,fontWeight:'900'},
  reason:{color:colors.textMuted,fontSize:11,lineHeight:18},
  note:{color:colors.textMuted,fontSize:10,lineHeight:17}
});
