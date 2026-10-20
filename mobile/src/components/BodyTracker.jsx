import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Text as SvgText } from 'react-native-svg';
import { useGame } from '../game/GameContext';
import { BODY_FIELDS, bodySummary } from '../game/body';
import { confirm, notify } from '../utils/notify';
import { card, colors } from '../theme';
import {MythicIcon} from './MythicIcon';

const INITIAL = { weightKg: '', waistCm: '', chestCm: '', hipsCm: '', armCm: '', thighCm: '' };
function WeightChart({ history }) {
  const points = history.slice(-24);
  if (points.length < 2) return null;
  const W = 300, H = 145, p = 22;
  const vals = points.map((v) => v.value);
  const min = Math.min(...vals), max = Math.max(...vals), range = Math.max(1, max - min);
  const coords = points.map((v, i) => ({
    x: p + i * (W - 2 * p) / (points.length - 1),
    y: p + (max - v.value) / range * (H - 2 * p)
  }));
  return (
    <View style={styles.center}>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <Polyline points={coords.map((v) => `${v.x},${v.y}`).join(' ')} stroke={colors.green} strokeWidth={2.5} fill="none" />
        {coords.map((v, i) => <Circle key={points[i].id} cx={v.x} cy={v.y} r={3.5} fill={colors.green} />)}
        <SvgText x={p} y={H - 2} fontSize={10} fill={colors.textMuted}>{min.toFixed(1)} kg</SvgText>
        <SvgText x={W - p} y={H - 2} textAnchor="end" fontSize={10} fill={colors.textMuted}>{max.toFixed(1)} kg</SvgText>
      </Svg>
    </View>
  );
}
export default function BodyTracker() {
  const { state, addBodyMeasurement, deleteBodyMeasurement, setGoalWeight } = useGame();
  const [form, setForm] = useState(INITIAL);
  const [goal, setGoal] = useState(state.profile?.goalWeightKg == null ? '' : String(state.profile.goalWeightKg));
  const [open, setOpen] = useState(false);
  const summary = useMemo(() => bodySummary(state.bodyMeasurements), [state.bodyMeasurements]);
  function submit() {
    try {
      addBodyMeasurement(form);
      setForm(INITIAL);
      setOpen(false);
      notify('Mérés rögzítve', 'A testsúly és a testméretek elmentve ezen az eszközön.');
    } catch (error) {
      notify('Hibás mérés', error.message);
    }
  }
  function saveGoal() {
    try {
      setGoalWeight(goal);
      notify('Cél frissítve', 'A céltestsúly mentve.');
    } catch (error) {
      notify('Érvénytelen cél', error.message);
    }
  }
  return (
    <View style={[card, styles.gap]}>
      <Text style={styles.eyebrow}>YOUR BODY / YOUR BASELINE</Text>
      <View style={{flexDirection:'row',alignItems:'center',gap:9}}><MythicIcon name="stats" size={24}/><Text style={styles.title}>Testösszetétel és mérések</Text></View>
      <Text style={styles.muted}>Testsúly, körfogatok és időbeli változás. A mérések nem minősülnek egészségügyi értékelésnek.</Text>
      {summary.latest ? (
        <View style={styles.metricRow}>
          <View style={styles.metric}><Text style={styles.big}>{summary.latest.weightKg} kg</Text><Text style={styles.muted}>Legutóbbi mérés</Text></View>
          <View style={styles.metric}><Text style={styles.big}>{summary.changeKg === null ? '—' : `${summary.changeKg > 0 ? '+' : ''}${summary.changeKg} kg`}</Text><Text style={styles.muted}>Előző méréshez képest</Text></View>
        </View>
      ) : <Text style={styles.muted}>Még nincs mérésed. Az első bejegyzés után itt megjelenik a fejlődési görbe.</Text>}
      <WeightChart history={summary.history} />
      <Pressable style={styles.button} onPress={() => setOpen(!open)}>
        <Text style={styles.buttonText}>{open ? 'Bezárás' : '＋ Új mérés rögzítése'}</Text>
      </Pressable>
      {open && (
        <View style={styles.gap}>
          {[{ key: 'weightKg', label: 'Testsúly (kg) *' }, ...BODY_FIELDS].map(({ key, label }) => (
            <View key={key} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={form[key]}
                onChangeText={(value) => setForm((s) => ({ ...s, [key]: value.replace(/[^0-9.,]/g, '') }))}
                keyboardType="decimal-pad"
                placeholder={key === 'weightKg' ? 'pl. 85,5' : 'opcionális'}
                placeholderTextColor={colors.textMuted}
                maxLength={6}
              />
            </View>
          ))}
          <Pressable onPress={submit} style={[styles.button, { backgroundColor: colors.green }]}>
            <Text style={[styles.buttonText, { color: '#052e16' }]}>Mérés mentése</Text>
          </Pressable>
        </View>
      )}
      <Text style={styles.subtitle}>Céltestsúly (nem kötelező)</Text>
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 1 }]} value={goal}
          onChangeText={(value) => setGoal(value.replace(/[^0-9.,]/g, ''))}
          keyboardType="decimal-pad" placeholder="Nincs beállítva"
          placeholderTextColor={colors.textMuted} />
        <Pressable onPress={saveGoal} style={styles.smallBtn}><Text style={styles.buttonText}>Mentés</Text></Pressable>
      </View>
      {summary.history.slice(-5).reverse().map((m) => (
        <View key={m.id} style={styles.history}>
          <Text style={styles.muted}>{new Date(state.bodyMeasurements.find((x) => x.id === m.id).date).toLocaleDateString('hu-HU')}</Text>
          <Text style={styles.entryValue}>{m.value} kg</Text>
          <Pressable onPress={() => confirm('Mérés törlése', 'Biztosan törlöd ezt a mérést?', () => deleteBodyMeasurement(m.id))}>
            <Text style={styles.delete}>Törlés</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  eyebrow: { color: colors.cyan, fontWeight: '900', fontSize: 10, letterSpacing: 1.8 },
  gap: { gap: 13 }, title: { color: colors.text, fontWeight: '900', fontSize: 18 },
  subtitle: { color: colors.text, fontWeight: '700', fontSize: 14 },
  muted: { color: colors.textMuted, fontSize: 12 }, center: { alignItems: 'center' },
  metricRow: { flexDirection: 'row', gap: 8 }, metric: { flex: 1, padding: 10, borderRadius: 12, backgroundColor: colors.input, gap: 4 },
  big: { color: colors.text, fontWeight: '900', fontSize: 22 },
  button: { backgroundColor: colors.primary, height: 51, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  smallBtn: { backgroundColor: colors.primary, height: 48, paddingHorizontal: 14, borderRadius: 12, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { color: colors.textSoft, width: 115, fontSize: 12 },
  input: { backgroundColor: colors.input, borderRadius: 10, color: colors.text, height: 46, paddingHorizontal: 12, minWidth: 110 },
  history: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 7, borderTopWidth: 1, borderTopColor: colors.cardBorder },
  entryValue: { color: colors.text, flex: 1, fontWeight: '700' },
  delete: { color: colors.red, fontWeight: '700', fontSize: 12 }
});
