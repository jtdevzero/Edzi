import React from 'react';
import {View,Image,StyleSheet} from 'react-native';
import Svg,{Defs,LinearGradient,RadialGradient,Stop,Rect,Path,Circle,Polygon,Line,G} from 'react-native-svg';

// EDZI CINEMATIC ART: native/offline vector environments inspired by the
// generated NIGHTFALL campaign art. All foreground text remains accessible RN Text.
const palettes={
  hero:['#07121B','#18343D','#A8E6E2','#EEC48B'],
  origin:['#10111D','#293647','#8FD6E7','#F6D09E'],
  world:['#0B1B25','#254B51','#71E1D9','#EAC68D'],
  boss:['#160F20','#3E2935','#EFA88B','#FFCA84'],
  ascension:['#101326','#383352','#9EABFF','#E5BD80']
};
export default function CinematicArt({scene='hero',height=220,style}){
 const [base,middle,beam,gold]=palettes[scene]||palettes.hero;
 const uid='edziScene'+React.useId().replace(/:/g,'');
 const showGeneratedImage=scene==='hero'||scene==='origin';
 const rasterStyle={position:'absolute',top:0,left:0,right:0,bottom:0,width:'100%',height:'100%',opacity:scene==='origin' ? .24 : .19};
 return <View pointerEvents="none" style={[styles.container,{height},style]}>
  {showGeneratedImage&&<Image testID="cinematic-campaign-art" accessibilityIgnoresInvertColors source={require('../../assets/art/hero-scene.jpg')}
    style={rasterStyle} resizeMode="cover" blurRadius={2}/>}
  {scene==='world'&&<Image testID="cinematic-world-art" accessibilityIgnoresInvertColors source={require('../../assets/art/world-citadel.jpg')}
    style={rasterStyle} resizeMode="cover" blurRadius={2}/>}
  {scene==='ascension'&&<Image testID="cinematic-rank-art" accessibilityIgnoresInvertColors source={require('../../assets/art/rank-evolution.jpg')}
    style={rasterStyle} resizeMode="cover" blurRadius={2}/>}
  <Svg width="100%" height="100%" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
   <Defs>
    <LinearGradient id={uid+'sky'} x1="0" x2="1" y1="0" y2="1">
      <Stop offset="0" stopColor={middle}/><Stop offset=".55" stopColor={base}/>
      <Stop offset="1" stopColor="#03070E"/>
    </LinearGradient>
    <RadialGradient id={uid+'shine'} cx="74%" cy="46%" rx="42%" ry="60%">
      <Stop offset="0" stopColor={beam} stopOpacity=".37"/>
      <Stop offset=".56" stopColor={beam} stopOpacity=".06"/>
      <Stop offset="1" stopColor={base} stopOpacity="0"/>
    </RadialGradient>
    <LinearGradient id={uid+'metal'} x1="0" x2="1" y1="0" y2="1">
      <Stop offset="0" stopColor="#273D48"/>
      <Stop offset=".55" stopColor="#121C27"/>
      <Stop offset="1" stopColor="#03070D"/>
    </LinearGradient>
   </Defs>
   <Rect x="0" y="0" width="400" height="250" fill={'url(#'+uid+'sky)'} fillOpacity={(showGeneratedImage||scene==='world'||scene==='ascension') ? 0.5 : 1}/>
   <Rect width="400" height="250" fill={'url(#'+uid+'shine)'} fillOpacity={showGeneratedImage?.56:1}/>
   <G stroke={gold} fill="none" opacity=".28">
     <Circle cx="299" cy="119" r="99" strokeWidth="1.2"/>
     <Circle cx="299" cy="119" r="82" strokeDasharray="4 9"/>
     <Circle cx="299" cy="119" r="67" strokeWidth=".7"/>
     <Path d="M299 5 V37 M299 201 V238 M184 119 H215 M382 119 H400"/>
   </G>
   <G opacity=".6">
     <Path d="M0 224 L0 102 L16 97 L16 224 M23 224 V65 L37 45 L50 65 V224
       M59 224 V121 L76 95 L92 121 V224 M105 224 V83 L114 78 V224
       M132 224 V148 L150 119 L168 148 V224 M345 224 V90 L358 72 L371 90 V224
       M384 224 V113 L397 100 V224" fill={base} stroke={gold} strokeOpacity=".2"/>
     <Path d="M20 45 L37 21 L54 45 M132 146 L150 99 L166 146
       M344 73 L358 51 L373 73" fill="none" stroke={beam} strokeOpacity=".23"/>
   </G>
   <G opacity=".85">
    <Polygon points="0,235 57,205 81,227 123,185 167,224 220,191 269,234 320,207 400,230 400,250 0,250" fill="#070D15"/>
    <Path d="M0 235 L57 205 L81 227 L123 185 L167 224 L220 191 L269 234 L320 207 L400 230" fill="none" stroke={gold} strokeOpacity=".42"/>
   </G>
   {scene==='world'?<>
    <Path d="M183 193 L222 133 L245 142 L260 102 L290 123 L325 83 L362 129 L400 104 V218Z" fill="#142A34" stroke={beam} strokeOpacity=".28"/>
    <Path d="M268 147 V83 H279 V69 H289 V83 H304 V61 H315 V83 H333 V69 H344 V147" fill="#1C3540" stroke={gold} strokeOpacity=".5"/>
    <Path d="M299 21 L306 54 L338 61 L306 68 L299 98 L292 68 L261 61 L292 54Z" fill={gold} fillOpacity=".35"/>
   </>:<G>
    {/* Angular original hunter silhouette; no emoji / external render. */}
    <Path d="M219 248 L224 189 L249 173 L257 139 L271 125 L272 105 L291 85
     L302 92 L313 69 L320 88 L334 82 L331 109 L345 129 L346 154 L360 173
     L382 193 L393 250Z" fill={'url(#'+uid+'metal)'} stroke={gold} strokeOpacity=".68" strokeWidth="1.5"/>
    <Path d="M275 119 L268 98 L280 78 L294 88 L314 56 L321 80 L340 73
      L332 105 L340 123 L329 147 L288 153Z" fill="#0B1721" stroke={beam} strokeOpacity=".65"/>
    <Path d="M284 121 L298 127 L302 133 L306 126 L322 121 L317 138 L289 138Z" fill={beam} fillOpacity=".93"/>
    <Path d="M256 161 L297 184 L339 158 L356 202 L331 250 H267 L249 203Z"
     fill="#152A36" stroke={gold} strokeOpacity=".56"/>
    <Path d="M298 185 L305 199 L314 185 M253 184 L234 224 M342 182 L378 218"
      fill="none" stroke={beam} strokeOpacity=".7" strokeWidth="2"/>
    {scene==='boss'&&<Path d="M257 129 L242 65 L262 95 L289 43 L308 86 L330 41 L344 100 L357 69 L344 141" fill="#1D1B2B" stroke={gold} strokeOpacity=".7"/>}
   </G>}
   <G fill={gold} opacity=".68">
    <Path d="M69 27 L72 35 L80 38 L72 41 L69 49 L66 41 L58 38 L66 35Z"/>
    <Path d="M164 68 L167 75 L174 78 L167 81 L164 88 L161 81 L154 78 L161 75Z"/>
    <Circle cx="192" cy="42" r="1.4"/><Circle cx="369" cy="27" r="1.3"/>
   </G>
  </Svg>
 </View>;
}
const styles=StyleSheet.create({container:{width:'100%',overflow:'hidden',borderRadius:18}});
