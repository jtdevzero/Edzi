import React, {useEffect,useRef,useState} from 'react';
import {View,Text,Pressable,Animated,StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {subscribeRewards} from '../utils/rewards';
import {colors} from '../theme';
import {MythicIcon,Sigil,RARITY} from './MythicIcon';
// Overlay is non-blocking. It can be dismissed and automatically clears itself.
export default function RewardOverlay(){
  const [reward,setReward]=useState(null);
  const visibility=useRef(new Animated.Value(0)).current;
  const timeout=useRef(null);
  function hide(){Animated.timing(visibility,{toValue:0,duration:180,useNativeDriver:true}).start(()=>setReward(null));}
  useEffect(()=>{
    const unsub=subscribeRewards(next=>{
      if(timeout.current)clearTimeout(timeout.current);
      setReward(next);
      visibility.setValue(0);
      Animated.spring(visibility,{toValue:1,useNativeDriver:true,friction:8,tension:95}).start();
      timeout.current=setTimeout(hide,5000);
    });
    return ()=>{unsub();if(timeout.current)clearTimeout(timeout.current);};
  },[]);
  if(!reward)return null;
  return <View pointerEvents="box-none" style={styles.anchor}>
    <Animated.View style={{opacity:visibility,transform:[{translateY:visibility.interpolate({inputRange:[0,1],outputRange:[-24,0]})}]}}>
      <LinearGradient colors={reward.heading==='EVOLÚCIÓ!'?['#4B3D28','#282621','#0D171E']:['#20464A','#16242C','#0D171E']} style={styles.panel}>
        <View style={{flexDirection:'row',alignItems:'center',gap:11}}><Sigil name={reward.heading==='EVOLÚCIÓ!'?'crown':reward.heading==='SZINTLÉPÉS!'?'unlock':'complete'} size={53} rarity={reward.heading==='EVOLÚCIÓ!'?'mythic':reward.heading==='SZINTLÉPÉS!'?'legendary':'rare'}/><View style={{flex:1}}><Text style={styles.eyebrow}>NIGHTFALL / MISSION COMPLETE</Text><Text style={styles.rarity}>{reward.heading==='EVOLÚCIÓ!'?'MYTHIC ASCENSION':reward.heading==='SZINTLÉPÉS!'?'LEVEL REVEAL':'REWARD ACQUIRED'}</Text></View></View>
        <View style={styles.row}><View style={{flex:1}}>
          <Text style={styles.heading}>{reward.heading}</Text>
          <Text style={styles.subtitle}>{reward.subtitle}</Text>
          {reward.achievements.length>0&&<Text style={styles.achievements}>
            {reward.achievements.map(a=>a.title).join(' · ')}
          </Text>}
        </View>
          <Text style={styles.xp}>{reward.xp>=0?'+':''}{reward.xp} XP</Text>
        </View>
        <Pressable onPress={()=>{if(timeout.current)clearTimeout(timeout.current);hide();}}
          accessibilityRole="button" accessibilityLabel="Jutalomüzenet bezárása" style={styles.close}>
          <Text style={styles.closeText}>Bezárás  ×</Text>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  </View>;
}
const styles=StyleSheet.create({
  anchor:{position:'absolute',top:48,left:12,right:12,zIndex:200,elevation:40},
  panel:{padding:19,borderRadius:22,borderWidth:1,borderColor:'#B8A47F',gap:11,shadowColor:'#05040F',shadowOpacity:.45,shadowRadius:20,elevation:10},
  eyebrow:{fontSize:10,fontWeight:'900',color:colors.gold,letterSpacing:2},
  rarity:{fontSize:10,fontWeight:'900',color:colors.cyan,letterSpacing:1.4,marginTop:5},
  row:{flexDirection:'row',alignItems:'center',gap:8},
  heading:{color:'white',fontWeight:'900',fontSize:19},subtitle:{color:colors.textSoft,fontSize:12,marginTop:4},
  achievements:{color:colors.gold,fontSize:11,marginTop:6},
  xp:{color:colors.gold,fontSize:19,fontWeight:'900'},
  close:{alignSelf:'flex-end',paddingHorizontal:8,paddingVertical:4},
  closeText:{color:colors.textMuted,fontWeight:'800',fontSize:11}
});
