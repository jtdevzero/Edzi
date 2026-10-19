import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, type } from '../theme';

export default function Screen({ title, subtitle, right, children, eyebrow = 'EDZI // ASCENSION' }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#131D3B', colors.bg, colors.bg]} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View pointerEvents="none" style={styles.topAura} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {title ? (
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <Text style={styles.title} accessibilityRole="header">{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {right}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  topAura: { position: 'absolute', width: 280, height: 280, borderRadius: 140, right: -145, top: -145, backgroundColor: '#29366A', opacity: .24 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, gap: 18, width: '100%', maxWidth: 640, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 2 },
  headerText: { flex: 1, gap: 5 },
  eyebrow: type.eyebrow,
  title: type.h1,
  subtitle: { ...type.body, fontSize: 13, lineHeight: 19 }
});
