import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import CharacterCard from '../components/CharacterCard';
import { useGame } from '../game/GameContext';
import { ACTIVITY_TYPES } from '../game/gamification';
import { colors, card } from '../theme';

function StreakBadge({ streak, activeToday }) {
  return (
    <View style={[styles.streak, !activeToday && streak > 0 && styles.streakAtRisk]}>
      <Text style={styles.streakText}>🔥 {streak}</Text>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { state, progress, quests } = useGame();
  const doneQuests = quests.filter((q) => q.completed).length;
  const recent = [...state.activities].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  let streakHint;
  if (progress.activeToday) streakHint = `Ma már aktív voltál. Streak bónusz: ×${progress.nextStreakMultiplier}`;
  else if (progress.streak > 0) streakHint = `Naplózz ma valamit, különben elveszik a ${progress.streak} napos streak!`;
  else streakHint = 'Kezdj egy új streaket egy mai bejegyzéssel.';

  return (
    <Screen title="Anime Fitness" right={<StreakBadge streak={progress.streak} activeToday={progress.activeToday} />}>
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

      <Text style={[styles.hint, !progress.activeToday && progress.streak > 0 && { color: colors.gold }]}>{streakHint}</Text>

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
