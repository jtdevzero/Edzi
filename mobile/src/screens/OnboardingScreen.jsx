import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import { CLASSES } from '../game/characters';
import { useGame } from '../game/GameContext';
import { colors, card } from '../theme';

export default function OnboardingScreen() {
  const { createCharacter } = useGame();
  const [name, setName] = useState('');
  const [classId, setClassId] = useState(null);
  const canStart = name.trim().length > 0 && classId;

  return (
    <Screen title="Ébredj fel, harcos" subtitle="Válassz nevet és osztályt. Minden edzés, tanulás és napló XP-t ad.">
      <View style={card}>
        <Text style={styles.label}>Karakter neve</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="pl. Jozsi"
          placeholderTextColor={colors.textMuted}
          maxLength={24}
        />
      </View>

      <Text style={styles.section}>Osztály</Text>
      {CLASSES.map((c) => {
        const selected = c.id === classId;
        return (
          <Pressable
            key={c.id}
            onPress={() => setClassId(c.id)}
            style={[card, styles.classCard, selected && { borderColor: c.color, backgroundColor: c.color + '1f' }]}
          >
            <Text style={styles.emoji}>{c.emoji}</Text>
            <View style={styles.classText}>
              <Text style={styles.className}>{c.name} <Text style={styles.anime}>· {c.anime}</Text></Text>
              <Text style={styles.classDesc}>{c.description}</Text>
            </View>
          </Pressable>
        );
      })}

      <Pressable
        disabled={!canStart}
        onPress={() => createCharacter(name.trim(), classId)}
        style={[styles.button, !canStart && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>Kaland indítása</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textSoft, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: colors.input, color: colors.text, borderRadius: 12,
    paddingHorizontal: 14, height: 48, fontSize: 16
  },
  section: { color: colors.text, fontSize: 18, fontWeight: '700' },
  classCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emoji: { fontSize: 32 },
  classText: { flex: 1 },
  className: { color: colors.text, fontSize: 16, fontWeight: '700' },
  anime: { color: colors.textMuted, fontWeight: '400', fontSize: 13 },
  classDesc: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  button: { backgroundColor: colors.primary, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '800' }
});
