import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getClass, characterTitle } from '../game/characters';
import HunterPortrait from './HunterPortrait';
import XPBar from './XPBar';
import { colors } from '../theme';

export function hunterRank(level) {
  return level >= 21 ? 'S' : level >= 16 ? 'A' : level >= 11 ? 'B' : level >= 6 ? 'C' : 'D';
}
export default function CharacterCard({character,progress}) {
  const cls=getClass(character.classId);
  const rank=hunterRank(progress.level);
  const enter=useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    let active=true;
    AccessibilityInfo.isReduceMotionEnabled().then(reduced=>{
      if(!active)return;
      Animated.timing(enter,{toValue:1,duration:reduced?0:530,useNativeDriver:true}).start();
    }).catch(()=>enter.setValue(1));
    return ()=>{active=false;};
  },[enter]);
  return <Animated.View style={{opacity:enter,transform:[{translateY:enter.interpolate({inputRange:[0,1],outputRange:[10,0]})}]}}>
    <View style={styles.frame}>
      <LinearGradient colors={['#1E2545','#101627','#080D19']} start={{x:0,y:0}} end={{x:.8,y:1}} style={StyleSheet.absoluteFill}/>
      <View style={styles.halo}/>
      <View style={styles.portrait} pointerEvents="none">
        <HunterPortrait classId={cls.id} accent={cls.color||colors.primarySoft} size={254}/>
      </View>
      <LinearGradient colors={['rgba(7,11,22,0)','#080D19']} locations={[0,1]} style={styles.bottomShade} pointerEvents="none"/>
      <View style={styles.top}>
        <Text style={styles.eyebrow}>EDZI <Text style={styles.slash}>/</Text> ELITE HUNTER</Text>
        <View style={styles.rankBadge}><Text style={styles.rankBadgeText}>RANK {rank}</Text></View>
      </View>
      <View style={styles.rankRow}>
        <Text style={styles.rankCaption}>HUNTER CLASS</Text>
        <Text style={styles.rankLetter}>{rank}<Text style={styles.rankSuffix}>.</Text></Text>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.classLabel}>{cls.name.toLocaleUpperCase('hu-HU')}  ·  LEVEL {String(progress.level).padStart(2,'0')}</Text>
        <Text style={styles.name} numberOfLines={2} adjustsFontSizeToFit>{character.name}</Text>
        <Text style={styles.subtitle}>{characterTitle(character.classId,progress.level)}</Text>
        <View style={styles.underline}/>
        <XPBar xp={progress.xp} xpToNextLevel={progress.xpToNextLevel} level={progress.level}/>
      </View>
      <View style={styles.topAccent}/>
      <View style={styles.cornerAccent}/>
    </View>
  </Animated.View>;
}
const styles=StyleSheet.create({
  frame:{height:370,borderRadius:29,overflow:'hidden',borderWidth:1,borderColor:'#5A638F',backgroundColor:colors.card,
    shadowColor:'#000',shadowRadius:22,shadowOpacity:.4,elevation:8},
  halo:{position:'absolute',width:280,height:280,borderRadius:140,backgroundColor:'#474AA0',opacity:.13,right:-60,top:25},
  portrait:{position:'absolute',top:-30,right:-25,opacity:.97},
  bottomShade:{position:'absolute',height:205,left:0,right:0,bottom:0},
  top:{position:'absolute',top:18,left:20,right:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
  eyebrow:{color:colors.textSoft,letterSpacing:1.6,fontWeight:'900',fontSize:10},
  slash:{color:colors.gold},
  rankBadge:{borderRadius:8,paddingHorizontal:11,paddingVertical:7,backgroundColor:'#302A25',borderColor:'#988160',borderWidth:1},
  rankBadgeText:{color:colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1},
  rankRow:{position:'absolute',left:20,top:73,gap:4},
  rankCaption:{color:colors.textMuted,fontWeight:'800',letterSpacing:2,fontSize:9},
  rankLetter:{color:colors.gold,fontSize:79,lineHeight:85,fontWeight:'900',letterSpacing:-5},
  rankSuffix:{color:colors.primarySoft},
  bottom:{position:'absolute',left:21,right:21,bottom:20,gap:6},
  classLabel:{fontSize:10,letterSpacing:1.4,color:colors.gold,fontWeight:'900'},
  name:{color:colors.text,fontWeight:'900',fontSize:30,letterSpacing:-1.25,maxWidth:'100%'},
  subtitle:{color:colors.textSoft,fontSize:12,fontWeight:'600',marginBottom:6},
  underline:{height:1,backgroundColor:'#59627D',marginVertical:7,opacity:.66},
  topAccent:{position:'absolute',top:0,left:25,width:82,height:2,backgroundColor:colors.gold},
  cornerAccent:{position:'absolute',bottom:0,right:28,width:66,height:2,backgroundColor:colors.primarySoft}
});
