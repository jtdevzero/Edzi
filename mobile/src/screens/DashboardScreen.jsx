import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import Screen from '../components/Screen';
import CharacterCard from '../components/CharacterCard';
import SectionHeading from '../components/SectionHeading';
import { useGame } from '../game/GameContext';
import { ACTIVITY_TYPES, WEEKLY_GOAL_BONUS } from '../game/gamification';
import { colors, card } from '../theme';
const shortcuts = [
  { target:'Log', icon:'⚔', name:'Edzés', help:'Új menet indítása' },
  { target:'Quests', icon:'✦', name:'Questek', help:'XP gyűjtése' },
  { target:'Stats', icon:'◈', name:'Fejlődés', help:'Rekordok' }
];
function CircleGoal({active,goal}) {
  const r=31,c=2*Math.PI*r,p=Math.min(1,active/Math.max(1,goal));
  return <View style={s.ring}>
    <Svg width={88} height={88} viewBox="0 0 88 88" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Circle cx="44" cy="44" r={r} stroke={colors.track} strokeWidth="8" fill="none"/>
      <Circle cx="44" cy="44" r={r} stroke={colors.cyan} strokeWidth="8" fill="none"
        strokeDasharray={`${p*c} ${c}`} strokeLinecap="round" transform="rotate(-90 44 44)"/>
    </Svg>
    <Text style={s.ringValue}>{active}<Text style={s.ringSmall}>/{goal}</Text></Text>
  </View>;
}
function Metric({value,label,color}) {
  return <View style={[card,s.metric]}><View style={[s.metricLine,{backgroundColor:color}]}/>
    <Text style={s.metricValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    <Text style={s.metricName}>{label}</Text>
  </View>;
}
export default function DashboardScreen({navigation}) {
  const {state,progress,quests,programStatus,weeklyTrials}=useGame();
  const done=quests.filter(q=>q.completed).length;
  const goal=progress.weeklyGoal||3, active=Math.min(goal,progress.thisWeekActiveDays);
  const recent=[...state.activities].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  const backupDue=state.activities.length>=3&&(!state.lastBackupAt || Date.now()-new Date(state.lastBackupAt).getTime()>7*86400000);
  const trial=weeklyTrials.find(t=>!t.completed);
  return <Screen title="Edzi" subtitle="A fejlődésed minden nap számít." eyebrow="ASCENSION  /  YOUR JOURNEY"
    right={<View style={s.streak}><Text style={s.streakBig}>🔥 {progress.streak}</Text><Text style={s.streakLabel}>NAP</Text></View>}>
    {backupDue&&<Pressable style={[card,s.backup]} onPress={()=>navigation.navigate('Character')}>
      <Text style={s.backupTitle}>◇  MENTSÜK A FEJLŐDÉSEDET</Text>
      <Text style={s.backupCopy}>Az adataid helyben vannak. Koppints a biztonsági mentéshez →</Text>
    </Pressable>}
    <CharacterCard character={state.character} progress={progress}/>
    <View style={s.metrics}>
      <Metric value={progress.totalXP.toLocaleString('hu-HU')} label="ÖSSZES XP" color={colors.primarySoft}/>
      <Metric value={`${done}/${quests.length}`} label="MAI QUEST" color={colors.cyan}/>
      <Metric value={state.activities.length} label="AKTIVITÁS" color={colors.green}/>
    </View>
    <SectionHeading eyebrow="QUICK ACTIONS" title="Ugrás az akcióba"/>
    <View style={s.shortcuts}>{shortcuts.map((a,i)=><Pressable accessibilityRole="button" accessibilityLabel={a.name}
      key={a.target} onPress={()=>navigation.navigate(a.target)} style={[s.shortcut,i===0&&s.shortcutFirst]}>
      <Text style={s.shortcutIcon}>{a.icon}</Text><Text style={s.shortcutName}>{a.name}</Text>
      <Text style={s.shortcutHelp}>{a.help}</Text>
    </Pressable>)}</View>
    <Pressable style={s.launch} onPress={()=>navigation.navigate('Log')} accessibilityRole="button">
      <LinearGradient colors={['#7958FF','#4A56DD']} style={s.launchFill} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View><Text style={s.launchTop}>YOUR NEXT MOVE</Text><Text style={s.launchTitle}>INDULHAT AZ EDZÉS</Text></View>
        <Text style={s.launchArrow}>↗</Text>
      </LinearGradient>
    </Pressable>
    <SectionHeading eyebrow="PROGRESS TRACKER" title="Ezen a héten"/>
    <View style={[card,s.week]}>
      <CircleGoal active={active} goal={goal}/>
      <View style={s.weekCopy}>
        <Text style={s.weekTitle}>{active>=goal?'Megcsináltad. Szép munka!':'Épül a lendület.'}</Text>
        <Text style={s.weekSub}>{active>=goal?`+ ${WEEKLY_GOAL_BONUS} XP heti bónusz`:`Még ${goal-active} aktív nap +${WEEKLY_GOAL_BONUS} XP-ig.`}</Text>
        <View style={s.dots}>{Array.from({length:goal},(_,i)=><View key={i} style={[s.dot,i<active&&s.dotOn]}/>)}</View>
      </View>
    </View>
    {trial&&<Pressable style={[card,s.trial]} onPress={()=>navigation.navigate('Quests')}>
      <Text style={s.trialIcon}>{trial.emoji}</Text>
      <View style={{flex:1}}><Text style={s.trialLabel}>KÖVETKEZŐ HŐSPRÓBA</Text><Text style={s.trialTitle}>{trial.title}</Text>
        <Text style={s.trialCount}>{trial.current}/{trial.target} · +{trial.xp} XP</Text></View>
      <Text style={s.trialArrow}>↗</Text>
    </Pressable>}
    {programStatus&&<Pressable style={[card,s.program]} onPress={()=>navigation.navigate('Quests')}>
      <Text style={s.programText}>{programStatus.program.emoji} {programStatus.program.name} · {programStatus.currentDay}. nap →</Text>
    </Pressable>}
    <SectionHeading eyebrow="DAILY OPERATIONS" title="Mai küldetések"
      right={<Text style={s.counter}>{done}/{quests.length} KÉSZ</Text>}/>
    <View style={[card,{paddingVertical:5}]}>{quests.map((q,i)=><Pressable key={q.id} onPress={()=>navigation.navigate('Quests')}
      style={[s.mission,i>0&&{borderTopWidth:1,borderTopColor:colors.cardBorder}]}>
      <View style={[s.checkBox,q.completed&&s.checkDone]}><Text style={s.checkText}>{q.completed?'✓':''}</Text></View>
      <View style={{flex:1}}><Text style={[s.missionTitle,q.completed&&{color:colors.textMuted}]}>{q.title}</Text>
        <Text style={s.missionMeta}>{q.category==='physical'?'FIZIKAI':q.category==='mental'?'MENTÁLIS':'REGENERÁCIÓ'}</Text></View>
      <Text style={s.questXP}>+{q.xp} XP</Text></Pressable>)}</View>
    {recent.length>0&&<>
      <SectionHeading eyebrow="ACTIVITY FEED" title="Legutóbbi aktivitások"/>
      <View style={[card,{gap:13}]}>{recent.map(a=><View key={a.id} style={s.activity}>
        <Text style={{fontSize:21}}>{ACTIVITY_TYPES[a.type]?.emoji||'✦'}</Text>
        <View style={{flex:1}}><Text style={s.activityTitle} numberOfLines={1}>{a.title}</Text>
          <Text style={s.activityMeta}>{a.duration} perc</Text></View>
        <Text style={s.questXP}>+{progress.xpById[a.id]||0} XP</Text>
      </View>)}</View>
    </>}
  </Screen>;
}
const s=StyleSheet.create({
  streak:{paddingHorizontal:13,paddingVertical:6,borderRadius:16,backgroundColor:'#302A22',borderWidth:1,borderColor:'#856E4A',alignItems:'center'},
  streakBig:{color:colors.gold,fontSize:16,fontWeight:'900'},streakLabel:{color:colors.gold,fontSize:9,fontWeight:'900',letterSpacing:1.5},
  backup:{backgroundColor:'#102D3D',borderColor:colors.cyan,gap:5},backupTitle:{color:colors.cyan,fontSize:11,fontWeight:'900',letterSpacing:.8},backupCopy:{color:colors.textSoft,fontSize:12,lineHeight:19},
  metrics:{flexDirection:'row',gap:8},metric:{flex:1,minWidth:0,alignItems:'center',paddingHorizontal:6,paddingVertical:15,gap:6},
  metricLine:{width:24,height:3,borderRadius:10},metricValue:{color:colors.text,fontSize:20,fontWeight:'900'},
  metricName:{color:colors.textMuted,fontSize:9,fontWeight:'900',letterSpacing:.4,textAlign:'center'},
  shortcuts:{flexDirection:'row',gap:8},shortcut:{flex:1,minHeight:100,borderRadius:19,padding:12,gap:6,backgroundColor:colors.card,borderWidth:1,borderColor:colors.cardBorder},
  shortcutFirst:{backgroundColor:'#242552',borderColor:'#665BB9'},shortcutIcon:{fontSize:23,color:colors.cyan,fontWeight:'900'},
  shortcutName:{color:colors.text,fontSize:13,fontWeight:'900'},shortcutHelp:{color:colors.textMuted,fontSize:10},
  launch:{borderRadius:20,overflow:'hidden'},launchFill:{padding:19,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  launchTop:{fontSize:10,color:'#DFD7FF',fontWeight:'900',letterSpacing:2},launchTitle:{color:'white',fontWeight:'900',fontSize:17,marginTop:6},
  launchArrow:{color:'white',fontSize:28},week:{flexDirection:'row',alignItems:'center',gap:13},
  ring:{width:88,height:88,alignItems:'center',justifyContent:'center'},ringValue:{color:colors.text,fontSize:24,fontWeight:'900'},ringSmall:{color:colors.textMuted,fontSize:11},
  weekCopy:{flex:1,gap:8},weekTitle:{color:colors.text,fontSize:15,fontWeight:'900'},weekSub:{color:colors.textMuted,fontSize:12,lineHeight:18},
  dots:{flexDirection:'row',gap:5,marginTop:3},dot:{flex:1,height:6,borderRadius:9,backgroundColor:colors.track},dotOn:{backgroundColor:colors.cyan},
  trial:{flexDirection:'row',alignItems:'center',gap:12,borderColor:'#3B3E7B'},trialIcon:{fontSize:29},trialLabel:{color:colors.gold,fontWeight:'900',fontSize:9,letterSpacing:1.2},
  trialTitle:{color:colors.text,fontSize:14,fontWeight:'900',marginTop:4},trialCount:{color:colors.textMuted,fontSize:11,marginTop:3},
  trialArrow:{color:colors.primarySoft,fontSize:23},program:{borderColor:colors.gold},programText:{color:colors.gold,fontSize:13,fontWeight:'800'},
  counter:{color:colors.cyan,fontSize:10,fontWeight:'900'},mission:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:13},
  checkBox:{width:26,height:26,borderRadius:8,borderWidth:1,borderColor:'#576683',alignItems:'center',justifyContent:'center'},
  checkDone:{backgroundColor:'#164C3E',borderColor:colors.green},checkText:{color:colors.green,fontWeight:'900'},
  missionTitle:{color:colors.text,fontSize:13,fontWeight:'800'},missionMeta:{color:colors.textMuted,fontSize:9,letterSpacing:.8,marginTop:4,fontWeight:'800'},
  questXP:{color:colors.primarySoft,fontSize:12,fontWeight:'900'},
  activity:{flexDirection:'row',alignItems:'center',gap:12},activityTitle:{color:colors.text,fontSize:13,fontWeight:'900'},
  activityMeta:{color:colors.textMuted,fontSize:11,marginTop:4}
});
