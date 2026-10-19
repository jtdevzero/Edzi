import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Linking } from 'react-native';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { ACTIVITY_TYPES, baseXP } from '../game/gamification';
import { WORKOUT_TEMPLATES, youtubeSearchUrl, sessionExercisesFromTemplate } from '../game/templates';
import { createSession } from '../game/session';
import { unlockAudio } from '../utils/device';
import Pomodoro from '../components/Pomodoro';
import { confirm } from '../utils/notify';
import { announceReward } from '../utils/rewards';
import { colors, card } from '../theme';

const EMPTY_FORM = { title: '', duration: '', intensity: 5, notes: '', templateId: null };

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

export default function LogScreen({ navigation }) {
  const { state, progress, logActivity, deleteActivity, startSession } = useGame();
  const [type, setType] = useState('workout');
  const [form, setForm] = useState(EMPTY_FORM);
  const [openTemplate, setOpenTemplate] = useState(null);

  const duration = parseInt(form.duration, 10);
  const valid = form.title.trim() && duration > 0 && duration <= 600;
  const previewXP = valid ? Math.round(baseXP(type, duration, form.intensity) * progress.nextStreakMultiplier) : null;
  const history = [...state.activities].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  function applyTemplate(t) {
    update({ title: t.name, duration: String(t.duration), intensity: t.intensity, templateId: t.id });
  }

  function startWorkout(template) {
    unlockAudio();
    startSession(createSession(template
      ? { title: template.name, templateId: template.id, exercises: sessionExercisesFromTemplate(template) }
      : { title: 'Saját edzés', exercises: [] }));
  }

  function submit() {
    if (!valid) return;
    const result = logActivity({
      type,
      title: form.title.trim(),
      duration,
      intensity: form.intensity,
      notes: form.notes.trim(),
      templateId: form.templateId
    });
    setForm(EMPTY_FORM);
    announceReward(result, {
      title: 'Szép munka, harcos!',
      message: result.evolved ? 'Új címet kaptál!' : `Bejegyzés mentve: ${form.title.trim()}`
    });
    navigation.navigate('Dashboard');
  }

  return (
    <Screen title="Naplózás" subtitle="Minden perc számít.">
      <View style={styles.tabs}>
        {Object.entries(ACTIVITY_TYPES).map(([key, t]) => (
          <Pressable key={key} onPress={() => { setType(key); setForm(EMPTY_FORM); }} style={[styles.tab, type === key && styles.tabActive]}>
            <Text style={[styles.tabText, type === key && styles.tabTextActive]}>{t.emoji} {t.label}</Text>
          </Pressable>
        ))}
      </View>

      {type === 'workout' && (
        <View style={[card, styles.gap, styles.sessionCard]}>
          <Text style={styles.sectionTitle}>⏱ Edzésmód</Text>
          <Text style={styles.muted}>Sorozatszámláló, pihenő időzítő, stopper és intervallum. A végén automatikusan naplóz, és rekordokat is számol.</Text>
          <Pressable onPress={() => startWorkout(null)} style={styles.sessionBtn}>
            <Text style={styles.sessionText}>▶ Üres edzés indítása</Text>
          </Pressable>
        </View>
      )}

      {type === 'study' && <Pomodoro onLogged={() => navigation.navigate('Dashboard')} />}

      {type === 'workout' && (
        <View style={[card, styles.gap]}>
          <Text style={styles.sectionTitle}>Anime edzéssablonok</Text>
          {WORKOUT_TEMPLATES.map((t) => {
            const open = openTemplate === t.id;
            return (
              <View key={t.id} style={[styles.template, form.templateId === t.id && styles.templateSelected]}>
                <Pressable onPress={() => setOpenTemplate(open ? null : t.id)} style={styles.templateHead}>
                  <View style={styles.flex}>
                    <Text style={styles.templateName}>{t.name}</Text>
                    <Text style={styles.muted}>{t.anime} · {t.duration} perc</Text>
                  </View>
                  <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
                </Pressable>
                {open && (
                  <View style={styles.gap}>
                    <Text style={styles.muted}>{t.description}</Text>
                    {t.exercises.map((e) => (
                      <View key={e.name} style={styles.exercise}>
                        <Text style={styles.exerciseText}>{e.name} <Text style={styles.muted}>{e.amount}</Text></Text>
                        <Pressable onPress={() => Linking.openURL(youtubeSearchUrl(e.search))} style={styles.videoBtn}>
                          <Text style={styles.videoText}>▶ Hogyan csináld</Text>
                        </Pressable>
                      </View>
                    ))}
                    <Pressable onPress={() => startWorkout(t)} style={styles.sessionBtn}>
                      <Text style={styles.sessionText}>▶ Edzésmódban</Text>
                    </Pressable>
                    <Pressable onPress={() => applyTemplate(t)} style={styles.useBtn}>
                      <Text style={styles.useText}>Már megcsináltam → kitöltés</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      <View style={[card, styles.gap]}>
        <Text style={styles.label}>Mit csináltál?</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={(title) => update({ title })}
          placeholder={type === 'workout' ? 'pl. Reggeli edzés' : type === 'study' ? 'pl. Angol szavak' : 'pl. Esti gondolatok'}
          placeholderTextColor={colors.textMuted}
          maxLength={60}
        />

        <Text style={styles.label}>Időtartam (perc)</Text>
        <TextInput
          style={styles.input}
          value={form.duration}
          onChangeText={(v) => update({ duration: v.replace(/[^0-9]/g, '') })}
          placeholder="30"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={3}
        />

        <Text style={styles.label}>Intenzitás: {form.intensity}/10</Text>
        <View style={styles.intensityRow}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <Pressable key={n} onPress={() => update({ intensity: n })} style={[styles.intensityBtn, n <= form.intensity && styles.intensityOn]}>
              <Text style={styles.intensityText}>{n}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Jegyzet (nem kötelező)</Text>
        <TextInput
          style={[styles.input, styles.notes]}
          value={form.notes}
          onChangeText={(notes) => update({ notes })}
          placeholder="Hogy ment?"
          placeholderTextColor={colors.textMuted}
          multiline
        />

        <Pressable disabled={!valid} onPress={submit} style={[styles.button, !valid && styles.disabled]}>
          <Text style={styles.buttonText}>{previewXP ? `Mentés · +${previewXP} XP` : 'Mentés'}</Text>
        </Pressable>
      </View>

      {history.length > 0 && (
        <View style={card}>
          <Text style={styles.sectionTitle}>Előzmények</Text>
          {history.map((a) => (
            <View key={a.id} style={styles.historyRow}>
              <View style={styles.flex}>
                <Text style={styles.historyTitle} numberOfLines={1}>{ACTIVITY_TYPES[a.type].emoji} {a.title}</Text>
                <Text style={styles.muted}>{formatDate(a.date)} · {a.duration} perc · {a.intensity}/10 · +{progress.xpById[a.id]} XP</Text>
              </View>
              <Pressable
                hitSlop={8}
                onPress={() => confirm('Törlés', `Biztosan törlöd: „${a.title}”? Az XP is levonódik.`, () => deleteActivity(a.id))}
                style={styles.deleteBtn}
              >
                <Text style={styles.deleteText}>🗑</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: 10 },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 14, padding: 4, gap: 4 },
  tab: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#fff' },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  template: { backgroundColor: colors.input, borderRadius: 12, padding: 12, gap: 10, borderWidth: 1, borderColor: 'transparent' },
  templateSelected: { borderColor: colors.primary },
  templateHead: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  templateName: { color: colors.text, fontWeight: '700', fontSize: 15 },
  chevron: { color: colors.textMuted, fontSize: 12, paddingLeft: 8 },
  muted: { color: colors.textMuted, fontSize: 12 },
  exercise: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  exerciseText: { color: colors.text, fontSize: 14, flex: 1 },
  videoBtn: { backgroundColor: '#3f0d12', borderRadius: 8, paddingHorizontal: 10, height: 36, justifyContent: 'center' },
  videoText: { color: '#fca5a5', fontSize: 12, fontWeight: '700' },
  sessionCard: { borderColor: colors.green },
  sessionBtn: { backgroundColor: colors.green, borderRadius: 10, height: 48, alignItems: 'center', justifyContent: 'center' },
  sessionText: { color: '#052e16', fontWeight: '800', fontSize: 15 },
  useBtn: { borderColor: colors.primary, borderWidth: 1, borderRadius: 10, height: 44, alignItems: 'center', justifyContent: 'center' },
  useText: { color: colors.primarySoft, fontWeight: '700' },
  label: { color: colors.textSoft, fontSize: 13, fontWeight: '600' },
  input: { backgroundColor: colors.input, color: colors.text, borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 16 },
  notes: { height: 88, paddingTop: 12, textAlignVertical: 'top' },
  intensityRow: { flexDirection: 'row', gap: 4 },
  intensityBtn: { flex: 1, height: 44, borderRadius: 8, backgroundColor: colors.input, alignItems: 'center', justifyContent: 'center' },
  intensityOn: { backgroundColor: colors.primary },
  intensityText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  button: { backgroundColor: colors.primary, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopColor: colors.cardBorder, borderTopWidth: 1, gap: 8 },
  historyTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  deleteBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  deleteText: { fontSize: 18 }
});
