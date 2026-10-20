import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Svg,{Circle,Path,Line,G,Defs,LinearGradient as SvgGradient,Stop} from 'react-native-svg';
import {colors} from '../theme';
import {MythicIcon} from './MythicIcon';
import CinematicArt from './CinematicArt';
export default function WorldTeaser({explored,onPress}){
  return <Pressable onPress={onPress} accessibilityRole="button" style={styles.frame}>
    <LinearGradient colors={['#21383A','#111D25','#0B141A']} start={{x:0,y:0}} end={{x:1,y:1}}
      style={StyleSheet.absoluteFill}/>
    <CinematicArt scene="world" height={188} style={styles.cinematicBackground}/>
    <Svg width="100%" height="100%" viewBox="0 0 350 185" preserveAspectRatio="xMidYMid slice"
      pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Defs><SvgGradient id="ambient" x1="0" x2="1" y1="0" y2="1">
        <Stop offset="0" stopColor="#6EE3D8" stopOpacity=".06"/>
        <Stop offset="1" stopColor="#F6C67B" stopOpacity=".01"/></SvgGradient></Defs>
      <Path d="M174 174 Q199 132 235 139 T266 90 T323 44" stroke="#E4C990" strokeWidth="1.2"
        strokeDasharray="3 7" strokeOpacity=".63" fill="none"/>
      <G opacity=".25" stroke="#9BB5B3" strokeWidth=".65">
        {Array.from({length:10},(_,i)=><Line key={'v'+i} x1={i*45} x2={i*45} y1="0" y2="185"/>)}
        {Array.from({length:7},(_,i)=><Line key={'h'+i} y1={i*35} y2={i*35} x1="0" x2="350"/>)}
      </G>
      <Path d="M155 182 L201 161 L220 174 L253 147 L288 166 L325 128 L351 144 V185" fill="#497A79" fillOpacity=".22"/>
      {[[176,171],[231,139],[268,89],[323,45]].map(([x,y],i)=><G key={i}>
        <Circle cx={x} cy={y} r="13" fill="#102025" stroke={i<explored?'#F6C67B':'#6CA49F'} strokeOpacity=".9"/>
        <Circle cx={x} cy={y} r="4" fill={i<explored?'#F6C67B':'#5C807E'}/></G>)}
    </Svg>
    <View style={styles.top}><View style={{flexDirection:'row',alignItems:'center',gap:6}}><MythicIcon name="quest" size={17} color={colors.cyan}/><Text style={styles.eyebrow}>WORLD MAP / CHAPTER IV</Text></View>
      <Text style={styles.title}>FEDEZD FEL A VILÁGOD.</Text>
      <Text style={styles.caption}>Öt régió. Feloldható ereklyék. A te történeted.</Text>
      <View style={styles.bottom}><Text style={styles.status}>{explored}/5 FELFEDEZVE</Text>
        <Text style={styles.open}>BELÉPÉS ↗</Text></View>
    </View>
  </Pressable>;
}
const styles=StyleSheet.create({
  cinematicBackground:{position:'absolute',top:0,left:0,right:0,opacity:.86,borderRadius:0},
  frame:{height:188,overflow:'hidden',borderWidth:1,borderColor:'#53706E',borderRadius:22,
    backgroundColor:'#102128'},
  top:{flex:1,padding:18,gap:8},
  eyebrow:{color:colors.cyan,fontSize:9,fontWeight:'900',letterSpacing:1.4},
  title:{color:colors.text,fontSize:20,fontWeight:'900',maxWidth:'75%',letterSpacing:-.6},
  caption:{color:colors.textSoft,fontSize:11,lineHeight:16,maxWidth:'69%'},
  bottom:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:'auto'},
  status:{fontSize:9,color:colors.gold,fontWeight:'900',letterSpacing:1.1},
  open:{fontSize:10,color:colors.gold,fontWeight:'900',letterSpacing:1.1}
});
