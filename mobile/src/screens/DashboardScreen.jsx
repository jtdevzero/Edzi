import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Svg,{Circle,Path} from 'react-native-svg';
import Screen from '../components/Screen';
import CharacterCard from '../components/CharacterCard';
import SectionHeading from '../components/SectionHeading';
import {useGame} from '../game/GameContext';
import {ACTIVITY_TYPES,WEEKLY_GOAL_BONUS} from '../game/gamification';
import {colors,card} from '../theme';
import AppModeSwitcher from '../components/AppModeSwitcher';
import PerformanceCenter from '../components/PerformanceCenter';
import HunterMentor from '../components/HunterMentor';
import {worldProgress} from '../game/hunterWorld';

function Ring({value,total}){
  const radius=32,c=2*Math.PI*radius;
  const percent=Math.min(1,value/Math.max(1,total));
  return <View style={styles.ring}>
    <Svg width={93} height={93} viewBox="0 0 93 93" style={StyleSheet.absoluteFill}>
      <Circle cx="46.5" cy="46.5" r={radius} stroke={colors.track} strokeWidth="6" fill="none"/>
      <Circle cx="46.5" cy="46.5" r={radius} stroke={colors.gold} strokeWidth="6" fill="none"
        strokeDasharray={`${percent*c} ${c}`} strokeLinecap="round" transform="rotate(-90 46.5 46.5)"/>
      <Circle cx="46.5" cy="46.5" r="26" stroke={colors.gold} strokeOpacity=".13" fill="none"/>
    </Svg>
    <Text style={styles.ringNumber}>{value}<Text style={styles.ringOf}>/{total}</Text></Text>
  </View>;
}
function Stat({value,label,emphasis}){
  return <View style={styles.stat}>
    <Text style={[styles.statValue,emphasis&&{color:colors.gold}]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>;
}
export default function DashboardScreen({navigation}){
  const {state,progress,quests,programStatus,weeklyTrials,storageWarning}=useGame();
  const completed=quests.filter(q=>q.completed).length;
  const regions=worldProgress(state,progress);
  const explored=regions.filter(r=>r.complete).length;
  const weeklyGoal=progress.weeklyGoal||3;
  const days=Math.min(progress.thisWeekActiveDays,weeklyGoal);
  const nextTrial=weeklyTrials.find(t=>!t.completed);
  const recent=[...state.activities].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,2);
  const backupDue=state.activities.length>=3&&(!state.lastBackupAt||
    !Number.isFinite(new Date(state.lastBackupAt).getTime())||
    Date.now()-new Date(state.lastBackupAt).getTime()>7*86400000);
  return <Screen title="Edzi" eyebrow="ASCENSION · THE NEXT LEVEL" subtitle="A fejlődésed új fejezete."
    right={<View style={styles.streak}><Text style={styles.streakFire}>✦ {progress.streak}</Text><Text style={styles.streakTiny}>DAY STREAK</Text></View>}>
    {storageWarning&&<View style={[card,styles.warning]}>
      <Text style={styles.warningTitle}>A helyi mentés nem elérhető.</Text>
      <Text style={styles.warningText}>Próbáld normál böngészőben, majd készíts biztonsági exportot.</Text>
    </View>}
    {backupDue&&<Pressable style={[card,styles.warning]} onPress={()=>navigation.navigate('Character')}>
      <Text style={styles.warningTitle}>◇ VÉDD MEG A FEJLŐDÉSEDET</Text>
      <Text style={styles.warningText}>Helyi adatok · Biztonsági mentés készítése ↗</Text>
    </Pressable>}
    <AppModeSwitcher />
    {state.preferences?.appMode==='performance' ? <PerformanceCenter /> : <CharacterCard character={state.character} progress={progress}/>}
    <Pressable style={[card,styles.worldEntry]} onPress={()=>navigation.navigate('Quests')}>
      <Text style={styles.worldTag}>✦ HUNTER WORLD  /  {explored} / 5 RÉGIÓ</Text>
      <Text style={styles.worldTitle}>A világod rád vár ↗</Text>
      <Text style={styles.worldCopy}>Új területek, feloldható páncélok és céhes kihívások.</Text>
    </Pressable>
    <HunterMentor />
    <View style={styles.report}>
      <Text style={styles.reportEyebrow}>FIELD REPORT <Text style={{color:colors.textMuted}}> /  LIFETIME</Text></Text>
      <View style={styles.statRow}>
        <Stat value={progress.totalXP.toLocaleString('hu-HU')} label="TOTAL XP" emphasis/>
        <View style={styles.separator}/>
        <Stat value={String(state.activities.length)} label="AKTIVITÁS"/>
        <View style={styles.separator}/>
        <Stat value={`${completed}/${quests.length}`} label="MAI QUEST"/>
      </View>
    </View>

    <View style={styles.actionGroup}>
      <SectionHeading eyebrow="MAKE YOUR MOVE" title="Kezdődik a következő szint"/>
      <Pressable onPress={()=>navigation.navigate('Log')} style={styles.heroAction} accessibilityRole="button">
        <LinearGradient colors={['#675CE6','#332F88','#201D4C']} style={styles.heroActionGradient}
          start={{x:0,y:0}} end={{x:1,y:1}}>
          <Svg width={96} height={100} style={styles.actionMark} viewBox="0 0 100 100">
            <Circle cx="60" cy="44" r="38" stroke="#F8F6FF" strokeOpacity=".25" strokeWidth="1" fill="none"/>
            <Path d="M60 18 V70 M34 44 H86" stroke={colors.gold} strokeWidth="2.5" strokeLinecap="round"/>
          </Svg>
          <Text style={styles.actionEyebrow}>01 / TRAINING SESSION</Text>
          <Text style={styles.actionTitle}>INDULHAT AZ EDZÉS</Text>
          <Text style={styles.actionSubtitle}>Lépj be az arénába. Rögzítsd a következő rekordod.</Text>
          <View style={styles.actionArrow}><Text style={styles.actionArrowText}>INDÍTÁS  ↗</Text></View>
        </LinearGradient>
      </Pressable>
      <View style={styles.secondaryActions}>
        <Pressable onPress={()=>navigation.navigate('Quests')} style={styles.secondaryAction}>
          <Text style={styles.secondaryIcon}>✧</Text>
          <View style={{flex:1}}><Text style={styles.secondaryName}>Küldetések</Text>
            <Text style={styles.secondaryDesc}>XP és hőspróbák</Text></View>
          <Text style={styles.chevron}>↗</Text>
        </Pressable>
        <Pressable onPress={()=>navigation.navigate('Stats')} style={styles.secondaryAction}>
          <Text style={styles.secondaryIcon}>◈</Text>
          <View style={{flex:1}}><Text style={styles.secondaryName}>Rekordok</Text>
            <Text style={styles.secondaryDesc}>Fejlődési adatok</Text></View>
          <Text style={styles.chevron}>↗</Text>
        </Pressable>
      </View>
    </View>

    <SectionHeading eyebrow="THE CONSISTENCY ENGINE" title="Heti teljesítmény"/>
    <View style={[card,styles.weekCard]}>
      <View style={{flex:1,gap:9}}>
        <Text style={styles.weekEyebrow}>WEEKLY PROGRESS</Text>
        <Text style={styles.weekTitle}>{days>=weeklyGoal?'A küldetés teljesítve.':'Az erő a következetességből születik.'}</Text>
        <Text style={styles.weekSub}>{days>=weeklyGoal
          ?`+ ${WEEKLY_GOAL_BONUS} XP heti bónusz megszerezve`
          :`Még ${weeklyGoal-days} aktív nap a +${WEEKLY_GOAL_BONUS} XP-ig.`}</Text>
      </View>
      <Ring value={days} total={weeklyGoal}/>
    </View>
    {nextTrial&&<Pressable style={styles.trial} onPress={()=>navigation.navigate('Quests')}>
      <Text style={styles.trialIcon}>{nextTrial.emoji}</Text>
      <View style={{flex:1,gap:3}}><Text style={styles.trialEyebrow}>ELITE CHALLENGE</Text>
        <Text style={styles.trialTitle}>{nextTrial.title}</Text>
        <Text style={styles.trialDetail}>{nextTrial.current}/{nextTrial.target} · +{nextTrial.xp} XP</Text></View>
      <Text style={styles.trialChevron}>↗</Text>
    </Pressable>}
    {programStatus&&<Pressable style={[styles.trial,{borderColor:'#867052'}]} onPress={()=>navigation.navigate('Quests')}>
      <Text style={styles.trialIcon}>{programStatus.program.emoji}</Text>
      <View style={{flex:1}}><Text style={styles.trialEyebrow}>ACTIVE CAMPAIGN</Text>
        <Text style={styles.trialTitle}>{programStatus.program.name}</Text>
        <Text style={styles.trialDetail}>{programStatus.currentDay}. nap</Text></View>
      <Text style={styles.trialChevron}>↗</Text>
    </Pressable>}

    <SectionHeading eyebrow="TODAY'S OBJECTIVES" title="Mai küldetések"
      right={<Text style={styles.count}>{completed}/{quests.length}</Text>}/>
    <View style={[card,{paddingTop:5,paddingBottom:5}]}>
      {quests.map((q,i)=><Pressable onPress={()=>navigation.navigate('Quests')} key={q.id}
        style={[styles.mission,i>0&&{borderTopColor:colors.cardBorder,borderTopWidth:1}]}>
        <View style={[styles.tick,q.completed&&styles.tickDone]}><Text style={styles.tickIcon}>{q.completed?'✓':'◇'}</Text></View>
        <View style={{flex:1,gap:3}}>
          <Text style={[styles.missionTitle,q.completed&&{color:colors.textMuted}]} numberOfLines={2}>{q.title}</Text>
          <Text style={styles.missionMeta}>{q.category==='physical'?'PHYSICAL':q.category==='mental'?'MENTAL':'RECOVERY'}</Text>
        </View>
        <Text style={styles.missionXP}>+{q.xp} XP</Text>
      </Pressable>)}
    </View>
    {recent.length>0&&<>
      <SectionHeading eyebrow="LATEST ENTRIES" title="Friss aktivitás"/>
      <View style={[card,{gap:14}]}>{recent.map(a=><View style={styles.activity} key={a.id}>
        <Text style={{fontSize:20}}>{ACTIVITY_TYPES[a.type]?.emoji||'✦'}</Text>
        <View style={{flex:1}}><Text style={styles.activityTitle} numberOfLines={1}>{a.title}</Text>
          <Text style={styles.activitySub}>{a.duration} perc</Text></View>
        <Text style={styles.missionXP}>+{progress.xpById[a.id]||0} XP</Text>
      </View>)}</View>
    </>}
  </Screen>;
}
const styles=StyleSheet.create({
  worldEntry:{backgroundColor:'#1D223A',borderColor:'#68618C',gap:7,padding:20},
  worldTag:{color:colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.5},
  worldTitle:{color:colors.text,fontSize:20,fontWeight:'900'},
  worldCopy:{color:colors.textMuted,fontSize:12,lineHeight:19},
  streak:{backgroundColor:'#242322',borderRadius:13,borderColor:'#6E5D43',borderWidth:1,paddingVertical:8,paddingHorizontal:12,alignItems:'center',minWidth:78},
  streakFire:{fontSize:18,color:colors.gold,fontWeight:'900'},streakTiny:{color:colors.textMuted,fontSize:8,letterSpacing:1.1,fontWeight:'900',marginTop:2},
  warning:{backgroundColor:'#293041',borderColor:colors.gold,gap:6},
  warningTitle:{color:colors.gold,fontWeight:'900',fontSize:12},warningText:{color:colors.textSoft,fontSize:12},
  report:{backgroundColor:'#111726',borderWidth:1,borderColor:'#3D465E',borderRadius:20,padding:16,gap:14},
  reportEyebrow:{color:colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.7},
  statRow:{flexDirection:'row',alignItems:'center'},
  stat:{flex:1,gap:3,minWidth:0},
  statValue:{fontSize:24,color:colors.text,fontWeight:'900',letterSpacing:-.6},
  statLabel:{fontSize:9,color:colors.textMuted,fontWeight:'800',letterSpacing:.5},
  separator:{height:32,width:1,backgroundColor:'#394154',marginHorizontal:11},
  actionGroup:{gap:11},heroAction:{overflow:'hidden',borderRadius:24,borderWidth:1,borderColor:'#8577D7'},
  heroActionGradient:{padding:22,gap:9,minHeight:180},
  actionMark:{position:'absolute',right:2,top:2,opacity:.48},
  actionEyebrow:{color:colors.gold,fontWeight:'900',fontSize:10,letterSpacing:1.8},
  actionTitle:{color:'#FFFFFF',fontSize:22,fontWeight:'900',letterSpacing:-.5,marginTop:7},
  actionSubtitle:{color:'#DAD8FF',fontSize:12,lineHeight:18,maxWidth:'86%'},
  actionArrow:{backgroundColor:'rgba(255,255,255,.13)',borderColor:'rgba(255,255,255,.24)',borderWidth:1,
    borderRadius:9,paddingHorizontal:13,paddingVertical:9,alignSelf:'flex-start',marginTop:8},
  actionArrowText:{color:'white',fontSize:11,fontWeight:'900',letterSpacing:1.1},
  secondaryActions:{flexDirection:'row',gap:9},
  secondaryAction:{flex:1,borderWidth:1,borderColor:'#364158',borderRadius:18,backgroundColor:'#151C2D',
    paddingHorizontal:13,paddingVertical:15,gap:8,alignItems:'center',flexDirection:'row',minWidth:0},
  secondaryIcon:{fontSize:24,color:colors.gold},secondaryName:{color:colors.text,fontWeight:'900',fontSize:12},
  secondaryDesc:{color:colors.textMuted,fontSize:10,marginTop:3},chevron:{color:colors.gold,fontSize:19},
  weekCard:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:20},
  weekEyebrow:{color:colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.5},
  weekTitle:{color:colors.text,fontWeight:'900',fontSize:17,lineHeight:22},
  weekSub:{color:colors.textMuted,fontSize:12,lineHeight:18},
  ring:{width:93,height:93,alignItems:'center',justifyContent:'center'},
  ringNumber:{fontSize:24,color:colors.text,fontWeight:'900'},ringOf:{fontSize:11,color:colors.textMuted},
  trial:{borderColor:'#44436D',borderWidth:1,backgroundColor:'#141B30',borderRadius:18,
    padding:17,flexDirection:'row',alignItems:'center',gap:12},
  trialIcon:{fontSize:29},trialEyebrow:{color:colors.gold,fontSize:10,letterSpacing:1.2,fontWeight:'900'},
  trialTitle:{fontWeight:'900',color:colors.text,fontSize:14},
  trialDetail:{color:colors.textMuted,fontSize:11},trialChevron:{color:colors.gold,fontSize:22},
  count:{color:colors.gold,fontSize:12,fontWeight:'900'},
  mission:{flexDirection:'row',alignItems:'center',gap:11,paddingVertical:15},
  tick:{width:28,height:28,borderRadius:9,borderColor:'#646D83',borderWidth:1,alignItems:'center',justifyContent:'center'},
  tickDone:{backgroundColor:'#183B36',borderColor:colors.green},
  tickIcon:{color:colors.green,fontWeight:'900',fontSize:16},
  missionTitle:{fontSize:13,fontWeight:'800',color:colors.text},missionMeta:{fontSize:9,color:colors.textMuted,fontWeight:'900',letterSpacing:.7},
  missionXP:{fontSize:12,color:colors.gold,fontWeight:'900'},
  activity:{flexDirection:'row',alignItems:'center',gap:12},activityTitle:{fontSize:13,fontWeight:'800',color:colors.text},
  activitySub:{color:colors.textMuted,fontSize:11,marginTop:3}
});
