import React from 'react';
import {View,StyleSheet} from 'react-native';
import Svg,{Defs,LinearGradient,Stop,Rect,Path,Circle,G,Line,Polygon} from 'react-native-svg';
import {colors} from '../theme';
import {MythicIcon} from './MythicIcon';
// Procedural story landscapes — custom vector art, all 5 themed biomes.
const themes={
 awakening:{sky:['#284548','#101D2B'],light:'#B8D5C9',dark:'#142832'},
 ironwoods:{sky:['#173C36','#111B23'],light:'#7DE7BB',dark:'#15392D'},
 azure:{sky:['#223C5C','#10192D'],light:'#8DCFFF',dark:'#18334B'},
 citadel:{sky:['#3B2D49','#151621'],light:'#C3A1E3',dark:'#2A2138'},
 summit:{sky:['#494136','#1B202C'],light:'#F2D39B',dark:'#394457'}
};
export default function RegionLandscape({id='awakening',height=160,locked=false}){
 const t=themes[id]||themes.awakening;
 return <View style={[styles.frame,{height,opacity:locked?.63:1}]}>
  <Svg width="100%" height="100%" viewBox="0 0 348 163" preserveAspectRatio="xMidYMid slice">
   <Defs><LinearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
     <Stop offset="0" stopColor={t.sky[0]}/><Stop offset="1" stopColor={t.sky[1]}/></LinearGradient></Defs>
   <Rect x="0" y="0" width="348" height="163" fill="url(#sky)"/>
   <Circle cx="258" cy="48" r="31" fill={t.light} fillOpacity=".13" stroke={t.light} strokeOpacity=".35"/>
   <Circle cx="258" cy="48" r="44" fill="none" stroke={t.light} strokeOpacity=".15"/>
   <G stroke={t.light} strokeOpacity=".15" strokeWidth=".75">
     {Array.from({length:8},(_,i)=><Line key={i} x1="0" x2="348" y1={i*25} y2={i*25}/>)}
   </G>
   {id==='ironwoods'?<>
     <Path d="M0 159 L0 78 L27 48 L13 100 L43 66 L61 137 L81 39 L110 90 L133 33 L159 99 L177 46 L210 117 L235 31 L269 95 L289 45 L325 91 L348 55 V163Z"
       fill="#102C29" stroke={t.light} strokeOpacity=".25"/>
     {Array.from({length:6},(_,i)=><Path key={i} d={`M${i*57+9} 163 L${i*57+18} 62 L${i*57+34} 163`} fill="none" stroke={t.light} strokeOpacity=".33"/>)}
   </>:id==='azure'?<>
     <Path d="M0 148 L34 99 L65 126 L112 38 L145 107 L188 59 L236 119 L280 30 L330 91 L348 62 V163 H0Z"
       fill="#15354B" stroke={t.light} strokeOpacity=".52"/>
     <Path d="M77 130 L112 38 L151 119 M257 102 L280 30 L304 85" fill="none" stroke={t.light} strokeOpacity=".48"/>
     <Path d="M192 58 L197 150 M205 62 L212 163" stroke="#9BDBFA" strokeWidth="2" strokeOpacity=".33"/>
   </>:id==='citadel'?<>
     <Path d="M0 163 V115 L66 127 L90 81 L121 105 L147 43 L165 69 L186 17 L208 65 L228 44 L254 97 L278 69 L301 116 L348 89 V163Z" fill={t.dark}/>
     <Path d="M110 159 V80 H123 V59 H142 V80 H166 V36 H188 V80 H213 V59 H230 V80 H249 V159Z"
       fill="#1E1B2C" stroke={t.light} strokeOpacity=".46" strokeWidth="1.5"/>
     <Path d="M165 159 V112 Q179 97 193 112 V159 M135 96 V112 M222 96 V112" stroke={t.light} strokeOpacity=".55"/>
   </>:id==='summit'?<>
     <Path d="M0 150 L39 93 L69 112 L124 27 L169 104 L218 53 L264 111 L298 17 L348 90 V163 H0Z"
       fill={t.dark} stroke={t.light} strokeOpacity=".32"/>
     <Path d="M93 66 L124 27 L155 79 M275 61 L298 17 L327 61" fill="none" stroke={t.light} strokeOpacity=".85"/>
     <Path d="M202 163 L226 92 L248 125 L265 83 L288 163" fill={t.light} fillOpacity=".06"/>
   </>:<>
     <Path d="M0 161 L0 111 L44 91 L75 126 L121 72 L160 113 L197 91 L228 116 L278 68 L348 114 V163Z"
       fill={t.dark} stroke={t.light} strokeOpacity=".25"/>
     <Path d="M141 163 V94 L161 69 L181 94 V163 M133 100 H189 M151 113 H172" fill="none" stroke={t.light} strokeOpacity=".6"/>
     <Circle cx="161" cy="93" r="17" fill="none" stroke={t.light} strokeOpacity=".48"/>
   </>}
   <Path d="M0 162 H348" stroke={t.light} strokeOpacity=".4"/>
  </Svg>
  <View style={styles.glyph}><MythicIcon name={id} size={28} color={t.light}/></View>
 </View>;
}
const styles=StyleSheet.create({
 frame:{backgroundColor:colors.surface,borderRadius:15,overflow:'hidden',
   borderWidth:1,borderColor:'#50696A'},
 glyph:{position:'absolute',top:11,left:11,width:44,height:44,alignItems:'center',justifyContent:'center',
   backgroundColor:'rgba(8,17,23,.85)',borderWidth:1,borderColor:'#77918B',borderRadius:12}
});
