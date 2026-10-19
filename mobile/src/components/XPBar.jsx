import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

export default function XPBar({ xp, xpToNextLevel, level }) {
  const progress = useRef(new Animated.Value(0)).current;
  const pct = Math.min(xp / xpToNextLevel, 1);

  useEffect(() => {
    Animated.spring(progress, { toValue: pct, useNativeDriver: false, tension: 40, friction: 8 }).start();
  }, [pct]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View>
      <View style={styles.labels}>
        <Text style={styles.level}>Szint {level}</Text>
        <Text style={styles.xp}>{xp} / {xpToNextLevel} XP</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]}>
          <LinearGradient
            colors={[colors.primary, colors.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  level: { color: colors.text, fontSize: 14, fontWeight: '700' },
  xp: { color: colors.primarySoft, fontSize: 13, fontWeight: '600' },
  track: { height: 12, backgroundColor: '#1e1b4b', borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6, overflow: 'hidden' }
});
