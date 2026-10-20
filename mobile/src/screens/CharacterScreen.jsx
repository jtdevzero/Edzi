import React, {useState} from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import SectionHeading from '../components/SectionHeading';
import PwaInstall from '../components/PwaInstall';
import HunterEvolution from '../components/HunterEvolution';
import CloudBackup from '../components/CloudBackup';
import AppModeSwitcher from '../components/AppModeSwitcher';
import CharacterCard from '../components/CharacterCard';
import StatsRadar from '../components/StatsRadar';
import { useGame } from '../game/GameContext';
import { getClass, LEVELS_PER_EVOLUTION } from '../game/characters';
import { confirm, notify } from '../utils/notify';
import { downloadBackup, pickBackupFile } from '../game/backup';
import { colors, card } from '../theme';

export default function CharacterScreen() {
  const { state, progress, achievements, resetAll, markBackedUp, importState, setWeeklyGoal } = useGame();
  const [showAllBadges,setShowAllBadges]=useState(false);
  const cls = getClass(state.character.classId);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const sortedAchievements = [...achievements].sort(
    (a, b) => Number(b.unlocked) - Number(a.unlocked) || b.current / b.target - a.current / a.target
  );

  async function handleExport() {
    try {
      if (await downloadBackup(state)) markBackedUp();
    } catch (err) {
      notify('Nem sikerült a mentés', err.message);
    }
  }

  async function handleImport() {
    try {
      const imported = await pickBackupFile();
      if (!imported) return;
      confirm(
        'Visszatöltés',
        `A mentésben ${imported.activities.length} bejegyzés van. A mostani adataid felülíródnak. Folytatod?`,
        () => {
          importState(imported);
          notify('Kész', 'Az adatok visszatöltve.');
        }
      );
    } catch (err) {
      notify('Nem sikerült a visszatöltés', err.message);
    }
  }

  return (
    <Screen title="Karakter" subtitle="A történeted a szintjeidben él tovább." eyebrow="CLASSIFIED · HUNTER DOSSIER">
      <AppModeSwitcher />
      <CharacterCard character={state.character} progress={progress} />
      <SectionHeading eyebrow="UNLOCKED STYLES" title="Hunter Evolution" />
      <HunterEvolution />

      <SectionHeading eyebrow="HUNTER ATTRIBUTES" title="Tulajdonságok" />
      <View style={[card, styles.radarPanel]}>
        <Text style={styles.panelEyebrow}>ATTRIBUTES / POWER SOURCE</Text>
        <Text style={styles.sectionTitle}>Erőprofil</Text>
        <Text style={styles.muted}>Edzés → erő, állóképesség (7+ intenzitásnál gyorsaság is) · Tanulás → intelligencia · Napló → akaraterő</Text>
        <StatsRadar attributes={progress.attributes} color={cls.color} />
      </View>

      <SectionHeading eyebrow="TROPHY ROOM" title="Megszerzett jelvények"
        right={<Text style={styles.badgeCount}>{unlockedCount}/{achievements.length}</Text>} />
      <View style={[card,styles.trophyPanel]}>
        <View style={styles.rowBetween}>
          <View><Text style={styles.panelEyebrow}>ACHIEVEMENT ARCHIVE</Text>
            <Text style={styles.sectionTitle}>{unlockedCount} feloldott jelvény</Text></View>
          <Text style={styles.badgeCount}>{Math.round(unlockedCount / Math.max(1,achievements.length)*100)}%</Text>
        </View>
        <View style={styles.badgeGrid}>
          {(showAllBadges ? sortedAchievements : sortedAchievements.slice(0,6)).map((a) => (
            <View key={a.id} style={[styles.badgeCell, a.unlocked && styles.badgeUnlocked]}>
              <Text style={[styles.badgeEmoji, !a.unlocked && styles.badgeLockedEmoji]}>{a.emoji}</Text>
              <Text style={[styles.badgeTitle, !a.unlocked && styles.evoLocked]} numberOfLines={2}>{a.title}</Text>
              {a.unlocked ? (
                <Text style={styles.badgeDesc} numberOfLines={2}>{a.description}</Text>
              ) : (
                <>
                  <Text style={styles.badgeDesc} numberOfLines={2}>{a.description}</Text>
                  {a.target > 1 && (
                    <View style={styles.badgeTrack}>
                      <View style={[styles.badgeFill, { width: `${(a.current / a.target) * 100}%` }]} />
                    </View>
                  )}
                </>
              )}
            </View>
          ))}
        </View>
        {sortedAchievements.length>6&&<Pressable style={styles.moreBadges} onPress={()=>setShowAllBadges(v=>!v)}
          accessibilityRole="button">
          <Text style={styles.moreText}>{showAllBadges?'Kevesebb jelvény ↑':'Összes jelvény megtekintése ↗'}</Text>
        </Pressable>}
      </View>

      <View style={card}>
        <Text style={styles.sectionTitle}>🎯 Heti cél</Text>
        <Text style={styles.muted}>Hány napon akarsz aktív lenni hetente? A változás ettől a héttől érvényes.</Text>
        <View style={styles.goalRow}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <Pressable
              key={n}
              onPress={() => setWeeklyGoal(n)}
              style={[styles.goalBtn, n === progress.weeklyGoal && styles.goalBtnOn]}
            >
              <Text style={styles.goalBtnText}>{n}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <SectionHeading eyebrow="YOUR DESTINY" title="Evolúciós útvonal"/>
      <View style={[card,styles.evoPanel]}>
        <Text style={styles.panelEyebrow}>CLASS ASCENSION / ${cls.name.toLocaleUpperCase('hu-HU')}</Text>
        <Text style={styles.sectionTitle}>A következő forma felé</Text>
        <Text style={styles.muted}>Minden {LEVELS_PER_EVOLUTION}. szinten új címet kapsz.</Text>
        {cls.titles.map((title, i) => {
          const reached = i <= progress.evolutionStage;
          return (
            <View key={title} style={styles.evoRow}>
              <View style={[styles.evoEmblem,reached&&styles.evoEmblemOn]}><Text style={{color:reached?colors.gold:colors.textMuted}}>{reached?'◆':'◇'}</Text></View>
              <View style={{flex:1,gap:4}}><Text style={[styles.evoTitle,!reached&&styles.evoLocked]}>{title}</Text>
                <Text style={styles.evoLevel}>LEVEL {String(i * LEVELS_PER_EVOLUTION + 1).padStart(2,'0')}</Text></View>
              <Text style={styles.evoState}>{reached?'FELOLDVA':'ZÁROLVA'}</Text>
            </View>
          );
        })}
      </View>

      <PwaInstall />
      <SectionHeading eyebrow="OPTIONAL / PRIVATE VAULT" title="Felhőmentés" />
      <CloudBackup />
      <View style={[card, styles.backup]}>
        <Text style={styles.sectionTitle}>💾 Adatmentés</Text>
        <Text style={styles.muted}>
          Az adataid csak ebben a böngészőben vannak. Mentsd le őket fájlba (pl. iCloud Drive-ra), és ha új telefonod lesz vagy törlöd a Safari adatait, vissza tudod tölteni.
        </Text>
        <Text style={styles.muted}>
          Utolsó mentés: {state.lastBackupAt ? new Date(state.lastBackupAt).toLocaleDateString('hu-HU') : 'még nem volt'}
        </Text>
        <Pressable onPress={handleExport} style={styles.primaryBtn}>
          <Text style={styles.primaryText}>Mentés fájlba</Text>
        </Pressable>
        <Pressable onPress={handleImport} style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Visszatöltés fájlból</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => confirm('Újrakezdés', 'Minden adat (karakter, XP, előzmények) törlődik erről az eszközről. Biztos?', resetAll)}
        style={styles.reset}
      >
        <Text style={styles.resetText}>Újrakezdés</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  radarPanel:{borderColor:'#4F526F',backgroundColor:'#11192A',gap:7},
  trophyPanel:{gap:17},
  evoPanel:{gap:11},
  panelEyebrow:{color:colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.8,marginBottom:7},
  moreBadges:{alignSelf:'stretch',borderWidth:1,borderColor:'#615782',borderRadius:12,padding:14,alignItems:'center'},
  moreText:{color:colors.gold,fontSize:12,fontWeight:'900'},
  evoEmblem:{width:33,height:33,borderRadius:10,backgroundColor:'#1C2437',borderWidth:1,borderColor:'#384255',
    alignItems:'center',justifyContent:'center'},
  evoEmblemOn:{backgroundColor:'#292A31',borderColor:colors.gold},
  evoLevel:{fontSize:9,fontWeight:'900',letterSpacing:1.2,color:colors.textMuted},
  evoState:{fontSize:9,fontWeight:'900',color:colors.gold},
  badgeCount: { color: colors.gold, fontWeight: '900', fontSize: 17 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginBottom: 7 },
  muted: { color: colors.textMuted, fontSize: 12 },
  evoRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 11, borderBottomColor: '#303A4D', borderBottomWidth: 1 },
  evoDot: { fontSize: 14 },
  evoTitle: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  evoLocked: { color: colors.textMuted },
  reset: { borderColor: colors.red, borderWidth: 1, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
  resetText: { color: colors.red, fontWeight: '700' },
  backup: { gap: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  badgeCell: {
    width: '31%', flexGrow: 1, backgroundColor: colors.input, borderRadius: 16, padding: 12,
    alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.cardBorder
  },
  badgeUnlocked: { borderColor: '#A78D64', backgroundColor: '#292721' },
  badgeEmoji: { fontSize: 26 },
  badgeLockedEmoji: { opacity: 0.25 },
  badgeTitle: { color: colors.text, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  badgeDesc: { color: colors.textMuted, fontSize: 10, textAlign: 'center' },
  badgeTrack: { alignSelf: 'stretch', height: 4, backgroundColor: '#1e1b4b', borderRadius: 2, overflow: 'hidden', marginTop: 2 },
  badgeFill: { height: '100%', backgroundColor: colors.primarySoft },
  goalRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  goalBtn: { flex: 1, height: 44, borderRadius: 10, backgroundColor: colors.input, alignItems: 'center', justifyContent: 'center' },
  goalBtnOn: { backgroundColor: '#4C4275', borderColor: colors.gold, borderWidth: 1 },
  goalBtnText: { color: colors.text, fontWeight: '700' },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondaryBtn: { borderColor: colors.primary, borderWidth: 1, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: colors.primarySoft, fontWeight: '700', fontSize: 15 }
});
