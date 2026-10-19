import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getClass, characterTitle } from '../game/characters';
import XPBar from './XPBar';
import { colors } from '../theme';

export default function CharacterCard({ character, progress }) {
  const cls = getClass(character.classId);
  const rank = progress.level >= 21 ? 'S-RANK' : progress.level >= 16 ? 'A-RANK' :
    progress.level >= 11 ? 'B-RANK' : progress.level >= 6 ? 'C-RANK' : 'D-RANK';

  return (
    <LinearGradient colors={['#2a1b5e', '#13132b']} style={[styles.card, { borderColor: cls.color + '66' }]}>
      <View style={styles.row}>
        <View style={[styles.avatar, { borderColor: cls.color }]}>
          <Text style={styles.avatarEmoji}>{cls.emoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{character.name}</Text>
          <Text style={[styles.title, { color: cls.color }]}>{characterTitle(character.classId, progress.level)}</Text>
          <Text style={styles.cls}>{cls.name} · {cls.anime}</Text>
          <Text style={styles.rank}>✦ {rank} · {progress.weeklyTrialsCompleted || 0} hőspróba teljesítve</Text>
        </View>
      </View>
      <XPBar xp={progress.xp} xpToNextLevel={progress.xpToNextLevel} level={progress.level} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 18, borderWidth: 1, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a1a'
  },
  avatarEmoji: { fontSize: 30 },
  info: { flex: 1 },
  name: { color: colors.text, fontSize: 22, fontWeight: '800' },
  title: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  cls: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  rank: { color: colors.gold, fontSize: 11, fontWeight: '800', marginTop: 5 }
});
