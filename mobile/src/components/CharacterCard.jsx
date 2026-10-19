import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { getClass, characterTitle } from '../game/characters';
import XPBar from './XPBar';
import { colors } from '../theme';

function Crest({ emoji, color }) {
  return (
    <View style={styles.crest}>
      <Svg width={108} height={108} viewBox="0 0 108 108" style={StyleSheet.absoluteFill} pointerEvents="none">
        <Circle cx="54" cy="54" r="48" fill="none" stroke={color} strokeWidth="1" strokeOpacity=".35" strokeDasharray="3 5" />
        <Circle cx="54" cy="54" r="40" fill="#111D39" stroke={color} strokeWidth="2" strokeOpacity=".9" />
        <Path d="M54 5 L58 15 L54 19 L50 15 Z M54 89 L58 93 L54 103 L50 93 Z" fill={colors.cyan} />
      </Svg>
      <Text style={styles.crestEmoji}>{emoji}</Text>
    </View>
  );
}
export default function CharacterCard({ character, progress }) {
  const cls = getClass(character.classId);
  const rank = progress.level >= 21 ? 'S' : progress.level >= 16 ? 'A' :
    progress.level >= 11 ? 'B' : progress.level >= 6 ? 'C' : 'D';
  const appear = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(appear, { toValue: 1, duration: 480, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: appear, transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
      <LinearGradient colors={['#242557', '#151C3A', '#0D152B']} style={styles.card}>
        <View style={styles.accentRail} pointerEvents="none" />
        <View style={styles.cardTop}>
          <Text style={styles.cardLabel}>◈  HUNTER PROFILE</Text>
          <View style={styles.rankPill}><Text style={styles.rankText}>{rank} — RANK</Text></View>
        </View>
        <View style={styles.main}>
          <Crest emoji={cls.emoji} color={cls.color || colors.primarySoft} />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>{character.name}</Text>
            <Text style={styles.title}>{characterTitle(character.classId, progress.level)}</Text>
            <Text style={styles.cls}>{cls.name}</Text>
            <View style={styles.detail}><Text style={styles.detailText}>{progress.weeklyTrialsCompleted || 0} heti hőspróba</Text></View>
          </View>
        </View>
        <View style={styles.divider} />
        <XPBar xp={progress.xp} xpToNextLevel={progress.xpToNextLevel} level={progress.level} />
      </LinearGradient>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: '#5159A6', borderRadius: 27, padding: 18, gap: 16, overflow: 'hidden' },
  accentRail: { position: 'absolute', top: 0, left: 24, width: 115, height: 2, backgroundColor: colors.cyan },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLabel: { color: colors.cyan, letterSpacing: 1.9, fontSize: 10, fontWeight: '900' },
  rankPill: { backgroundColor: '#28294E', borderColor: colors.gold, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999 },
  rankText: { color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  main: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  crest: { width: 108, height: 108, alignItems: 'center', justifyContent: 'center' },
  crestEmoji: { fontSize: 45 },
  info: { flex: 1, gap: 3 },
  name: { color: colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -.7 },
  title: { color: colors.primarySoft, fontSize: 13, fontWeight: '800' },
  cls: { color: colors.textMuted, fontSize: 12 },
  detail: { alignSelf: 'flex-start', marginTop: 7, backgroundColor: '#132C3B', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  detailText: { color: colors.cyan, fontSize: 10, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#3C4676' }
});
