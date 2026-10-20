import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Svg,{Path,Circle,Line,G} from 'react-native-svg';
import {MythicIcon,Sigil} from './MythicIcon';
import {colors} from '../theme';
const themes={
 hero:{tones:['#50422D','#121C25'],accent:'#F6C67B',caption:'VANGUARD'},
 shadow:{tones:['#28284A','#121824'],accent:'#B5A7FA',caption:'PHANTOM'},
 slayer:{tones:['#4D2B2F','#161D23'],accent:'#FF9993',caption:'BLADE'},
 scout:{tones:['#17414B','#101E29'],accent:'#75D5E4',caption:'RANGER'},
 monk:{tones:['#254536','#131E25'],accent:'#88E2AE',caption:'ASCETIC'}
};
export default function ClassArtwork({classId='hero',selected=false}){
 const t=themes[classId]||themes.hero;
 return <View style={[styles.root,selected&&{borderColor:t.accent}]}>
   <LinearGradient colors={t.tones} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill}/>
   <Svg width="100%" height="100%" viewBox="0 0 112 138" style={StyleSheet.absoluteFill}>
     <Circle cx="56" cy="56" r="48" stroke={t.accent} strokeOpacity=".3" fill="none"/>
     <Circle cx="56" cy="56" r="38" stroke={t.accent} strokeOpacity=".22" strokeDasharray="3 7" fill="none"/>
     <Path d="M9 107 L30 84 L56 94 L83 84 L105 107 L112 138 H0Z" fill="#101C26" stroke={t.accent} strokeOpacity=".5"/>
     <Path d="M43 75 L36 49 L45 29 L55 23 L68 29 L76 49 L70 75 L57 84Z" fill="#182431" stroke={t.accent} strokeOpacity=".7"/>
     <Path d="M41 55 L53 59 L57 63 L61 59 L72 55" stroke={t.accent} strokeWidth="2.1"/>
     <Path d="M17 18 H31 M17 18 V33 M95 18 H82 M95 18 V33" stroke={t.accent} strokeOpacity=".6"/>
   </Svg>
   <View style={styles.icon}><MythicIcon name={classId} size={26} color={t.accent}/></View>
   <Text style={[styles.caption,{color:t.accent}]}>{t.caption}</Text>
 </View>;
}
const styles=StyleSheet.create({
 root:{width:117,height:134,overflow:'hidden',borderRadius:15,borderWidth:1,borderColor:'#47616D'},
 icon:{position:'absolute',right:8,top:8,padding:4,backgroundColor:'rgba(10,15,22,.8)',borderRadius:8},
 caption:{position:'absolute',bottom:7,left:9,fontSize:8,fontWeight:'900',letterSpacing:1.8}
});
