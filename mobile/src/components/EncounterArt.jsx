import React from 'react';
import {View,StyleSheet} from 'react-native';
import Svg,{Defs,LinearGradient,Stop,Path,Circle,Rect,Line,Polygon,G} from 'react-native-svg';
import {colors} from '../theme';
import {MythicIcon} from './MythicIcon';

// Unique vector antagonist silhouettes. All artwork is local and scalable.
const themes={
  iron_guardian:{sky:['#223A40','#0B141D'],accent:'#C6B28E'},
  time_wraith:{sky:['#3B3159','#111421'],accent:'#AE9CE4'},
  titan:{sky:['#4A332E','#17141C'],accent:'#F5A78B'}
};
export default function EncounterArt({id='iron_guardian',height=176,defeated=false}){
  const data=themes[id]||themes.iron_guardian;
  const c=data.accent;
  const idSky='encsky'+React.useId().replace(/:/g,'');
  const idArmor='armor'+React.useId().replace(/:/g,'');
  return <View style={[styles.frame,{height,opacity:defeated ? .74 : 1}]}>
    <Svg width="100%" height="100%" viewBox="0 0 350 180" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id={idSky} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={data.sky[0]}/><Stop offset="1" stopColor={data.sky[1]}/></LinearGradient>
        <LinearGradient id={idArmor} x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#13252B"/><Stop offset=".5" stopColor="#4D5C64"/><Stop offset="1" stopColor="#18212B"/></LinearGradient>
      </Defs>
      <Rect width="350" height="180" fill={`url(#${idSky})`}/>
      <Circle cx="266" cy="73" r="69" stroke={c} strokeOpacity=".25" strokeWidth="1" fill="none"/>
      <Circle cx="266" cy="73" r="53" stroke={c} strokeOpacity=".22" strokeDasharray="3 8" fill="none"/>
      <Circle cx="266" cy="73" r="36" fill={c} fillOpacity=".08" stroke={c} strokeOpacity=".2"/>
      <G stroke={c} strokeWidth=".75" strokeOpacity=".18">
        {Array.from({length:6},(_,i)=><Line key={i} x1="0" y1={i*39} x2="350" y2={i*39}/>)}
      </G>
      {id==='iron_guardian'?<>
        <Path d="M166 185 L183 118 L221 94 L244 45 L291 45 L318 94 L348 118 L350 185 Z" fill="#131F25" stroke="#72827E" strokeWidth="1.6"/>
        <Path d="M222 88 L232 30 L251 38 L264 7 L282 38 L301 27 L306 90 L282 111 L243 111Z" fill={`url(#${idArmor})`} stroke={c} strokeWidth="1.7"/>
        <Path d="M241 79 L258 83 L264 89 L270 83 L288 79 L282 94 L247 94 Z" fill={c}/>
        <Path d="M224 115 L261 134 L298 115 L312 175 L211 175 Z" fill="url(#armor)" stroke={c} strokeOpacity=".6"/>
        <Path d="M261 137 L261 166 M239 135 L226 161 M288 135 L298 161" stroke={c} opacity=".6"/>
      </>:id==='time_wraith'?<>
        <Path d="M210 186 Q193 127 224 93 Q235 51 268 39 Q306 51 313 98 Q346 135 320 185Z" fill="#19172A" stroke={c} strokeOpacity=".7"/>
        <Path d="M228 95 L241 59 L263 48 L292 57 L309 95 L294 114 L241 114Z" fill="#090D19" stroke={c} strokeWidth="1.5"/>
        <Path d="M245 87 L260 91 L266 97 L274 91 L292 87 L286 102 L250 102Z" fill={c}/>
        <Path d="M229 137 Q266 116 303 137 M223 151 Q266 129 311 151" fill="none" stroke={c} strokeOpacity=".34" strokeWidth="2"/>
        <Path d="M267 18 V29 M267 126 V170 M198 96 H217 M318 96 H336" stroke={c} strokeOpacity=".46"/>
      </>:<>
        <Path d="M179 185 L185 115 L213 89 L206 53 L230 69 L252 24 L277 63 L310 43 L302 91 L333 116 L350 185Z" fill="#271E23" stroke={c} strokeOpacity=".5"/>
        <Path d="M223 79 L241 47 L257 60 L273 38 L299 77 L285 117 L245 117Z" fill="#181B23" stroke={c} strokeWidth="2"/>
        <Path d="M237 84 L256 90 L263 98 L270 90 L292 84 L280 103 L248 103 Z" fill={c}/>
        <Path d="M215 122 L261 151 L314 123 L337 185 L185 185 Z" fill="#4D3330" stroke={c} strokeOpacity=".5"/>
        <Path d="M261 149 L261 178 M238 142 L225 171 M283 142 L298 170" stroke={c} strokeOpacity=".55"/>
      </>}
      <Path d="M0 175 L76 145 L131 157 L170 140 L227 179 Z" fill="#0C1720" fillOpacity=".8"/>
      <Path d="M0 176 H350" stroke={c} strokeOpacity=".36"/>
    </Svg>
    <View style={styles.icon}><MythicIcon name={id} size={24} color={c}/></View>
  </View>;
}
const styles=StyleSheet.create({
  frame:{backgroundColor:colors.surface,borderRadius:17,overflow:'hidden',borderColor:'#405A60',borderWidth:1},
  icon:{position:'absolute',top:11,left:11,backgroundColor:'rgba(7,15,19,.85)',
    width:38,height:38,borderWidth:1,borderColor:'#5A6463',borderRadius:11,alignItems:'center',justifyContent:'center'}
});
