import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { CATEGORY_LABELS } from '../game/quests';
import { notify } from '../utils/notify';
import { colors, card } from '../theme';

const CATEGORY_COLORS = { physical: colors.red, mental: colors.blue, recovery: colors.green };

export default function QuestsScreen() {
  const { quests, completeQuest } = useGame();
  const allDone = quests.every((q) => q.completed);

  function complete(q) {
    const result = completeQuest(q.id);
    if (!result) return;
    notify(result.leveledUp ? `⬆️ SZINTLÉPÉS! +${result.xpGained} XP` : `+${result.xpGained} XP`, `Quest teljesítve: ${q.title}`);
  }

  return (
    <Screen title="Napi questek" subtitle="Minden nap 3 új quest. Éjfélkor frissülnek.">
      {allDone && (
        <View style={[card, styles.celebrate]}>
          <Text style={styles.celebrateText}>🏆 Minden mai quest kész! Holnap újak jönnek.</Text>
        </View>
      )}
      {quests.map((q) => (
        <View key={q.id} style={[card, styles.quest, q.completed && styles.questDone]}>
          <View style={styles.badges}>
            <Text style={[styles.badge, { color: CATEGORY_COLORS[q.category], borderColor: CATEGORY_COLORS[q.category] }]}>
              {CATEGORY_LABELS[q.category]}
            </Text>
            <Text style={styles.xp}>+{q.xp} XP</Text>
          </View>
          <Text style={styles.title}>{q.title}</Text>
          <Text style={styles.desc}>{q.description}</Text>
          <Pressable disabled={q.completed} onPress={() => complete(q)} style={[styles.button, q.completed && styles.buttonDone]}>
            <Text style={styles.buttonText}>{q.completed ? '✅ Teljesítve' : 'Teljesítettem'}</Text>
          </Pressable>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  celebrate: { borderColor: colors.gold, alignItems: 'center' },
  celebrateText: { color: colors.gold, fontWeight: '700', fontSize: 15, textAlign: 'center' },
  quest: { gap: 8 },
  questDone: { opacity: 0.6 },
  badges: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, fontWeight: '700', overflow: 'hidden' },
  xp: { color: colors.primarySoft, fontWeight: '800', fontSize: 14 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  desc: { color: colors.textMuted, fontSize: 14 },
  button: { backgroundColor: colors.primary, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  buttonDone: { backgroundColor: '#14532d' },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 }
});
