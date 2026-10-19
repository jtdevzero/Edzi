import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import CharacterCard from '../components/CharacterCard';
import { useGame } from '../game/GameContext';
import { ACTIVITY_TYPES, WEEKLY_GOAL_BONUS } from '../game/gamification';
import { colors, card } from '../theme';

const BACKUP_REMINDER_DAYS = 7;

function StreakBadge({ streak, atRisk, restAvailable }) {
  return (
    <View style={[styles.streak, atRisk && styles.streakAtRisk]}>
      <Text style={styles.streakText}>🔥 {streak}{restAvailable ? '  🛡️' : ''}</Text>
    </View>
  );
}

function needsBackup(state) {
  if (state.activities.length < 3) return false;
  if (!state.lastBackupAt) return true;
  return Date.now() - new Date(state.lastBackupAt).getTime() > BACKUP_REMINDER_DAYS * 86400000;
}

export default function DashboardScreen({ navigation }) {
  const { state, progress, quests, programStatus } = useGame();
  const doneQuests = quests.filter((q) => q.completed).length;
  const recent = [...state.activities].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const restAvailable = !progress.restUsedThisWeek;

  let streakHint;
  if (progress.activeToday) {
    streakHint = `Ma már aktív voltál. Streak bónusz: ×${progress.nextStreakMultiplier}`;
  } else if (progress.restPending) {
    streakHint = `🛡️ A tegnap pihenőnap volt, a streak megmaradt. Ma viszont naplózz, különben elveszik!`;
  } else if (progress.streak > 0) {
    streakHint = restAvailable
      ? `Ma még nem naplóztál. Ha kihagyod, a 🛡️ pihenőnap megvédi a ${progress.streak} napos streaket.`
      : `Naplózz ma valamit, különben elveszik a ${progress.streak} napos streak! (A heti pihenőnapot már felhasználtad.)`;
  } else {
    streakHint = 'Kezdj egy új streaket egy mai bejegyzéssel.';
  }
  const atRisk = !progress.activeToday && progress.streak > 0 && (progress.restPending || !restAvailable);

  return (
    <Screen title="Edzi" right={<StreakBadge streak={progress.streak} atRisk={atRisk} restAvailable={restAvailable} />}>
      {needsBackup(state) && (
        <Pressable style={[card, styles.backupNag]} onPress={() => navigation.navigate('Character')}>
          <Text style={styles.backupText}>💾 Rég mentettél. Az adataid csak ebben a böngészőben vannak. Koppints ide a mentéshez.</Text>
        </Pressable>
      )}

      <CharacterCard character={state.character} progress={progress} />

      <View style={styles.statsRow}>
        <View style={[card, styles.stat]}>
          <Text style={styles.statValue}>{progress.totalXP}</Text>
          <Text style={styles.statLabel}>Összes XP</Text>
        </View>
        <View style={[card, styles.stat]}>
          <Text style={styles.statValue}>{doneQuests}/{quests.length}</Text>
          <Text style={styles.statLabel}>Mai questek</Text>
        </View>
        <View style={[card, styles.stat]}>
          <Text style={styles.statValue}>{state.activities.length}</Text>
          <Text style={styles.statLabel}>Bejegyzés</Text>
        </View>
      </View>

      <Text style={[styles.hint, atRisk && { color: colors.gold }]}>{streakHint}</Text>

      <View style={[card, styles.goal]}>
        <View style={styles.goalHead}>
          <Text style={styles.sectionTitle}>🎯 Heti cél</Text>
          <Text style={styles.goalCount}>{Math.min(progress.thisWeekActiveDays, progress.weeklyGoal)}/{progress.weeklyGoal} aktív nap</Text>
        </View>
        <View style={styles.goalDots}>
          {Array.from({ length: progress.weeklyGoal }, (_, i) => (
            <View key={i} style={[styles.goalDot, i < progress.thisWeekActiveDays && styles.goalDotOn]} />
          ))}
        </View>
        <Text style={styles.goalHint}>
          {progress.thisWeekActiveDays >= progress.weeklyGoal
            ? `✅ Heti cél teljesítve, +${WEEKLY_GOAL_BONUS} XP bónusz!`
            : `Még ${progress.weeklyGoal - progress.thisWeekActiveDays} aktív nap a +${WEEKLY_GOAL_BONUS} XP bónuszig.`}
        </Text>
      </View>

      {programStatus && (
        <Pressable style={[card, styles.programLink]} onPress={() => navigation.navigate('Quests')}>
          <Text style={styles.programText}>
            {programStatus.program.emoji} {programStatus.program.name} · {programStatus.currentDay}. nap
            {programStatus.doneToday ? '  ✅' : `: ${programStatus.today.title}`}
          </Text>
        </Pressable>
      )}

      <Pressable style={styles.button} onPress={() => navigation.navigate('Log')}>
        <Text style={styles.buttonText}>➕ Új bejegyzés</Text>
      </Pressable>

      <Pressable style={[card, styles.questLink]} onPress={() => navigation.navigate('Quests')}>
        <Text style={styles.sectionTitle}>Mai questek</Text>
        {quests.map((q) => (
          <Text key={q.id} style={[styles.questLine, q.completed && styles.questDone]}>
            {q.completed ? '✅' : '⬜'} {q.title} <Text style={styles.xp}>+{q.xp} XP</Text>
          </Text>
        ))}
      </Pressable>

      {recent.length > 0 && (
        <View style={card}>
          <Text style={styles.sectionTitle}>Legutóbbi bejegyzések</Text>
          {recent.map((a) => (
            <View key={a.id} style={styles.recentRow}>
              <Text style={styles.recentTitle} numberOfLines={1}>
                {ACTIVITY_TYPES[a.type].emoji} {a.title}
              </Text>
              <Text style={styles.xp}>+{progress.xpById[a.id]} XP</Text>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  streak: { backgroundColor: '#3b1d0a', borderColor: colors.gold, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  streakAtRisk: { borderStyle: 'dashed' },
  streakText: { color: colors.gold, fontWeight: '800', fontSize: 16 },
  backupNag: { borderColor: colors.blue, paddingVertical: 12 },
  goal: { gap: 10 },
  goalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalCount: { color: colors.primarySoft, fontWeight: '700', fontSize: 13 },
  goalDots: { flexDirection: 'row', gap: 6 },
  goalDot: { flex: 1, height: 10, borderRadius: 5, backgroundColor: '#1e1b4b' },
  goalDotOn: { backgroundColor: colors.green },
  goalHint: { color: colors.textMuted, fontSize: 12 },
  programLink: { borderColor: colors.gold, paddingVertical: 12 },
  programText: { color: colors.gold, fontWeight: '700', fontSize: 14 },
  backupText: { color: '#93c5fd', fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 6 },
  statValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2, textAlign: 'center' },
  hint: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  button: { backgroundColor: colors.primary, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  questLink: { gap: 8 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  questLine: { color: colors.text, fontSize: 14 },
  questDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  xp: { color: colors.primarySoft, fontWeight: '700', fontSize: 13 },
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: 8 },
  recentTitle: { color: colors.text, fontSize: 14, flex: 1 }
});
