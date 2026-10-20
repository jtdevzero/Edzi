import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import HunterPortrait from './HunterPortrait';
import {useGame} from '../game/GameContext';
import {colors,card} from '../theme';
import {getClass} from '../game/characters';
export default function HunterEvolution(){
  const {hunter,customizeHunter,state,progress}=useGame();
  return <View style={[card,styles.box]}>
    <Text style={styles.eyebrow}>HUNTER EVOLUTION / COSMETICS</Text>
    <View style={styles.preview}>
      <HunterPortrait size={146} accent={hunter.style.accent} classId={getClass(state.character.classId).id}/>
      <View style={styles.info}><Text style={styles.big}>{hunter.style.emblem}</Text>
        <Text style={styles.name}>{hunter.style.name}</Text><Text style={styles.sub}>{hunter.title}</Text>
        <Text style={styles.muted}>LEVEL {progress.level} · {progress.bossWins} boss legyőzve</Text>
        {hunter.nextLevel&&<Text style={styles.muted}>Következő forma: {hunter.nextLevel}. szint</Text>}
      </View>
    </View>
    <Text style={styles.label}>VADÁSZFORMA</Text>
    <View style={styles.options}>{hunter.styles.map(opt=><Pressable key={opt.id}
      disabled={!opt.unlocked} onPress={()=>customizeHunter('style',opt.id)}
      style={[styles.option,hunter.style.id===opt.id&&styles.active,!opt.unlocked&&styles.locked]}>
      <Text style={styles.emblem}>{opt.unlocked?opt.emblem:'🔒'}</Text>
      <Text style={styles.optionText}>{opt.name}</Text><Text style={styles.req}>Lv.{opt.minLevel}</Text>
    </Pressable>)}</View>
    <Text style={styles.label}>BOSS-AURA</Text>
    <View style={styles.options}>{hunter.trails.map(opt=><Pressable key={opt.id} disabled={!opt.unlocked}
      onPress={()=>customizeHunter('trail',opt.id)} style={[styles.option,hunter.trail.id===opt.id&&styles.active,!opt.unlocked&&styles.locked]}>
      <Text style={styles.emblem}>{opt.unlocked?'✧':'🔒'}</Text>
      <Text style={styles.optionText}>{opt.name}</Text>
      <Text style={styles.req}>{opt.minimumBosses} boss</Text>
    </Pressable>)}</View>
    <Text style={styles.muted}>Csak megjelenésbeli jutalmak; az edzésadataid és az XP nem módosulnak.</Text>
  </View>;
}
const styles=StyleSheet.create({
  box:{gap:16,borderColor:'#574E6D'},
  eyebrow:{color:colors.gold,fontWeight:'900',letterSpacing:1.4,fontSize:10},
  preview:{flexDirection:'row',alignItems:'center',gap:8,overflow:'hidden'},
  info:{flex:1,gap:4},big:{fontSize:30,color:colors.gold},name:{fontSize:20,fontWeight:'900',color:colors.text},
  sub:{color:colors.primarySoft,fontSize:12},muted:{color:colors.textMuted,fontSize:11,lineHeight:17},
  label:{fontSize:10,fontWeight:'900',color:colors.gold,letterSpacing:1.5},
  options:{flexDirection:'row',flexWrap:'wrap',gap:8},
  option:{width:'30%',flexGrow:1,minHeight:80,backgroundColor:colors.input,borderWidth:1,borderColor:colors.cardBorder,borderRadius:12,alignItems:'center',justifyContent:'center',padding:6,gap:3},
  active:{borderColor:colors.gold,backgroundColor:'#302B37'},
  locked:{opacity:.5},
  emblem:{fontSize:20,color:colors.gold},
  optionText:{fontSize:11,fontWeight:'800',color:colors.text,textAlign:'center'},
  req:{color:colors.textMuted,fontSize:9}
});
