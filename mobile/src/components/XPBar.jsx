import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

export default function XPBar({ xp, xpToNextLevel, level }) {
  const progress = useRef(new Animated.Value(0)).current;
  const pct = Math.min(Math.max(xp / Math.max(1, xpToNextLevel), 0), 1);
  useEffect(() => {
    Animated.timing(progress, { toValue: pct, duration: 650, useNativeDriver: false }).start();
  }, [pct, progress]);
  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.root} accessibilityLabel={`Szint ${level}, ${xp} a ${xpToNextLevel} XP-ből`}>
      <View style={styles.labels}>
        <Text style={styles.level}>LEVEL {String(level).padStart(2, '0')}</Text>
        <Text style={styles.xp}>{xp} <Text style={styles.xpMuted}>/ {xpToNextLevel} XP</Text></Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]}>
          <LinearGradient colors={[colors.gold, '#DEAC6B', colors.cyan]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { gap: 9 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  level: { color: colors.cyan, fontSize: 11, fontWeight: '900', letterSpacing: 1.6 },
  xp: { color: colors.text, fontSize: 12, fontWeight: '800' },
  xpMuted: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  track: { height: 9, backgroundColor: colors.track, borderRadius: 20, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 20 }
});
