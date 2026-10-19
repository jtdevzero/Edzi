import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import CharacterCard from '../components/CharacterCard';
import StatsRadar from '../components/StatsRadar';
import { useGame } from '../game/GameContext';
import { getClass, LEVELS_PER_EVOLUTION } from '../game/characters';
import { confirm } from '../utils/notify';
import { colors, card } from '../theme';

export default function CharacterScreen() {
  const { state, progress, resetAll } = useGame();
  const cls = getClass(state.character.classId);

  return (
    <Screen title="Karakter">
      <CharacterCard character={state.character} progress={progress} />

      <View style={card}>
        <Text style={styles.sectionTitle}>Statok</Text>
        <Text style={styles.muted}>Edzés → erő, állóképesség (7+ intenzitásnál gyorsaság is) · Tanulás → intelligencia · Napló → akaraterő</Text>
        <StatsRadar attributes={progress.attributes} color={cls.color} />
      </View>

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

      <Pressable
        onPress={() => confirm('Újrakezdés', 'Minden adat (karakter, XP, előzmények) törlődik erről az eszközről. Biztos?', resetAll)}
        style={styles.reset}
      >
        <Text style={styles.resetText}>Újrakezdés</Text>
      </Pressable>
      <Text style={styles.footnote}>Az adataid csak ezen az eszközön, ebben a böngészőben tárolódnak.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  muted: { color: colors.textMuted, fontSize: 12 },
  evoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  evoDot: { fontSize: 14 },
  evoTitle: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  evoLocked: { color: colors.textMuted },
  reset: { borderColor: colors.red, borderWidth: 1, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
  resetText: { color: colors.red, fontWeight: '700' },
  footnote: { color: colors.textMuted, fontSize: 12, textAlign: 'center' }
});
