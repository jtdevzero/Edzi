import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import Svg,{Defs,LinearGradient,Stop,Path,Circle,G,Line,Polygon} from 'react-native-svg';
import {useGame} from '../game/GameContext';
import {colors,card} from '../theme';
import {worldProgress,worldUnlockedGear} from '../game/hunterWorld';
const NODE_SIZE=45;
export default function HunterWorldMap(){
  const {state,progress,customizeCreator}=useGame();
  const regions=worldProgress(state,progress);
  const [selected,setSelected]=useState('awakening');
  const region=regions.find(r=>r.id===selected)||regions[0];
  const available=worldUnlockedGear(regions);
  const done=regions.filter(r=>r.complete).length;
  return <View style={[card,styles.frame]}>
    <View style={styles.header}>
      <View style={{flex:1,gap:5}}><Text style={styles.eyebrow}>◈ HUNTER WORLD / EXPEDITION</Text>
        <Text style={styles.heading}>Öt birodalom. Egy történet.</Text>
        <Text style={styles.subtitle}>A világtérkép a valódi edzéseiddel nyílik meg.</Text></View>
      <View style={styles.counter}><Text style={styles.counterN}>{done}/5</Text><Text style={styles.counterCaption}>RÉGIÓ</Text></View>
    </View>
    <View style={styles.map} accessibilityLabel="Hunter World ötállomásos régiótérkép">
      <Svg width="100%" height="100%" viewBox="0 0 330 378" preserveAspectRatio="xMidYMid meet"
        style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs><LinearGradient id="worldBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#232946"/><Stop offset=".6" stopColor="#101A2F"/>
          <Stop offset="1" stopColor="#0A101D"/></LinearGradient></Defs>
        <Path d="M0 0 H330 V378 H0 Z" fill="url(#worldBg)"/>
        <G opacity=".23" stroke="#7F8DAB" strokeWidth=".55">
          {Array.from({length:10},(_,i)=><Line key={'v'+i} x1={i*38} y1="0" x2={i*38} y2="378"/>)}
          {Array.from({length:12},(_,i)=><Line key={'h'+i} x1="0" y1={i*36} x2="330" y2={i*36}/>)}
        </G>
        <Path d="M13 273 Q72 218 81 194 T227 119 T97 53" fill="none" stroke="#D8BE91" strokeWidth="1.5" strokeOpacity=".5" strokeDasharray="5 7"/>
        <Path d="M28 360 L65 329 L105 351 L148 324 L181 344 L243 305 L319 324 V378 H0 Z"
          fill="#283B53" opacity=".52"/>
        <Path d="M0 134 L44 108 L69 143 L111 118 L156 160 L182 145 L229 176 L289 127 L330 157 V210 L0 209 Z"
          fill="#293856" opacity=".33"/>
        <Path d="M0 65 L42 49 L71 87 L114 65 L144 78 L202 32 L241 65 L294 28 L330 43"
          fill="none" stroke="#91A1B9" opacity=".22"/>
        <Circle cx="80" cy="72" r="44" stroke="#D2C29A" fill="none" strokeOpacity=".28"/>
        <Circle cx="80" cy="72" r="31" stroke="#D2C29A" fill="none" strokeOpacity=".16"/>
        <Polygon points="80,28 86,57 117,72 86,79 80,116 73,79 42,72 73,58" fill="#A3BEE5" opacity=".09"/>
      </Svg>
      {regions.map((r,i)=><Pressable key={r.id}
        accessibilityRole="button" accessibilityLabel={r.title+(r.unlocked?' feloldva':' lezárva')}
        onPress={()=>setSelected(r.id)} style={[styles.node,{left:`${r.x}%`,top:`${r.y}%`},
          r.complete&&styles.nodeDone,selected===r.id&&styles.nodeSelected,!r.unlocked&&styles.nodeLocked]}>
        <Text style={styles.nodeSymbol}>{r.unlocked?r.icon:'◆'}</Text>
        <Text style={styles.nodeNumber}>{String(i+1).padStart(2,'0')}</Text>
      </Pressable>)}
      <Text style={styles.mapStamp}>EDZI / CHAPTER IV</Text>
      <Text style={styles.mapLegend}>NORTH ↗</Text>
    </View>
    <View style={styles.region}>
      <View style={styles.regionHead}><Text style={styles.regionEyebrow}>REGION {String(regions.indexOf(region)+1).padStart(2,'0')} / {region.complete?'COMPLETE':region.unlocked?'EXPLORE':'LOCKED'}</Text>
        <Text style={styles.reward}>{region.complete?'✓':'◇'}</Text></View>
      <Text style={styles.regionName}>{region.title}</Text>
      <Text style={styles.subtitle}>{region.subtitle}</Text>
      <View style={styles.bar}><View style={[styles.barFill,{width:`${Math.min(100,100*region.current/region.target)}%`}]} /></View>
      <Text style={styles.progress}>{region.current}/{region.target} · {region.unlocked?'Teljesítmény alapú küldetés':`Legalább ${region.level}. szint és az előző régió szükséges`}</Text>
    </View>
    <Text style={styles.label}>FELFEDEZETT PÁNCÉLOK</Text>
    <View style={styles.gear}>{available.map(g=><Pressable key={g.id}
      disabled={!g.unlocked} onPress={()=>customizeCreator('gear',g.id)}
      style={[styles.gearCell,g.unlocked&&{borderColor:g.accent},!g.unlocked&&{opacity:.5}]}>
      <Text style={[styles.gearGlyph,{color:g.unlocked?g.accent:colors.textMuted}]}>{g.unlocked?g.symbol:'◇'}</Text>
      <Text style={styles.gearName} numberOfLines={2}>{g.name}</Text>
    </Pressable>)}</View>
    <Text style={styles.disclaimer}>A térképen megjelenő jutalmak kozmetikai elemek. Nem jár plusz XP a kattintásokért.</Text>
  </View>;
}
const styles=StyleSheet.create({
  frame:{gap:15,borderColor:'#5D5975',padding:16},
  header:{flexDirection:'row',alignItems:'center',gap:12},
  eyebrow:{color:colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.4},
  heading:{color:colors.text,fontSize:21,fontWeight:'900'},
  subtitle:{fontSize:12,color:colors.textMuted,lineHeight:19},
  counter:{padding:8,backgroundColor:'#29263A',borderRadius:12,alignItems:'center'},
  counterN:{color:colors.gold,fontSize:20,fontWeight:'900'},
  counterCaption:{color:colors.textMuted,fontSize:9,fontWeight:'900'},
  map:{height:375,backgroundColor:colors.surface,borderColor:'#414D67',borderWidth:1,borderRadius:19,overflow:'hidden'},
  node:{position:'absolute',width:NODE_SIZE,height:NODE_SIZE,borderRadius:15,marginLeft:-NODE_SIZE/2,marginTop:-NODE_SIZE/2,
    backgroundColor:'#303E63',borderWidth:1,borderColor:'#889CBF',alignItems:'center',justifyContent:'center'},
  nodeDone:{backgroundColor:'#304C44',borderColor:colors.green},
  nodeSelected:{borderColor:colors.gold,borderWidth:2,backgroundColor:'#4E4261'},
  nodeLocked:{opacity:.65,backgroundColor:'#1A2335'},
  nodeSymbol:{fontSize:17,color:colors.text,fontWeight:'900'},
  nodeNumber:{color:colors.textSoft,fontSize:8,fontWeight:'900'},
  mapStamp:{position:'absolute',bottom:13,left:13,fontSize:9,color:'#91A1BB',letterSpacing:2},
  mapLegend:{position:'absolute',right:13,top:12,fontSize:9,color:'#91A1BB',letterSpacing:1},
  region:{backgroundColor:'#182238',borderRadius:16,padding:17,gap:7,borderColor:'#485673',borderWidth:1},
  regionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  regionEyebrow:{fontSize:10,color:colors.gold,fontWeight:'900',letterSpacing:1.4},
  reward:{fontSize:19,color:colors.gold},
  regionName:{fontSize:22,fontWeight:'900',color:colors.text},
  bar:{height:8,borderRadius:8,backgroundColor:colors.track,overflow:'hidden',marginTop:5},
  barFill:{backgroundColor:colors.gold,height:'100%'},
  progress:{color:colors.textSoft,fontSize:11},
  label:{color:colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.5},
  gear:{flexDirection:'row',flexWrap:'wrap',gap:7},
  gearCell:{width:'30%',flexGrow:1,borderRadius:13,borderWidth:1,borderColor:colors.cardBorder,
    backgroundColor:'#131C2D',padding:9,minHeight:80,alignItems:'center',justifyContent:'center',gap:6},
  gearGlyph:{fontSize:22},
  gearName:{color:colors.textSoft,fontWeight:'800',fontSize:10,textAlign:'center'},
  disclaimer:{fontSize:10,color:colors.textMuted,lineHeight:17}
});
