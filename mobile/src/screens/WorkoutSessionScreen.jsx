import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Linking, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../game/GameContext';
import { EXERCISE_LIBRARY, youtubeSearchUrl } from '../game/templates';
import {
  REST_OPTIONS, INTERVAL_PRESETS, elapsedSeconds, restRemaining, intervalStatus, formatClock, setValue, formatSet
} from '../game/session';
import { beep, keepScreenAwake, unlockAudio } from '../utils/device';
import { confirm, notify } from '../utils/notify';
import { announceReward } from '../utils/rewards';
import { colors, card } from '../theme';
import { validateDetailedSet } from '../game/fitnessPro';

function useTicker(active) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return undefined;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

const addSet = (session, index, value) => ({
  ...session,
  exercises: session.exercises.map((e, i) => (i === index ? { ...e, sets: [...e.sets, value] } : e))
});

export default function WorkoutSessionScreen() {
  const insets = useSafeAreaInsets();
  const { session, updateSession, discardSession, finishSession } = useGame();
  const now = useTicker(true);
  const [counter, setCounter] = useState(0);
  const [weightInput, setWeightInput] = useState('');
  const [rpeInput,setRpeInput]=useState('');
  const [rirInput,setRirInput]=useState('');
  const [warmup,setWarmup]=useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [intensity, setIntensity] = useState(7);
  const lastPhase = useRef(null);

  useEffect(() => keepScreenAwake(), []);

  const ex = session.exercises[session.current];
  const rest = restRemaining(session, now);
  const interval = session.interval ? intervalStatus(session.interval, now) : null;
  const stopwatch = session.stopwatchStartedAt ? elapsedSeconds(session.stopwatchStartedAt, now) : null;

  useEffect(() => {
    setCounter(ex?.target ?? setValue(ex?.sets.at(-1)) ?? 0);
    const prior = ex?.sets.at(-1);
    setWeightInput(prior && typeof prior === 'object' ? String(prior.weightKg ?? '') : '');
    setRpeInput(prior && typeof prior === 'object' && prior.rpe!=null ? String(prior.rpe) : '');
    setRirInput(prior && typeof prior === 'object' && prior.rir!=null ? String(prior.rir) : '');
    setWarmup(false);
  }, [session.current]);

  useEffect(() => {
    if (session.restEndsAt && rest === 0) {
      beep(3);
      updateSession((s) => ({ ...s, restEndsAt: null }));
    }
  }, [rest, session.restEndsAt]);

  useEffect(() => {
    if (!interval) {
      lastPhase.current = null;
      return;
    }
    if (interval.done) {
      beep(3);
      const { exerciseIndex, work, rounds } = session.interval;
      updateSession((s) => ({ ...addSet(s, exerciseIndex, work * rounds), interval: null }));
      return;
    }
    if (lastPhase.current && lastPhase.current !== interval.phase) beep(interval.phase === 'work' ? 2 : 1);
    lastPhase.current = interval.phase;
  }, [interval?.phase, interval?.done]);

  const totalSets = session.exercises.reduce((n, e) => n + e.sets.length, 0);
  const filteredLibrary = EXERCISE_LIBRARY.filter(item => item.name.toLocaleLowerCase('hu-HU').includes(exerciseSearch.trim().toLocaleLowerCase('hu-HU'))).slice(0, 40);

  function select(index) {
    updateSession((s) => ({ ...s, current: index }));
  }

  function completeRepSet() {
    if (counter <= 0) return;
    unlockAudio();
    const kg = Number(weightInput.replace(',', '.'));
    if (ex.weighted && (weightInput.trim() === '' || !Number.isFinite(kg) || kg < 0 || kg > 1500)) return;
    let entry = counter;
    if(ex.weighted){
      try {entry=validateDetailedSet({reps:counter,weightKg:kg,rpe:rpeInput,rir:rirInput,warmup});}
      catch (err) {notify('Hibás sorozatadatok',err.message);return;}
    }
    updateSession((s) => ({ ...addSet(s, s.current, entry), restEndsAt: Date.now() + s.restSeconds * 1000 }));
  }

  function toggleStopwatch() {
    unlockAudio();
    if (session.stopwatchStartedAt) {
      const secs = elapsedSeconds(session.stopwatchStartedAt);
      updateSession((s) => ({ ...(secs > 0 ? addSet(s, s.current, secs) : s), stopwatchStartedAt: null }));
    } else {
      updateSession((s) => ({ ...s, stopwatchStartedAt: Date.now(), restEndsAt: null }));
    }
  }

  function startInterval(preset) {
    unlockAudio();
    beep(2);
    updateSession((s) => ({
      ...s,
      restEndsAt: null,
      interval: { ...preset, startedAt: Date.now(), exerciseIndex: s.current }
    }));
  }

  function removeSet(setIndex) {
    confirm('Sorozat törlése', `Törlöd a(z) ${setIndex + 1}. sorozatot?`, () =>
      updateSession((s) => ({
        ...s,
        exercises: s.exercises.map((e, i) => (i === s.current ? { ...e, sets: e.sets.filter((_, j) => j !== setIndex) } : e))
      }))
    );
  }

  function addExercise(item) {
    updateSession((s) => ({
      ...s,
      exercises: [...s.exercises, { name: item.name, unit: item.unit, weighted: !!item.weighted, search: item.search, target: null, sets: [] }],
      current: s.exercises.length
    }));
    setShowAdd(false);
    setExerciseSearch('');
  }

  function finish() {
    const result = finishSession(intensity);
    const extra = [];
    if (result.records.length) extra.push(`🏆 Új rekord: ${result.records.join(', ')}`);
    if (result.programDay) extra.push(result.finishedProgram ? '🎉 A teljes programot teljesítetted!' : '🥋 A mai programnap is kész.');
    announceReward(result, { title: 'Edzés kész', message: [session.title, ...extra].join('\n') });
  }

  const unitLabel = (e, v) => formatSet(v, e.unit);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={styles.headerTitle} numberOfLines={1}>{session.title}</Text>
          <Text style={styles.headerSub}>⏱ {formatClock(elapsedSeconds(session.startedAt, now))} · {totalSets} sorozat</Text>
        </View>
        <Pressable
          hitSlop={8}
          onPress={() => confirm('Edzés elvetése', 'Az edzés nem kerül mentésre. Biztos?', discardSession)}
          style={styles.closeBtn}
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
        {session.exercises.map((e, i) => (
          <Pressable key={`${e.name}-${i}`} onPress={() => select(i)} style={[styles.chip, i === session.current && styles.chipOn]}>
            <Text style={[styles.chipText, i === session.current && styles.chipTextOn]}>
              {e.name}{e.sets.length ? ` · ${e.sets.length}` : ''}
            </Text>
          </Pressable>
        ))}
        <Pressable onPress={() => setShowAdd(!showAdd)} style={[styles.chip, styles.chipAdd]}>
          <Text style={styles.chipText}>＋ Gyakorlat</Text>
        </Pressable>
      </ScrollView>

      <ScrollView style={styles.flex} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {showAdd && (
          <View style={[card, styles.gap]}>
            <Text style={styles.sectionTitle}>Gyakorlat hozzáadása</Text>
            <TextInput style={styles.weightInput} value={exerciseSearch} onChangeText={setExerciseSearch}
              placeholder="Gyakorlat keresése…" placeholderTextColor={colors.textMuted} accessibilityLabel="Gyakorlat keresése"/>
            <View style={styles.libGrid}>
              {filteredLibrary.map((item) => (
                <Pressable key={item.name} onPress={() => addExercise(item)} style={styles.libItem}>
                  <Text style={styles.libText}>{item.name}</Text>
                  <Text style={styles.muted}>{item.unit === 'sec' ? 'időre' : item.weighted ? 'súlyzós' : 'ismétlés'}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {!ex ? (
          <View style={[card, styles.gap]}>
            <Text style={styles.sectionTitle}>Még nincs gyakorlat</Text>
            <Text style={styles.muted}>Adj hozzá egyet a „＋ Gyakorlat” gombbal.</Text>
          </View>
        ) : (
          <View style={[card, styles.gap]}>
            <View style={styles.rowBetween}>
              <View style={styles.flex}>
                <Text style={styles.exName}>{ex.name}</Text>
                {ex.target ? <Text style={styles.target}>Cél: {ex.target} ismétlés</Text> : null}
              </View>
              {ex.search ? (
                <Pressable onPress={() => Linking.openURL(youtubeSearchUrl(ex.search))} style={styles.videoBtn}>
                  <Text style={styles.videoText}>▶ Hogyan</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.sets}>
              {ex.sets.length === 0 && <Text style={styles.muted}>Még nincs sorozat.</Text>}
              {ex.sets.map((v, i) => (
                <Pressable key={i} onPress={() => removeSet(i)} style={styles.setChip}>
                  <Text style={styles.setText}>{i + 1}. {unitLabel(ex, v)}</Text>
                </Pressable>
              ))}
            </View>
            {ex.target && ex.sets.length > 0 && (
              <Text style={styles.muted}>Összesen: {ex.sets.reduce((a, b) => a + setValue(b), 0)} / {ex.target}</Text>
            )}

            {ex.unit === 'reps' ? (
              <>
                <View style={styles.counterRow}>
                  <Pressable onPress={() => setCounter((c) => Math.max(0, c - 1))} style={styles.counterBtn}><Text style={styles.counterBtnText}>−1</Text></Pressable>
                  <Text style={styles.counter}>{counter}</Text>
                  <Pressable onPress={() => setCounter((c) => c + 1)} style={styles.counterBtn}><Text style={styles.counterBtnText}>+1</Text></Pressable>
                  <Pressable onPress={() => setCounter((c) => c + 5)} style={styles.counterBtn}><Text style={styles.counterBtnText}>+5</Text></Pressable>
                </View>
                {ex.weighted && (
                  <View style={styles.weightRow}>
                    <Text style={styles.muted}>Súly (kg)</Text>
                    <Pressable accessibilityLabel="Súly csökkentése 2,5 kilogrammal" onPress={() =>
                      setWeightInput(String(Math.max(0, (Number(weightInput.replace(',', '.'))||0)-2.5)))}
                      style={styles.weightStep}><Text style={styles.weightStepText}>−</Text></Pressable>
                    <TextInput
                      style={styles.weightInput}
                      value={weightInput}
                      onChangeText={(value) => setWeightInput(value.replace(/[^0-9.,]/g, ''))}
                      keyboardType="decimal-pad"
                      placeholder="pl. 60"
                      placeholderTextColor={colors.textMuted}
                      maxLength={6}
                    />
                    <Pressable accessibilityLabel="Súly növelése 2,5 kilogrammal" onPress={() =>
                      setWeightInput(String(Math.min(1500, (Number(weightInput.replace(',', '.'))||0)+2.5)))}
                      style={styles.weightStep}><Text style={styles.weightStepText}>＋</Text></Pressable>
                  </View>
                )}
                {ex.weighted && <View style={styles.effortBox}>
                  <Text style={styles.muted}>Terhelésérzet · opcionális</Text>
                  <View style={styles.effortRow}>
                    <TextInput style={styles.effortInput} keyboardType="decimal-pad" placeholder="RPE 1–10"
                      placeholderTextColor={colors.textMuted} value={rpeInput} onChangeText={setRpeInput}/>
                    <TextInput style={styles.effortInput} keyboardType="number-pad" placeholder="RIR 0–10"
                      placeholderTextColor={colors.textMuted} value={rirInput} onChangeText={setRirInput}/>
                  </View>
                  <Pressable onPress={()=>setWarmup(v=>!v)} style={styles.warmupBtn}
                    accessibilityRole="checkbox" accessibilityState={{checked:warmup}}>
                    <Text style={styles.warmupText}>{warmup?'☑':'□'} Bemelegítő sorozat</Text>
                  </Pressable>
                </View>}
                <Pressable disabled={counter <= 0 || (ex.weighted && (weightInput.trim() === '' || !Number.isFinite(Number(weightInput.replace(',', '.')))))} onPress={completeRepSet} style={[styles.primary, counter <= 0 && styles.disabled]}>
                  <Text style={styles.primaryText}>✓ Sorozat kész ({counter})</Text>
                </Pressable>
              </>
            ) : interval && session.interval.exerciseIndex === session.current ? (
              <View style={[styles.timerBox, interval.phase === 'work' ? styles.workBox : styles.restBox]}>
                <Text style={styles.timerLabel}>{interval.phase === 'work' ? 'MUNKA' : 'PIHENŐ'} · {interval.round}/{session.interval.rounds}. kör</Text>
                <Text style={styles.timerBig}>{formatClock(interval.remaining)}</Text>
                <Pressable
                  onPress={() => updateSession((s) => ({ ...(interval.workSeconds > 0 ? addSet(s, s.interval.exerciseIndex, interval.workSeconds) : s), interval: null }))}
                  style={styles.outline}
                >
                  <Text style={styles.outlineText}>Leállítás és mentés</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.timerBox}>
                  <Text style={styles.timerBig}>{formatClock(stopwatch ?? 0)}</Text>
                </View>
                <Pressable onPress={toggleStopwatch} style={[styles.primary, stopwatch != null && styles.stopBtn]}>
                  <Text style={styles.primaryText}>{stopwatch != null ? '■ Stop és mentés' : '▶ Stopper indítása'}</Text>
                </Pressable>
                {stopwatch == null && (
                  <View style={styles.gap}>
                    <Text style={styles.muted}>Vagy intervallum időzítő:</Text>
                    <View style={styles.presetRow}>
                      {INTERVAL_PRESETS.map((p) => (
                        <Pressable key={p.label} onPress={() => startInterval(p)} style={styles.preset}>
                          <Text style={styles.presetText}>{p.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {rest > 0 && (
          <View style={[card, styles.restCard]}>
            <Text style={styles.timerLabel}>PIHENŐ</Text>
            <Text style={styles.timerBig}>{formatClock(rest)}</Text>
            <View style={styles.presetRow}>
              <Pressable onPress={() => updateSession((s) => ({ ...s, restEndsAt: s.restEndsAt + 15000 }))} style={styles.preset}>
                <Text style={styles.presetText}>+15 mp</Text>
              </Pressable>
              <Pressable onPress={() => updateSession((s) => ({ ...s, restEndsAt: null }))} style={styles.preset}>
                <Text style={styles.presetText}>Kihagyás</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={[card, styles.gap]}>
          <Text style={styles.muted}>Pihenő sorozat után:</Text>
          <View style={styles.presetRow}>
            {REST_OPTIONS.map((sec) => (
              <Pressable
                key={sec}
                onPress={() => updateSession((s) => ({ ...s, restSeconds: sec }))}
                style={[styles.preset, session.restSeconds === sec && styles.presetOn]}
              >
                <Text style={styles.presetText}>{sec} mp</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {finishing ? (
          <View style={[card, styles.gap]}>
            <Text style={styles.sectionTitle}>Milyen nehéz volt? {intensity}/10</Text>
            <View style={styles.intensityRow}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <Pressable key={n} onPress={() => setIntensity(n)} style={[styles.intensityBtn, n <= intensity && styles.intensityOn]}>
                  <Text style={styles.intensityText}>{n}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={finish} style={styles.primary}>
              <Text style={styles.primaryText}>Mentés és XP</Text>
            </Pressable>
            <Pressable onPress={() => setFinishing(false)} hitSlop={8}>
              <Text style={styles.cancel}>Vissza az edzéshez</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable disabled={totalSets === 0} onPress={() => setFinishing(true)} style={[styles.finish, totalSets === 0 && styles.disabled]}>
            <Text style={styles.primaryText}>🏁 Edzés befejezése</Text>
          </Pressable>
        )}
        <View style={{ height: insets.bottom + 16 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  effortBox:{gap:9,padding:12,borderRadius:12,backgroundColor:colors.surface},
  effortRow:{flexDirection:'row',gap:9},
  effortInput:{flex:1,paddingHorizontal:11,minHeight:44,borderRadius:10,backgroundColor:colors.input,color:colors.text},
  warmupBtn:{minHeight:40,justifyContent:'center'},
  warmupText:{color:colors.gold,fontSize:12,fontWeight:'800'},
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  gap: { gap: 10 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  headerTitle: { color: colors.text, fontSize: 23, fontWeight: '900' },
  headerSub: { color: colors.primarySoft, fontSize: 13, fontWeight: '600', marginTop: 2 },
  closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.textMuted, fontSize: 22 },
  chipsScroll: { flexGrow: 0, marginTop: 12 },
  chips: { paddingHorizontal: 16, gap: 8 },
  chip: { height: 43, paddingHorizontal: 14, borderRadius: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, justifyContent: 'center' },
  chipOn: { backgroundColor: '#304E47', borderColor: colors.primarySoft },
  chipAdd: { borderStyle: 'dashed' },
  chipText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
  chipTextOn: { color: '#fff' },
  body: { padding: 16, gap: 14 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  muted: { color: colors.textMuted, fontSize: 12 },
  libGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  libItem: { width: '48%', flexGrow: 1, backgroundColor: colors.input, borderRadius: 10, padding: 10, minHeight: 44 },
  libText: { color: colors.text, fontWeight: '600', fontSize: 14 },
  exName: { color: colors.text, fontSize: 22, fontWeight: '800' },
  target: { color: colors.gold, fontWeight: '700', fontSize: 13, marginTop: 2 },
  videoBtn: { backgroundColor: '#3f0d12', borderRadius: 8, paddingHorizontal: 10, height: 36, justifyContent: 'center' },
  videoText: { color: '#fca5a5', fontSize: 12, fontWeight: '700' },
  sets: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  setChip: { backgroundColor: '#14532d', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  setText: { color: '#bbf7d0', fontWeight: '700', fontSize: 13 },
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weightStep: { width: 45, height: 47, backgroundColor: colors.input, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  weightStepText: { color: colors.cyan, fontSize: 20, fontWeight: '900' },
  weightInput: { flex: 1, borderRadius: 12, backgroundColor: colors.input, color: colors.text, height: 48, paddingHorizontal: 14, fontSize: 18 },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  counter: { flex: 1, color: colors.text, fontSize: 48, fontWeight: '800', textAlign: 'center' },
  counterBtn: { width: 56, height: 56, borderRadius: 14, backgroundColor: colors.input, alignItems: 'center', justifyContent: 'center' },
  counterBtnText: { color: colors.text, fontSize: 18, fontWeight: '800' },
  primary: { backgroundColor: colors.primary, borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  stopBtn: { backgroundColor: colors.red },
  disabled: { opacity: 0.4 },
  timerBox: { alignItems: 'center', paddingVertical: 8, borderRadius: 14, gap: 6 },
  workBox: { backgroundColor: '#3f0d12', paddingVertical: 16 },
  restBox: { backgroundColor: '#0c2a1a', paddingVertical: 16 },
  timerLabel: { color: colors.textSoft, fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  timerBig: { color: colors.text, fontSize: 56, fontWeight: '800', fontVariant: ['tabular-nums'] },
  outline: { borderColor: colors.textMuted, borderWidth: 1, borderRadius: 10, height: 44, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  outlineText: { color: colors.text, fontWeight: '700' },
  presetRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  preset: { flexGrow: 1, height: 44, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.input, alignItems: 'center', justifyContent: 'center' },
  presetOn: { backgroundColor: colors.primary },
  presetText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  restCard: { borderColor: colors.green, alignItems: 'center', gap: 8 },
  intensityRow: { flexDirection: 'row', gap: 4 },
  intensityBtn: { flex: 1, height: 44, borderRadius: 8, backgroundColor: colors.input, alignItems: 'center', justifyContent: 'center' },
  intensityOn: { backgroundColor: colors.primary },
  intensityText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  finish: { backgroundColor: colors.green, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center' },
  cancel: { color: colors.textMuted, textAlign: 'center', textDecorationLine: 'underline', paddingVertical: 6 }
});
