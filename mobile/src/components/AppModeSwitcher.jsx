import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {useGame} from '../game/GameContext';
import {colors} from '../theme';
export default function AppModeSwitcher(){
  const {state,setAppMode}=useGame();
  const active=state.preferences?.appMode||'hunter';
  return <View style={styles.bar}>
    {[['hunter','⚔ Hunter Mode'],['performance','◈ Performance']].map(([id,label])=>
      <Pressable key={id} accessibilityRole="button" accessibilityState={{selected:active===id}}
        onPress={()=>setAppMode(id)} style={[styles.option,active===id&&styles.selected]}>
        <Text style={[styles.label,active===id&&styles.activeText]}>{label}</Text>
      </Pressable>)}
  </View>;
}
const styles=StyleSheet.create({
  bar:{flexDirection:'row',padding:5,gap:5,borderRadius:17,backgroundColor:colors.cardElevated,
    borderWidth:1,borderColor:colors.cardBorder},
  option:{flex:1,minHeight:43,alignItems:'center',justifyContent:'center',borderRadius:12},
  selected:{backgroundColor:'#39304C',borderWidth:1,borderColor:colors.gold},
  label:{color:colors.textMuted,fontSize:12,fontWeight:'900'},
  activeText:{color:colors.gold}
});
