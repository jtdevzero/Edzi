import React,{useState} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet} from 'react-native';
import {useGame} from '../game/GameContext';
import {localGuildChallenges} from '../game/guild';
import {colors,card} from '../theme';
export default function HunterGuild(){
  const {state,setGuild}=useGame();
  const guild=state.guild||null;
  const [editing,setEditing]=useState(false);
  const [name,setName]=useState(guild?.name||'');
  const [members,setMembers]=useState((guild?.members||[]).join(', '));
  const tasks=localGuildChallenges(state);
  return <View style={[card,styles.root]}>
    <Text style={styles.eyebrow}>GUILD HALL / PRIVATE SQUAD</Text>
    <Text style={styles.heading}>{guild?.name||'Alapíts egy céhet'}</Text>
    <Text style={styles.note}>A céh most helyi tervező- és közös célfelület. Nem valódi online multiplayer: a meghívottak nevei nem jelennek meg más eszközön, és senki más teljesítményét nem követjük.</Text>
    {guild&&<Text style={styles.members}>CSAPAT: {guild.members.length?guild.members.join(' · '):'Még nincs megadott név'}</Text>}
    <Pressable onPress={()=>setEditing(v=>!v)} style={styles.edit}><Text style={styles.action}>{editing?'Szerkesztő bezárása':'Céh és taglista szerkesztése ↗'}</Text></Pressable>
    {editing&&<View style={styles.form}>
      <TextInput value={name} onChangeText={setName} style={styles.input} maxLength={35}
        placeholder="Céh neve" placeholderTextColor={colors.textMuted}/>
      <TextInput value={members} onChangeText={setMembers} style={styles.input}
        placeholder="Barátok keresztneve, vesszővel" placeholderTextColor={colors.textMuted}/>
      <Pressable onPress={()=>{setGuild({name,members:members.split(',')});setEditing(false)}} style={styles.save}>
        <Text style={styles.saveText}>Céh mentése</Text>
      </Pressable>
    </View>}
    <Text style={styles.eyebrow}>LOCAL GUILD MISSIONS / THIS WEEK</Text>
    {tasks.map(task=><View key={task.id} style={styles.task}>
      <View style={styles.taskTop}><Text style={styles.taskName}>{task.icon} {task.title}</Text>
        <Text style={styles.count}>{task.current}/{task.target}</Text></View>
      <View style={styles.track}><View style={[styles.fill,{width:`${100*task.current/task.target}%`,backgroundColor:task.complete?colors.green:colors.gold}]}/></View>
    </View>)}
    <Text style={styles.note}>Az értékek csak a te naplód alapján számolódnak. Nem jár külön XP és nem történik adatküldés.</Text>
  </View>;
}
const styles=StyleSheet.create({
  root:{gap:14,borderColor:'#56516C'},
  eyebrow:{color:colors.gold,fontWeight:'900',fontSize:10,letterSpacing:1.4},
  heading:{color:colors.text,fontSize:21,fontWeight:'900'},
  note:{color:colors.textMuted,fontSize:11,lineHeight:18},
  members:{color:colors.cyan,fontSize:11,fontWeight:'900'},
  edit:{alignSelf:'flex-start',padding:9},action:{color:colors.gold,fontSize:12,fontWeight:'900'},
  form:{gap:9},input:{minHeight:47,backgroundColor:colors.input,borderRadius:12,paddingHorizontal:12,color:colors.text},
  save:{backgroundColor:colors.primary,padding:14,borderRadius:11,alignItems:'center'},
  saveText:{color:'#fff',fontWeight:'900'},
  task:{gap:9},taskTop:{flexDirection:'row',justifyContent:'space-between',gap:7},
  taskName:{color:colors.text,fontSize:13,fontWeight:'800'},
  count:{color:colors.gold,fontSize:12,fontWeight:'900'},
  track:{height:7,borderRadius:7,backgroundColor:colors.track,overflow:'hidden'},
  fill:{height:'100%',borderRadius:7}
});
