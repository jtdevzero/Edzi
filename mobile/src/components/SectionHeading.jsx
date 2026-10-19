import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';
export default function SectionHeading({ eyebrow, title, right }) {
  return <View style={styles.row}>
    <View style={styles.copy}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
    </View>
    {right}
  </View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  copy: { gap: 5, flex: 1 },
  eyebrow: { fontSize: 10, letterSpacing: 2.0, color: colors.cyan, fontWeight: '900' },
  title: { fontSize: 20, fontWeight: '900', letterSpacing: -.5, color: colors.text }
});
