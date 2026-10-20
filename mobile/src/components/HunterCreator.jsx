import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {useGame} from '../game/GameContext';
import {VISORS,HELMETS,portraitOptions} from '../game/characterCreator';
import {worldProgress,selectWorldGear} from '../game/hunterWorld';
import HunterPortrait from './HunterPortrait';
import {colors,card} from '../theme';
import {MythicIcon} from './MythicIcon';
export default function HunterCreator(){
  const {state,progress,customizeCreator}=useGame();
  const gear=selectWorldGear(state.character,worldProgress(state,progress));
  const creator=portraitOptions(state.character,gear);
  return <View style={[card,styles.box]}>
    <Text style={styles.eyebrow}>CHARACTER CREATOR / ARMORY</Text>
    <Text style={styles.title}>Alakítsd a vadászodat!</Text>
    <View style={styles.hero}><HunterPortrait classId={state.character.classId} size={168}
      accent={creator.visorColor} helmetStyle={creator.helmetStyle} armorAccent={creator.armorAccent}/></View>
    <Text style={styles.label}>ENERGIA / SISAKFÉNY</Text>
    <View style={styles.row}>{VISORS.map(c=><Pressable key={c.id} onPress={()=>customizeCreator('visor',c.id)}
      accessibilityRole="button" accessibilityState={{selected:creator.visorColor===c.color}}
      style={[styles.cell,creator.visorColor===c.color&&styles.selected]}>
      <View style={[styles.swatch,{backgroundColor:c.color}]}/><Text style={styles.name}>{c.name}</Text>
    </Pressable>)}</View>
    <Text style={styles.label}>SISAKFORMA</Text>
    <View style={styles.row}>{HELMETS.map(c=><Pressable key={c.id} onPress={()=>customizeCreator('helmet',c.id)}
      accessibilityRole="button" accessibilityState={{selected:creator.helmetStyle===c.id}}
      style={[styles.cell,creator.helmetStyle===c.id&&styles.selected]}>
      <MythicIcon name={c.id==='royal'?'crown':c.id==='shadow'?'shadow':'shield'} size={26}/>
      <Text style={styles.name}>{c.name}</Text>
    </Pressable>)}</View>
    <Text style={styles.small}>A karaktered kinézete lokálisan mentődik. Valódi személyfotó feltöltése nélkül működik, offline is.</Text>
  </View>;
}
const styles=StyleSheet.create({
  box:{gap:14,borderColor:'#607970'},
  eyebrow:{color:colors.gold,fontWeight:'900',fontSize:10,letterSpacing:1.4},
  title:{fontSize:21,fontWeight:'900',color:colors.text},
  hero:{alignItems:'center',backgroundColor:'#152A2F',borderRadius:19,overflow:'hidden',paddingTop:7},
  label:{fontSize:10,fontWeight:'900',letterSpacing:1.4,color:colors.gold},
  row:{flexDirection:'row',gap:7,flexWrap:'wrap'},
  cell:{flexGrow:1,minWidth:67,backgroundColor:'#1C3333',padding:10,borderRadius:12,
    alignItems:'center',gap:6,borderColor:colors.cardBorder,borderWidth:1},
  selected:{borderColor:colors.gold,backgroundColor:'#33493E'},
  swatch:{width:26,height:26,borderRadius:13},
  name:{color:colors.textSoft,fontSize:10,fontWeight:'800',textAlign:'center'},
  icon:{color:colors.gold,fontSize:23},
  small:{color:colors.textMuted,fontSize:11,lineHeight:18}
});
