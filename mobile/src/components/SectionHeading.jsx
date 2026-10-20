import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {colors} from '../theme';
export default function SectionHeading({eyebrow,title,right}){
  return <View style={styles.row}>
    <View style={styles.line}/>
    <View style={styles.info}>
      {eyebrow?<Text style={styles.eyebrow}>{eyebrow}</Text>:null}
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
    </View>
    {right}
  </View>;
}
const styles=StyleSheet.create({
  row:{flexDirection:'row',alignItems:'center',gap:10,marginTop:10,marginBottom:1},
  line:{height:37,width:3,borderRadius:3,backgroundColor:colors.gold},
  info:{flex:1,gap:4},
  eyebrow:{color:colors.cyan,fontSize:9,letterSpacing:2,fontWeight:'900'},
  title:{color:colors.text,fontSize:23,fontWeight:'900',letterSpacing:-.8}
});
