import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {useGame} from '../game/GameContext';
import {colors} from '../theme';
export default function AppModeSwitcher(){
  const {state,setAppMode}=useGame();
  const active=state.preferences?.appMode||'hunter';
  return <View style={styles.bar}>
    <Text style={styles.caption}>VIEW</Text>
    {[['hunter','⚔ Hunter Mode'],['performance','◈ Performance']].map(([id,label])=>
      <Pressable key={id} accessibilityRole="button" accessibilityState={{selected:active===id}}
        onPress={()=>setAppMode(id)} style={[styles.option,active===id&&styles.selected]}>
        <Text style={[styles.label,active===id&&styles.activeText]}>{label}</Text>
      </Pressable>)}
  </View>;
}
const styles=StyleSheet.create({
  bar:{flexDirection:'row',alignItems:'center',padding:4,gap:5,borderRadius:15,
    backgroundColor:'#101B23',borderWidth:1,borderColor:'#325057'},
  caption:{fontSize:8,fontWeight:'900',letterSpacing:1.4,color:colors.cyan,paddingHorizontal:6},
  option:{flex:1,minHeight:39,alignItems:'center',justifyContent:'center',borderRadius:11},
  selected:{backgroundColor:'#2E2E29',borderWidth:1,borderColor:'#B89561'},
  label:{color:colors.textMuted,fontSize:11,fontWeight:'900'},
  activeText:{color:colors.gold}
});
