import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {useGame} from '../game/GameContext';
import EncounterArt from './EncounterArt';
import {MythicIcon,Sigil} from './MythicIcon';
import {colors,card} from '../theme';
export default function BossBoard(){
 const {bosses,progress}=useGame();
 return <View style={styles.group}>
   <View style={[card,styles.heading]}>
     <View style={styles.header}><Sigil name="crown" size={59} rarity="legendary"/>
       <View style={{flex:1,gap:7}}><Text style={styles.kicker}>WEEKLY RAID / ELITE ENCOUNTERS</Text>
         <Text style={styles.title}>Heti boss-aréna</Text></View></View>
     <Text style={styles.sub}>Három ellenfél. Három valós kihívás. A naplózott teljesítményed dönti el az eredményt.</Text>
     <View style={styles.totals}><MythicIcon name="trophy" size={19}/>
       <Text style={styles.wins}>{progress.bossWins} győzelem</Text><Text style={styles.xp}>+{progress.bossXP} XP</Text></View>
   </View>
   {bosses.map((b,i)=><View key={b.id} style={[styles.card,b.complete&&styles.defeated]}>
     <EncounterArt id={b.id} defeated={b.complete}/>
     <View style={styles.content}>
       <View style={styles.row}><View style={{flex:1,gap:5}}>
         <Text style={styles.kicker}>ENCOUNTER 0{i+1}  /  {b.complete?'DEFEATED':'ACTIVE THREAT'}</Text>
         <Text style={styles.name}>{b.title}</Text></View>
         <View style={styles.threat}><MythicIcon name={b.complete?'complete':'boss'} size={20} color={b.complete?colors.green:colors.gold}/>
           <Text style={styles.threatText}>{b.complete?'CLEARED':'ELITE'}</Text></View></View>
       <Text style={styles.sub}>{b.description}</Text>
       <View style={styles.track}><View style={[styles.fill,{width:`${100*b.progress/b.target}%`,backgroundColor:b.complete?colors.green:colors.gold}]}/></View>
       <View style={styles.bottom}><Text style={styles.progress}>{b.progress}/{b.target}</Text>
         <Text style={styles.xp}>REWARD  +{b.xp} XP</Text></View>
     </View>
   </View>)}
 </View>;
}
const styles=StyleSheet.create({
 group:{gap:14},heading:{gap:13,backgroundColor:'#242921',borderColor:'#947957'},
 header:{flexDirection:'row',alignItems:'center',gap:13},
 kicker:{color:colors.gold,fontWeight:'900',fontSize:10,letterSpacing:1.4},
 title:{fontSize:23,fontWeight:'900',color:colors.text},sub:{color:colors.textMuted,fontSize:12,lineHeight:18},
 totals:{flexDirection:'row',alignItems:'center',gap:9,borderTopWidth:1,borderTopColor:'#6B5941',paddingTop:11},
 wins:{color:colors.text,fontWeight:'900',fontSize:13,flex:1},xp:{color:colors.gold,fontWeight:'900',fontSize:12},
 card:{borderRadius:23,overflow:'hidden',borderWidth:1,borderColor:'#5F655B',backgroundColor:'#101F24'},
 defeated:{borderColor:colors.green},content:{padding:17,gap:10},
 row:{flexDirection:'row',alignItems:'center',gap:8},
 name:{color:colors.text,fontSize:20,fontWeight:'900'},
 threat:{borderRadius:11,borderWidth:1,borderColor:'#8E7654',paddingHorizontal:9,paddingVertical:7,
    gap:6,flexDirection:'row',alignItems:'center',backgroundColor:'#2C302A'},
 threatText:{color:colors.gold,fontSize:9,fontWeight:'900'},
 track:{height:8,borderRadius:8,overflow:'hidden',backgroundColor:colors.track},
 fill:{height:'100%',borderRadius:8},
 bottom:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 progress:{color:colors.textSoft,fontSize:12,fontWeight:'900'}
});
