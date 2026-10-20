import React from 'react';
import {View,StyleSheet} from 'react-native';
import Svg,{Path,Circle,Line,Polygon,Rect,G,Defs,LinearGradient,Stop} from 'react-native-svg';
import {colors} from '../theme';

// Bespoke monochrome heraldry. The same glyph language is used for classes,
// daily objectives, badges, regions, and encounter art. No platform emoji.
export function MythicIcon({name='quest',size=26,color=colors.gold,strokeWidth=2,style}){
  const line={stroke:color,strokeWidth,strokeLinecap:'round',strokeLinejoin:'round',fill:'none'};
  const glyph={
    hero:<><Path d="M16 12 L24 4 L40 4 L48 12 L53 28 L47 43 L32 59 L17 43 L11 28 Z" {...line}/><Path d="M23 19 L32 12 L41 19 L41 37 L32 46 L23 37 Z" {...line}/><Path d="M21 31 H43 M32 19 V42" {...line}/></>,
    shadow:<><Path d="M11 12 Q30 21 52 8 Q43 27 52 45 Q34 41 15 57 Q22 38 11 12Z" {...line}/><Path d="M24 19 L41 39 M41 18 L24 43" {...line}/><Circle cx="32" cy="31" r="5" {...line}/></>,
    slayer:<><Path d="M17 51 L45 10 M27 45 L52 20 M19 50 L11 58 M44 12 L50 6" {...line}/><Path d="M16 21 Q29 20 31 8 Q42 21 35 32 M12 34 Q20 32 20 24 M44 35 Q39 40 48 47" {...line}/></>,
    scout:<><Path d="M5 34 Q18 15 30 27 L32 36 Q16 35 5 34 Z M59 34 Q46 15 34 27 L32 36 Q48 35 59 34 Z" {...line}/><Path d="M17 36 L32 54 L47 36 M32 12 V48 M26 18 L32 10 L38 18" {...line}/></>,
    monk:<><Circle cx="32" cy="30" r="23" {...line}/><Circle cx="32" cy="30" r="15" {...line}/><Path d="M32 9 V51 M11 30 H53 M22 30 L32 17 L42 30 L32 43 Z" {...line}/></>,
    workout:<><Path d="M5 23 V41 M12 17 V47 M19 25 V39 M45 25 V39 M52 17 V47 M59 23 V41 M19 32 H45" {...line}/></>,
    study:<><Path d="M32 17 Q21 9 8 14 V49 Q21 44 32 53 Q43 44 56 49 V14 Q43 9 32 17 Z" {...line}/><Path d="M32 17 V53 M15 23 L25 25 M39 25 L49 23 M15 33 L25 35 M39 35 L49 33" {...line}/></>,
    journal:<><Rect x="12" y="7" width="41" height="50" rx="5" {...line}/><Path d="M21 7 V57 M29 20 H45 M29 29 H45 M29 38 H42" {...line}/></>,
    recovery:<><Circle cx="32" cy="32" r="23" {...line}/><Path d="M32 15 V49 M15 32 H49 M21 21 L43 43 M43 21 L21 43" {...line}/></>,
    quest:<><Path d="M32 5 L39 25 L59 32 L39 39 L32 59 L25 39 L5 32 L25 25 Z" {...line}/><Circle cx="32" cy="32" r="5" {...line}/></>,
    boss:<><Path d="M12 51 L7 19 L22 29 L32 9 L42 29 L57 19 L52 51 Z" {...line}/><Path d="M16 44 H48 M22 35 L22 42 M42 35 L42 42 M26 52 H38" {...line}/></>,
    guild:<><Path d="M32 5 L53 17 V39 Q52 49 32 58 Q12 49 11 39 V17 Z" {...line}/><Path d="M21 26 L32 33 L43 26 M32 33 V47 M21 26 V38 L32 47 L43 38 V26" {...line}/></>,
    stats:<><Path d="M8 54 V38 L19 26 L31 36 L44 14 L56 19" {...line}/><Path d="M9 11 V54 H58 M42 14 L44 14 L44 24" {...line}/></>,
    streak:<><Path d="M37 7 Q16 23 23 34 Q26 24 32 22 Q46 41 39 53 Q51 44 52 33 Q53 19 37 7 Z M28 38 Q18 45 26 55 Q32 59 38 54 Q42 48 35 41 Z" {...line}/></>,
    trophy:<><Path d="M18 10 H46 V24 Q46 39 32 41 Q18 39 18 24 Z M18 16 H9 V25 Q9 36 22 35 M46 16 H55 V25 Q55 36 42 35 M32 41 V52 M23 56 H41" {...line}/></>,
    unlock:<><Path d="M22 27 V18 Q22 8 32 8 Q42 8 42 18 M16 27 H49 V55 H16 Z" {...line}/><Path d="M31 38 L31 47 M25 38 L31 32 L37 38" {...line}/></>,
    locked:<><Rect x="14" y="27" width="36" height="29" rx="5" {...line}/><Path d="M22 27 V18 Q22 7 32 7 Q42 7 42 18 V27 M32 37 V47" {...line}/></>,
    complete:<><Circle cx="32" cy="32" r="25" {...line}/><Path d="M18 31 L28 42 L47 21" {...line}/></>,
    time:<><Circle cx="32" cy="32" r="25" {...line}/><Path d="M32 14 V32 L44 38" {...line}/></>,
    armor:<><Path d="M18 8 L32 16 L46 8 L59 23 L48 38 L46 57 H18 L16 38 L5 23 Z" {...line}/><Path d="M18 8 L22 27 L32 35 L42 27 L46 8 M22 27 L16 38 M42 27 L48 38" {...line}/></>,
    star:<><Path d="M32 5 L38 25 L59 32 L38 39 L32 59 L26 39 L5 32 L26 25 Z" {...line}/></>,
    iron_guardian:<><Path d="M32 5 L49 15 L47 42 L32 58 L17 42 L15 15 Z M24 24 H40 M23 35 L30 42 L43 24" {...line}/><Path d="M10 11 L15 15 M54 11 L49 15" {...line}/></>,
    time_wraith:<><Path d="M18 7 H46 M18 57 H46 M20 8 Q19 21 32 31 Q45 21 44 8 M20 56 Q20 43 32 32 Q44 43 44 56" {...line}/><Path d="M25 48 L32 41 L39 48 M32 29 V36" {...line}/></>,
    titan:<><Path d="M12 47 L18 16 L32 6 L46 16 L52 47 L42 58 H22 Z" {...line}/><Path d="M17 27 L27 22 L32 33 L37 22 L47 27 M23 43 H41 M32 34 V51" {...line}/></>,
    awakening:<><Circle cx="32" cy="32" r="24" {...line}/><Path d="M32 8 V55 M11 32 H53 M21 43 L32 12 L43 43 Z" {...line}/></>,
    ironwoods:<><Path d="M32 5 L48 25 H40 L54 43 H10 L24 25 H16 Z M32 43 V59" {...line}/></>,
    azure:<><Path d="M6 48 L20 25 L30 38 L40 11 L58 48 Z M29 38 L40 30 L49 48" {...line}/></>,
    citadel:<><Path d="M11 55 V20 H19 V12 H26 V20 H38 V12 H45 V20 H53 V55 Z M25 55 V40 Q32 32 39 40 V55 M18 30 H23 M41 30 H46" {...line}/></>,
    summit:<><Path d="M5 53 L22 29 L30 39 L42 7 L59 53 Z M36 24 L42 17 L47 29 M23 43 L30 37" {...line}/></>,
    close:<><Path d="M15 15 L49 49 M49 15 L15 49" {...line}/></>,
    delete:<><Path d="M17 18 H47 M25 18 V11 H39 V18 M21 18 L24 53 H40 L43 18 M28 29 V44 M36 29 V44" {...line}/></>,
    arrow:<><Path d="M14 49 L50 13 M24 13 H50 V39" {...line}/></>,
    shield:<><Path d="M32 6 L53 16 V31 Q52 47 32 58 Q12 47 11 31 V16 Z M23 32 L29 39 L42 24" {...line}/></>,
    energy:<><Path d="M36 5 L15 35 H29 L25 59 L50 26 H35 Z" {...line}/></>,
    crown:<><Path d="M8 46 L5 17 L20 29 L32 9 L44 29 L59 17 L56 46 Z M10 53 H54" {...line}/></>
  }[name]||<><Circle cx="32" cy="32" r="24" {...line}/><Path d="M32 15 V49 M15 32 H49" {...line}/></>;
  return <Svg width={size} height={size} viewBox="0 0 64 64" style={style} accessibilityLabel={name}>{glyph}</Svg>;
}
export const RARITY = {
  common:{label:'COMMON',color:'#99ADB2'},
  rare:{label:'RARE',color:'#77D8D2'},
  epic:{label:'EPIC',color:'#B2A4FF'},
  legendary:{label:'LEGENDARY',color:'#F0C37B'},
  mythic:{label:'MYTHIC',color:'#F79A91'}
};
export function rankRarity(level){
  return level>=21?'mythic':level>=16?'legendary':level>=11?'epic':level>=6?'rare':'common';
}
export function Sigil({name='quest',size=64,color=colors.gold,rarity,locked=false,style}){
  const hue=rarity?RARITY[rarity]?.color||color:color;
  return <View style={[{width:size,height:size,alignItems:'center',justifyContent:'center'},style]}>
    <Svg width={size} height={size} viewBox="0 0 80 80" style={StyleSheet.absoluteFill}>
      <Defs><LinearGradient id="sigilbg" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={hue} stopOpacity=".19"/>
        <Stop offset="1" stopColor="#0B1620" stopOpacity="1"/>
      </LinearGradient></Defs>
      <Path d="M40 2 L69 15 L78 40 L65 68 L40 78 L13 65 L2 40 L15 13 Z" fill="url(#sigilbg)" stroke={hue} strokeOpacity=".8" strokeWidth="1.5"/>
      <Path d="M40 10 L62 19 L70 40 L60 61 L40 70 L19 60 L10 40 L19 19 Z" fill="none" stroke={hue} strokeOpacity=".35" strokeDasharray="3 5"/>
      <Path d="M40 0 V12 M40 68 V80 M0 40 H12 M68 40 H80" stroke={hue} strokeWidth="1.2"/>
    </Svg>
    <MythicIcon name={locked?'locked':name} size={size*.47} color={locked?'#748A93':hue} strokeWidth={1.85}/>
  </View>;
}
export function bossIcon(id){return ['iron_guardian','time_wraith','titan'].includes(id)?id:'boss';}
export function activityIcon(type){return type==='study'?'study':type==='journal'?'journal':type==='workout'?'workout':'quest';}
