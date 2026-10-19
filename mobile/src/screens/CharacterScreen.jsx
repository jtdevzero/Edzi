import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import SectionHeading from '../components/SectionHeading';
import PwaInstall from '../components/PwaInstall';
import CharacterCard from '../components/CharacterCard';
import StatsRadar from '../components/StatsRadar';
import { useGame } from '../game/GameContext';
import { getClass, LEVELS_PER_EVOLUTION } from '../game/characters';
import { confirm, notify } from '../utils/notify';
import { downloadBackup, pickBackupFile } from '../game/backup';
import { colors, card } from '../theme';

export default function CharacterScreen() {
  const { state, progress, achievements, resetAll, markBackedUp, importState, setWeeklyGoal } = useGame();
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
    <Screen title="Karakter" subtitle="Egyetlen edzés sem vész el a történetedből." eyebrow="HUNTER PROFILE / ASCENSION">
      <CharacterCard character={state.character} progress={progress} />

      <SectionHeading eyebrow="HUNTER ATTRIBUTES" title="Tulajdonságok" />
      <View style={card}>
        <Text style={styles.sectionTitle}>Statok</Text>
        <Text style={styles.muted}>Edzés → erő, állóképesség (7+ intenzitásnál gyorsaság is) · Tanulás → intelligencia · Napló → akaraterő</Text>
        <StatsRadar attributes={progress.attributes} color={cls.color} />
      </View>

      <SectionHeading eyebrow="TROPHY ROOM" title="Megszerzett jelvények"
        right={<Text style={styles.badgeCount}>{unlockedCount}/{achievements.length}</Text>} />
      <View style={card}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>🏅 Jelvények</Text>
          <Text style={styles.muted}>{unlockedCount}/{achievements.length}</Text>
        </View>
        <View style={styles.badgeGrid}>
          {sortedAchievements.map((a) => (
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
      <View style={card}>
        <Text style={styles.sectionTitle}>Evolúció</Text>
        <Text style={styles.muted}>Minden {LEVELS_PER_EVOLUTION}. szinten új címet kapsz.</Text>
        {cls.titles.map((title, i) => {
          const reached = i <= progress.evolutionStage;
          return (
            <View key={title} style={styles.evoRow}>
              <Text style={[styles.evoDot, { color: reached ? cls.color : colors.cardBorder }]}>●</Text>
              <Text style={[styles.evoTitle, !reached && styles.evoLocked]}>{title}</Text>
              <Text style={styles.muted}>{i === 0 ? 'Szint 1' : `Szint ${i * LEVELS_PER_EVOLUTION + 1}`}</Text>
            </View>
          );
        })}
      </View>

      <PwaInstall />
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
  badgeCount: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginBottom: 7 },
  muted: { color: colors.textMuted, fontSize: 12 },
  evoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
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
  badgeUnlocked: { borderColor: colors.gold, backgroundColor: '#382F28' },
  badgeEmoji: { fontSize: 26 },
  badgeLockedEmoji: { opacity: 0.25 },
  badgeTitle: { color: colors.text, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  badgeDesc: { color: colors.textMuted, fontSize: 10, textAlign: 'center' },
  badgeTrack: { alignSelf: 'stretch', height: 4, backgroundColor: '#1e1b4b', borderRadius: 2, overflow: 'hidden', marginTop: 2 },
  badgeFill: { height: '100%', backgroundColor: colors.primarySoft },
  goalRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  goalBtn: { flex: 1, height: 44, borderRadius: 10, backgroundColor: colors.input, alignItems: 'center', justifyContent: 'center' },
  goalBtnOn: { backgroundColor: colors.green },
  goalBtnText: { color: colors.text, fontWeight: '700' },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondaryBtn: { borderColor: colors.primary, borderWidth: 1, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: colors.primarySoft, fontWeight: '700', fontSize: 15 }
});
