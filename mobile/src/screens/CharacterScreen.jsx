import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import CharacterCard from '../components/CharacterCard';
import StatsRadar from '../components/StatsRadar';
import { useGame } from '../game/GameContext';
import { getClass, LEVELS_PER_EVOLUTION } from '../game/characters';
import { confirm, notify } from '../utils/notify';
import { downloadBackup, pickBackupFile } from '../game/backup';
import { colors, card } from '../theme';

export default function CharacterScreen() {
  const { state, progress, resetAll, markBackedUp, importState } = useGame();
  const cls = getClass(state.character.classId);

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
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  muted: { color: colors.textMuted, fontSize: 12 },
  evoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  evoDot: { fontSize: 14 },
  evoTitle: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  evoLocked: { color: colors.textMuted },
  reset: { borderColor: colors.red, borderWidth: 1, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
  resetText: { color: colors.red, fontWeight: '700' },
  backup: { gap: 8 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondaryBtn: { borderColor: colors.primary, borderWidth: 1, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: colors.primarySoft, fontWeight: '700', fontSize: 15 }
});
