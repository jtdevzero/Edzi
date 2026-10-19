import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {colors} from '../theme';
export default function SectionHeading({eyebrow,title,right}){
  return <View style={styles.row}>
    <View style={styles.info}>
      {eyebrow?<Text style={styles.eyebrow}>{eyebrow}</Text>:null}
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
    </View>{right}
  </View>;
}
const styles=StyleSheet.create({
  row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,marginTop:8,marginBottom:1},
  info:{flex:1,gap:7},
  eyebrow:{color:colors.gold,fontSize:10,letterSpacing:2.0,fontWeight:'900'},
  title:{color:colors.text,fontSize:23,fontWeight:'900',letterSpacing:-.7}
});
