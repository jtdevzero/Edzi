import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import SectionHeading from '../components/SectionHeading';
import { View, Text, TextInput, Pressable, StyleSheet, Linking } from 'react-native';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { ACTIVITY_TYPES, baseXP } from '../game/gamification';
import { WORKOUT_TEMPLATES, youtubeSearchUrl, sessionExercisesFromTemplate } from '../game/templates';
import { createSession, formatSet } from '../game/session';
import { routineSessionExercises, lastWorkoutWithExercises, filterHistory, HISTORY_FILTERS } from '../game/routines';
import { unlockAudio } from '../utils/device';
import Pomodoro from '../components/Pomodoro';
import TrainingPlanner from '../components/TrainingPlanner';
import SmartTrainingPanel from '../components/SmartTrainingPanel';
import { confirm, notify } from '../utils/notify';
import { announceReward } from '../utils/rewards';
import { colors, card } from '../theme';
import {MythicIcon,activityIcon} from '../components/MythicIcon';

const EMPTY_FORM = { title: '', duration: '', intensity: 5, notes: '', templateId: null };

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

export default function LogScreen({ navigation }) {
  const { state, progress, logActivity, deleteActivity, startSession, saveRoutine, deleteRoutine } = useGame();
  const [type, setType] = useState('workout');
  const [form, setForm] = useState(EMPTY_FORM);
  const [openTemplate, setOpenTemplate] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historyLimit, setHistoryLimit] = useState(20);
  const [openActivity, setOpenActivity] = useState(null);

  const duration = parseInt(form.duration, 10);
  const valid = form.title.trim() && duration > 0 && duration <= 600;
  const previewXP = valid ? Math.round(baseXP(type, duration, form.intensity) * progress.nextStreakMultiplier) : null;
  const history = filterHistory(state.activities, historyFilter, historyLimit);
  const lastWorkout = lastWorkoutWithExercises(state);

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

  // Starts a fresh session with the exercises of a saved routine or an earlier workout.
  function startFrom(source) {
    unlockAudio();
    startSession(createSession({ title: source.title, exercises: routineSessionExercises(state, source) }));
  }

  function keepAsRoutine(activity) {
    try {
      saveRoutine(activity);
      notify('Rutin mentve', `„${activity.title}” bekerült a saját rutinjaid közé.`);
    } catch (err) {
      notify('Nem menthető', err.message);
    }
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
    <Screen title="Az aréna." subtitle="A következő sorozatod itt kezdődik." eyebrow="TRAINING LAB / PERFORMANCE MODE">
      <View style={styles.tabs}>
        {Object.entries(ACTIVITY_TYPES).map(([key, t]) => (
          <Pressable key={key} onPress={() => { setType(key); setForm(EMPTY_FORM); }} style={[styles.tab, type === key && styles.tabActive]}>
            <MythicIcon name={activityIcon(key)} size={19} color={type===key?colors.gold:colors.textMuted}/><Text style={[styles.tabText, type === key && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {type === 'workout' && (
        <LinearGradient colors={['#35534E','#182D33','#0D1921']} style={styles.trainingHero}>
          <View style={{flexDirection:'row',alignItems:'center',gap:8}}><MythicIcon name="energy" size={19}/><Text style={styles.trainingLabel}>TRAINING SYSTEM / READY</Text></View>
          <Text style={styles.trainingTitle}>A VALÓDI ERŐT\nTE ÉPÍTED.</Text>
          <Text style={styles.trainingCopy}>Indíts edzést, vezess minden sorozatot, és gyűjts valódi XP-t.</Text>
          <Pressable onPress={() => startWorkout(null)} style={styles.sessionBtn}>
            <Text style={styles.sessionText}>▶ Üres edzés indítása</Text>
          </Pressable>
          {lastWorkout && (
            <Pressable onPress={() => startFrom(lastWorkout)} style={styles.repeatBtn}>
              <Text style={styles.repeatText} numberOfLines={1}>↻ Legutóbbi ismétlése: {lastWorkout.title}</Text>
            </Pressable>
          )}
          <View style={styles.quickTemplates}>
            {WORKOUT_TEMPLATES.slice(0, 2).map(t => (
              <Pressable key={t.id} style={styles.quickItem} onPress={()=>startWorkout(t)}>
                <Text style={styles.quickName} numberOfLines={1}>{t.name}</Text>
                <Text style={styles.quickMeta}>{t.duration} perc  ↗</Text>
              </Pressable>
            ))}
          </View>
        </LinearGradient>
      )}

      {type === 'workout' && (
        <View style={[card, styles.gap]}>
          <Text style={styles.miniEyebrow}>MY ROUTINES</Text>
          <Text style={styles.sectionTitle}>Saját rutinok</Text>
          {state.routines.length === 0 && (
            <Text style={styles.muted}>Még nincs mentett rutinod. Edzés befejezésekor jelöld be a „Mentés saját rutinként is” lehetőséget, vagy ments el egy korábbi edzést az Előzményekből.</Text>
          )}
          {state.routines.map((r) => (
            <View key={r.id} style={styles.routineRow}>
              <View style={styles.flex}>
                <Text style={styles.templateName} numberOfLines={1}>{r.title}</Text>
                <Text style={styles.muted} numberOfLines={2}>{r.exercises.map((e) => e.name).join(' · ')}</Text>
              </View>
              <Pressable onPress={() => startFrom(r)} style={styles.routineStart} accessibilityLabel={`Rutin indítása: ${r.title}`}>
                <Text style={styles.sessionText}>▶</Text>
              </Pressable>
              <Pressable hitSlop={8} style={styles.deleteBtn} accessibilityLabel={`Rutin törlése: ${r.title}`}
                onPress={() => confirm('Rutin törlése', `Törlöd a(z) „${r.title}” rutint? A naplózott edzések megmaradnak.`, () => deleteRoutine(r.id))}>
                <MythicIcon name="delete" size={22} color={colors.red}/>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {type === 'study' && <Pomodoro onLogged={() => navigation.navigate('Dashboard')} />}
      {type === 'workout' && <TrainingPlanner />}
      {type === 'workout' && <SmartTrainingPanel />}

      {type === 'workout' && (
        <View style={[card, styles.gap]}>
          <Text style={styles.miniEyebrow}>CHOOSE YOUR PATH</Text>
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
        <Text style={styles.miniEyebrow}>QUICK LOG</Text>
        <Text style={styles.sectionTitle}>Gyors bejegyzés</Text>
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

      {state.activities.length > 0 && (
        <View style={[card, styles.gap]}>
          <SectionHeading eyebrow="RECENT ACTIVITY" title="Előzmények" />
          <View style={styles.filterRow}>
            {Object.entries(HISTORY_FILTERS).map(([id, label]) => (
              <Pressable key={id} onPress={() => { setHistoryFilter(id); setHistoryLimit(20); }}
                accessibilityLabel={`Előzmények szűrése: ${label}`}
                style={[styles.filterChip, historyFilter === id && styles.filterOn]}>
                <Text style={[styles.filterText, historyFilter === id && styles.filterTextOn]}>{label}</Text>
              </Pressable>
            ))}
          </View>
          {history.total === 0 && <Text style={styles.muted}>Ebben a kategóriában még nincs bejegyzés.</Text>}
          {history.items.map((a) => {
            const open = openActivity === a.id;
            const hasDetail = Boolean(a.exercises?.length || a.notes);
            return (
              <View key={a.id} style={styles.historyItem}>
                <View style={styles.historyRow}>
                  <Pressable style={styles.flex} disabled={!hasDetail} onPress={() => setOpenActivity(open ? null : a.id)}
                    accessibilityLabel={`Részletek: ${a.title}`}>
                    <Text style={styles.historyTitle} numberOfLines={1}>{ACTIVITY_TYPES[a.type].emoji} {a.title}{hasDetail ? (open ? '  ▲' : '  ▼') : ''}</Text>
                    <Text style={styles.muted}>{formatDate(a.date)} · {a.duration} perc · {a.intensity}/10 · +{progress.xpById[a.id]} XP</Text>
                  </Pressable>
                  <Pressable
                    hitSlop={8}
                    onPress={() => confirm('Törlés', `Biztosan törlöd: „${a.title}”? Az XP is levonódik.`, () => deleteActivity(a.id))}
                    style={styles.deleteBtn}
                  >
                    <MythicIcon name="delete" size={22} color={colors.red}/>
                  </Pressable>
                </View>
                {open && (
                  <View style={styles.detail}>
                    {(a.exercises ?? []).map((e, i) => (
                      <View key={`${e.name}-${i}`}>
                        <Text style={styles.detailName}>{e.name}</Text>
                        <Text style={styles.muted}>{e.sets.map((s) => formatSet(s, e.unit)).join('  ·  ')}</Text>
                      </View>
                    ))}
                    {a.notes ? <Text style={styles.detailNote}>{a.notes}</Text> : null}
                    {a.exercises?.length > 0 && (
                      <View style={styles.detailActions}>
                        <Pressable onPress={() => startFrom(a)} style={styles.detailBtn}>
                          <Text style={styles.useText}>↻ Újra ez az edzés</Text>
                        </Pressable>
                        <Pressable onPress={() => keepAsRoutine(a)} style={styles.detailBtn}>
                          <Text style={styles.useText}>＋ Mentés rutinként</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
          {history.hasMore && (
            <Pressable onPress={() => setHistoryLimit((n) => n + 30)} style={styles.useBtn}>
              <Text style={styles.useText}>Továbbiak betöltése ({history.total - history.items.length})</Text>
            </Pressable>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  miniEyebrow: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.9 },
  trainingHero: { borderRadius: 27, padding: 24, borderColor: '#6F947A', borderWidth: 1, gap: 16, minHeight:228 },
  trainingLabel: { color: colors.gold, fontWeight: '900', fontSize: 10, letterSpacing: 2.2 },
  trainingTitle: { fontSize: 27, fontWeight: '900', color: colors.text, letterSpacing: -1, lineHeight:31 },
  trainingCopy: { fontSize: 12, color: colors.textSoft, lineHeight: 19 },
  quickTemplates: { flexDirection: 'row', gap: 9 },
  quickItem: { flex: 1, backgroundColor: '#1E3433', borderColor: '#41665F', borderWidth: 1,
    borderRadius: 13, minHeight: 64, padding: 9, gap: 4 },
  quickName: { color: colors.text, fontSize: 12, fontWeight: '900' },
  quickMeta: { color: colors.gold, fontWeight: '800', fontSize: 10 },
  flex: { flex: 1 },
  gap: { gap: 10 },
  tabs: { flexDirection: 'row', backgroundColor: colors.cardElevated, borderRadius: 16, padding: 5, gap: 5, borderColor: colors.cardBorder, borderWidth: 1 },
  tab: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: '#31483F', borderColor: colors.gold, borderWidth: 1 },
  tabText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#fff' },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900', letterSpacing: -.2 },
  template: { backgroundColor: colors.input, borderRadius: 16, padding: 15, gap: 10, borderWidth: 1, borderColor: '#3B5F5A' },
  templateSelected: { borderColor: colors.gold },
  templateHead: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  templateName: { color: colors.text, fontWeight: '700', fontSize: 15 },
  chevron: { color: colors.textMuted, fontSize: 12, paddingLeft: 8 },
  muted: { color: colors.textMuted, fontSize: 12 },
  exercise: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  exerciseText: { color: colors.text, fontSize: 14, flex: 1 },
  videoBtn: { backgroundColor: '#3f0d12', borderRadius: 8, paddingHorizontal: 10, height: 36, justifyContent: 'center' },
  videoText: { color: '#fca5a5', fontSize: 12, fontWeight: '700' },
  sessionCard: { borderColor: colors.green },
  sessionBtn: { backgroundColor: colors.gold, borderRadius: 14, height: 51, alignItems: 'center', justifyContent: 'center' },
  sessionText: { color: '#201E19', fontWeight: '900', fontSize: 15 },
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
  historyItem: { borderTopColor: colors.cardBorder, borderTopWidth: 1 },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  detail: { gap: 8, paddingBottom: 12 },
  detailName: { color: colors.textSoft, fontSize: 13, fontWeight: '800' },
  detailNote: { color: colors.textSoft, fontSize: 13, lineHeight: 19, fontStyle: 'italic' },
  detailActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  detailBtn: { flexGrow: 1, minHeight: 44, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  filterRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  filterChip: { minHeight: 44, paddingHorizontal: 14, borderRadius: 22, backgroundColor: colors.input, justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  filterOn: { backgroundColor: '#35453C', borderColor: colors.gold },
  filterText: { color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  filterTextOn: { color: colors.gold },
  repeatBtn: { borderColor: colors.gold, borderWidth: 1, borderRadius: 14, minHeight: 46, paddingHorizontal: 14, justifyContent: 'center' },
  repeatText: { color: colors.gold, fontWeight: '800', fontSize: 13 },
  routineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopColor: colors.cardBorder, borderTopWidth: 1, paddingTop: 10 },
  routineStart: { width: 46, height: 44, borderRadius: 12, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  historyTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  deleteBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  deleteText: { fontSize: 18 }
});
