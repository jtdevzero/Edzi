import React,{useEffect,useRef} from 'react';
import {View,Text,Animated,StyleSheet,AccessibilityInfo} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Svg,{Circle,Line,Path,Defs,RadialGradient,Stop,Rect,G} from 'react-native-svg';
import {getClass,characterTitle} from '../game/characters';
import HunterPortrait from './HunterPortrait';
import XPBar from './XPBar';
import {worldProgress,selectWorldGear} from '../game/hunterWorld';
import {portraitOptions} from '../game/characterCreator';
import {useGame} from '../game/GameContext';
import {colors} from '../theme';

export function hunterRank(level){return level>=21?'S':level>=16?'A':level>=11?'B':level>=6?'C':'D';}
export default function CharacterCard({character,progress}){
  const cls=getClass(character.classId);
  const {state}=useGame();
  const equipment=selectWorldGear(character,worldProgress(state,progress));
  const avatar=portraitOptions(character,equipment);
  const rank=hunterRank(progress.level);
  const enter=useRef(new Animated.Value(.96)).current;
  useEffect(()=>{
    let active=true;
    AccessibilityInfo.isReduceMotionEnabled().then(reduced=>{
      if(active)Animated.timing(enter,{toValue:1,duration:reduced?0:610,useNativeDriver:true}).start();
    }).catch(()=>enter.setValue(1));
    return ()=>{active=false;};
  },[enter]);
  return <Animated.View style={{opacity:enter,transform:[{translateY:enter.interpolate({inputRange:[0,1],outputRange:[10,0]})}]}}>
    <View style={styles.frame}>
      <LinearGradient colors={['#1C3033','#121D24','#0A1119','#05080D']} locations={[0,.37,.75,1]}
        style={StyleSheet.absoluteFill}/>
      <View style={styles.aurora} pointerEvents="none"/>
      <Svg viewBox="0 0 360 445" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs><RadialGradient id="eclipse" cx="68%" cy="35%" rx="61%" ry="42%">
          <Stop offset="0" stopColor="#57ACB5" stopOpacity=".23"/>
          <Stop offset=".59" stopColor="#234348" stopOpacity=".10"/>
          <Stop offset="1" stopColor="#05080D" stopOpacity="0"/>
        </RadialGradient></Defs>
        <Rect width="360" height="445" fill="url(#eclipse)"/>
        <Circle cx="231" cy="174" r="130" stroke="#8CBBB3" strokeOpacity=".21" strokeWidth="1"/>
        <Circle cx="231" cy="174" r="112" stroke="#F6C67B" strokeOpacity=".25" strokeWidth=".9" strokeDasharray="3 9"/>
        <Circle cx="231" cy="174" r="89" stroke="#8CBBB3" strokeOpacity=".16" strokeWidth=".75"/>
        <Path d="M14 114 H100 M260 64 H346 M23 272 H98 M290 301 H349"
          stroke="#F6C67B" strokeOpacity=".23" strokeWidth="1"/>
        <Path d="M26 28 H73 M26 28 V60 M333 28 H289 M333 28 V60"
          stroke="#F6C67B" strokeOpacity=".57" fill="none"/>
        <Path d="M26 332 V351 H60 M333 332 V351 H301" stroke="#F6C67B" strokeOpacity=".35" fill="none"/>
        <G stroke="#6EE3D8" strokeOpacity=".13" strokeWidth=".6">
          {Array.from({length:9},(_,i)=><Line key={i} x1={i*46} x2={i*46} y1="0" y2="445"/>)}
        </G>
      </Svg>
      <Text style={styles.rankGhost}>{rank}</Text>
      <View style={styles.portrait} pointerEvents="none">
        <HunterPortrait classId={cls.id} accent={avatar.visorColor}
          armorAccent={avatar.armorAccent} helmetStyle={avatar.helmetStyle} size={291}/>
      </View>
      <LinearGradient colors={['rgba(5,8,13,0)','rgba(5,8,13,.05)','#05080D','#05080D']}
        locations={[0,.27,.67,1]} style={styles.shade} pointerEvents="none"/>
      <View style={styles.head}>
        <View style={styles.identity}>
          <Text style={styles.kicker}>◈  HUNTER DOSSIER / Nº 004</Text>
          <Text style={styles.classTiny}>AWAKENED • {cls.name.toLocaleUpperCase('hu-HU')}</Text>
        </View>
        <View style={styles.rankBadge}><Text style={styles.rankText}>RANK {rank}</Text></View>
      </View>
      <View style={styles.leftMarker}>
        <Text style={styles.markerCap}>ASCENSION</Text>
        <Text style={styles.markerNum}>{String(progress.level).padStart(2,'0')}</Text>
        <Text style={styles.markerLabel}>CURRENT LVL</Text>
      </View>
      <View style={styles.bottom}>
        <View style={styles.bottomTag}><View style={styles.dot}/><Text style={styles.tagText}>THE HUNTER HAS AWAKENED</Text></View>
        <Text style={styles.name} adjustsFontSizeToFit numberOfLines={2}>{character.name}</Text>
        <Text style={styles.subtitle}>{characterTitle(character.classId,progress.level)}</Text>
        <View style={styles.hairline}/>
        <XPBar xp={progress.xp} xpToNextLevel={progress.xpToNextLevel} level={progress.level}/>
        <View style={styles.meta}>
          <Text style={styles.metaLabel}>◈ {progress.bossWins} BOSS DEFEATED</Text>
          <Text style={styles.metaLabel}>◈ {progress.streak} DAY STREAK</Text>
        </View>
      </View>
      <View style={styles.edgeTop}/><View style={styles.edgeBottom}/>
    </View>
  </Animated.View>;
}
const styles=StyleSheet.create({
  frame:{height:446,borderRadius:27,overflow:'hidden',borderWidth:1,borderColor:'#62766F',
    backgroundColor:'#091219',shadowColor:'#000',shadowRadius:35,shadowOpacity:.55,elevation:12},
  aurora:{position:'absolute',width:280,height:280,borderRadius:150,
    backgroundColor:'#3B8A83',opacity:.13,top:34,right:-95},
  rankGhost:{position:'absolute',left:9,top:115,color:'rgba(245,218,165,.11)',
    fontSize:163,fontWeight:'900',letterSpacing:-14},
  portrait:{position:'absolute',top:12,right:-54,opacity:.99},
  shade:{position:'absolute',height:290,left:0,right:0,bottom:0},
  head:{position:'absolute',top:18,left:19,right:19,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:6},
  identity:{gap:6,flex:1},kicker:{color:colors.gold,fontWeight:'900',fontSize:9,letterSpacing:1.4},
  classTiny:{color:colors.textSoft,fontSize:9,letterSpacing:1.4,fontWeight:'800'},
  rankBadge:{backgroundColor:'#F6C67B',paddingHorizontal:10,paddingVertical:8,borderRadius:8},
  rankText:{color:'#192029',fontSize:10,fontWeight:'900',letterSpacing:1.1},
  leftMarker:{position:'absolute',left:20,top:120,gap:1},
  markerCap:{color:colors.cyan,letterSpacing:2.1,fontWeight:'900',fontSize:9},
  markerNum:{color:colors.text,fontWeight:'900',fontSize:61,lineHeight:66,letterSpacing:-3},
  markerLabel:{fontSize:9,color:colors.textMuted,fontWeight:'900',letterSpacing:1.3},
  bottom:{position:'absolute',left:22,right:22,bottom:18,gap:7},
  bottomTag:{flexDirection:'row',alignItems:'center',gap:6},
  dot:{backgroundColor:colors.green,width:6,height:6,borderRadius:6},
  tagText:{fontSize:9,fontWeight:'900',letterSpacing:1.8,color:colors.cyan},
  name:{color:colors.text,fontWeight:'900',fontSize:33,letterSpacing:-1.3,lineHeight:39},
  subtitle:{color:colors.textSoft,fontSize:12,fontWeight:'700'},
  hairline:{height:1,backgroundColor:'rgba(246,198,123,.35)',marginVertical:6},
  meta:{flexDirection:'row',justifyContent:'space-between',gap:7,marginTop:7},
  metaLabel:{fontSize:9,letterSpacing:.4,color:colors.textMuted,fontWeight:'800'},
  edgeTop:{position:'absolute',top:0,left:24,width:85,height:3,backgroundColor:colors.gold},
  edgeBottom:{position:'absolute',bottom:0,right:24,width:93,height:2,backgroundColor:colors.cyan}
});
