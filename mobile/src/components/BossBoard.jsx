import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {useGame} from '../game/GameContext';
import {colors,card} from '../theme';
export default function BossBoard(){
  const {bosses,progress}=useGame();
  return <View style={styles.container}>
    <View style={[card,styles.heading]}>
      <Text style={styles.tag}>⚔  WEEKLY RAID / NO MANUAL CLAIM</Text>
      <Text style={styles.title}>Heti boss-aréna</Text>
      <Text style={styles.sub}>Valódi edzésből győzhetsz. A teljesítés és a jutalom automatikus; törölt aktivitás esetén újraszámoljuk.</Text>
      <Text style={styles.wins}>🏆 {progress.bossWins} győzelem · +{progress.bossXP} XP összesen</Text>
    </View>
    {bosses.map((b,i)=><View key={b.id} style={[card,styles.boss,b.complete&&styles.defeated]}>
      <View style={styles.row}><View style={styles.avatar}><Text style={styles.emoji}>{b.emoji}</Text></View>
        <View style={{flex:1,gap:5}}><Text style={styles.eyebrow}>BOSS 0{i+1}  /  {b.complete?'LEGYŐZVE':'AKTÍV'}</Text>
          <Text style={styles.name}>{b.title}</Text><Text style={styles.sub}>{b.description}</Text></View>
        <Text style={styles.xp}>+{b.xp} XP</Text></View>
      <View style={styles.track}><View style={[styles.fill,{width:`${100*b.progress/b.target}%`,backgroundColor:b.complete?colors.green:colors.gold}]}/></View>
      <Text style={styles.progress}>{b.progress}/{b.target} {b.complete?'· TELJESÍTVE':''}</Text>
    </View>)}
  </View>;
}
const styles=StyleSheet.create({
  container:{gap:11},heading:{gap:10,borderColor:'#6B5C58',backgroundColor:'#24202B'},
  tag:{fontSize:10,fontWeight:'900',color:colors.gold,letterSpacing:1.3},
  title:{fontSize:22,color:colors.text,fontWeight:'900'},
  sub:{color:colors.textMuted,fontSize:12,lineHeight:18},
  wins:{color:colors.gold,fontSize:12,fontWeight:'800'},
  boss:{gap:10},defeated:{borderColor:colors.green,backgroundColor:'#112822'},
  row:{flexDirection:'row',alignItems:'center',gap:10},
  avatar:{width:46,height:46,borderRadius:14,backgroundColor:'#2B2A3C',alignItems:'center',justifyContent:'center'},
  emoji:{fontSize:25},eyebrow:{color:colors.gold,fontSize:9,letterSpacing:1.3,fontWeight:'900'},
  name:{color:colors.text,fontSize:17,fontWeight:'900'},xp:{color:colors.gold,fontWeight:'900',fontSize:12},
  track:{height:8,borderRadius:6,backgroundColor:colors.track,overflow:'hidden'},
  fill:{height:'100%',borderRadius:6},progress:{color:colors.textMuted,fontSize:10,fontWeight:'800'}
});
