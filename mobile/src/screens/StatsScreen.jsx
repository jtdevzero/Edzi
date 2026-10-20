import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Rect, Polyline, Circle, Text as SvgText } from 'react-native-svg';
import Screen from '../components/Screen';
import SectionHeading from '../components/SectionHeading';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../game/GameContext';
import { computeStats, computeExerciseRecords } from '../game/stats';
import { formatClock } from '../game/session';
import BodyTracker from '../components/BodyTracker';
import { ACTIVITY_TYPES, parseDayKey } from '../game/gamification';
import { colors, card } from '../theme';

const HEAT_COLORS = ['#192641', '#263E61', '#375E8C', '#4071AF', '#44DFD0'];
const WEEKDAYS = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];
const TYPE_COLORS = { workout: colors.red, study: colors.blue, journal: colors.green };
const FONT = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

function formatMinutes(min) {
  if (min < 60) return `${min} perc`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} ó ${m} p` : `${h} óra`;
}

function shortDate(key) {
  const d = parseDayKey(key);
  return `${d.getMonth() + 1}.${d.getDate()}.`;
}

function Heatmap({ weeks }) {
  return (
    <View style={styles.heatWrap}>
      <View style={styles.heatLabels}>
        {WEEKDAYS.map((d, i) => <Text key={i} style={styles.heatLabel}>{d}</Text>)}
      </View>
      <View style={styles.heatGrid}>
        {weeks.map((week) => (
          <View key={week[0].key} style={styles.heatCol}>
            {week.map((day) => (
              <View
                key={day.key}
                style={[
                  styles.heatCell,
                  { backgroundColor: day.future ? 'transparent' : HEAT_COLORS[day.level] },
                  day.rest && styles.heatRest
                ]}
              >
                {day.rest ? <Text style={styles.restIcon}>🛡</Text> : null}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function WeeklyChart({ weeks }) {
  const width = 300;
  const height = 150;
  const chartH = 110;
  const barW = width / weeks.length - 10;
  const max = Math.max(50, ...weeks.map((w) => w.xp));
  return (
    <View style={styles.center}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {weeks.map((w, i) => {
          const h = (w.xp / max) * chartH;
          const x = i * (width / weeks.length) + 5;
          const current = i === weeks.length - 1;
          return (
            <React.Fragment key={w.week}>
              <Rect x={x} y={chartH - h + 14} width={barW} height={Math.max(h, 2)} rx={4} fill={current ? colors.primarySoft : colors.primary} />
              {w.xp > 0 && (
                <SvgText x={x + barW / 2} y={chartH - h + 10} fill={colors.text} fontSize="10" fontFamily={FONT} textAnchor="middle">{String(w.xp)}</SvgText>
              )}
              <SvgText x={x + barW / 2} y={height - 4} fill={colors.textMuted} fontSize="9" fontFamily={FONT} textAnchor="middle">{shortDate(w.week)}</SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

function ProgressChart({ history, unit }) {
  const points = history.slice(-20);
  const width = 300;
  const height = 140;
  const pad = 20;
  const max = Math.max(...points.map((p) => p.value));
  const min = Math.min(...points.map((p) => p.value));
  const span = Math.max(1, max - min);
  const xy = points.map((p, i) => ({
    x: pad + (i * (width - 2 * pad)) / (points.length - 1),
    y: pad + (1 - (p.value - min) / span) * (height - 2 * pad - 10)
  }));
  const fmt = (v) => (unit === 'sec' ? formatClock(v) : String(v));
  return (
    <View style={styles.center}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <Polyline points={xy.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={colors.gold} strokeWidth="2.5" />
        {xy.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r="3.5" fill={colors.gold} />)}
        <SvgText x={xy.at(-1).x} y={xy.at(-1).y - 8} fill={colors.text} fontSize="11" fontWeight="bold" fontFamily={FONT} textAnchor="middle">{fmt(points.at(-1).value)}</SvgText>
        <SvgText x={pad} y={height - 2} fill={colors.textMuted} fontSize="9" fontFamily={FONT}>{shortDate(points[0].day)}</SvgText>
        <SvgText x={width - pad} y={height - 2} fill={colors.textMuted} fontSize="9" fontFamily={FONT} textAnchor="end">{shortDate(points.at(-1).day)}</SvgText>
      </Svg>
    </View>
  );
}

function ExerciseRecords({ records }) {
  const list = Object.values(records).sort((a, b) => b.sessions - a.sessions);
  const [selected, setSelected] = useState(null);
  const current = records[selected] ?? list[0];
  if (!list.length) {
    return (
      <View style={card}>
        <Text style={styles.sectionTitle}>🏆 Gyakorlat rekordok</Text>
        <Text style={styles.muted}>Használd az Edzésmódot (Naplózás → Edzés), és itt látod majd a rekordjaidat és a fejlődésedet gyakorlatonként.</Text>
      </View>
    );
  }
  const fmt = (v) => (current.unit === 'sec' ? formatClock(v) : `${v}`);
  return (
    <View style={[card, styles.recGap]}>
      <Text style={styles.sectionTitle}>🏆 Gyakorlat rekordok</Text>
      <View style={styles.exChips}>
        {list.map((r) => (
          <Pressable key={r.name} onPress={() => setSelected(r.name)} style={[styles.exChip, r.name === current.name && styles.exChipOn]}>
            <Text style={[styles.exChipText, r.name === current.name && styles.exChipTextOn]}>{r.name}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.recordGrid}>
        <Record value={fmt(current.bestSet)} label={current.unit === 'sec' ? 'Leghosszabb' : 'Max egy sorozatban'} />
        <Record value={fmt(current.bestSession)} label="Max egy edzésen" />
        <Record value={fmt(current.total)} label="Összesen" />
        <Record value={current.sessions} label="Edzés" />
        {current.bestWeightKg > 0 && <Record value={`${current.bestWeightKg} kg`} label="Legnagyobb súly" />}
        {current.volumeKg > 0 && <Record value={`${Math.round(current.volumeKg)} kg`} label="Összes mozgatott tömeg" />}
      </View>
      <Text style={styles.muted}>Fejlődés (napi legjobb sorozat)</Text>
      {current.history.length >= 2 ? (
        <ProgressChart history={current.history} unit={current.unit} />
      ) : (
        <Text style={styles.muted}>A grafikonhoz legalább 2 különböző nap kell ebből a gyakorlatból.</Text>
      )}
    </View>
  );
}

function Record({ value, label }) {
  return (
    <View style={[card, styles.record]}>
      <Text style={styles.recordValue}>{value}</Text>
      <Text style={styles.recordLabel}>{label}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const { state, progress } = useGame();
  const stats = useMemo(() => computeStats(state, progress), [state, progress]);
  const exerciseRecords = useMemo(() => computeExerciseRecords(state), [state]);
  const { records, minutesByType } = stats;
  const totalTypeMinutes = records.totalMinutes || 1;

  return (
    <Screen title="Statisztika" eyebrow="ANALYTICS / PERFORMANCE" subtitle="A fejlődés láthatóvá válik.">
      <LinearGradient colors={['#252642','#111827','#0B111B']} style={styles.statsHero}>
        <Text style={styles.heroEyebrow}>◈  PERFORMANCE RECORD</Text>
        <Text style={styles.heroNumber}>{formatMinutes(records.totalMinutes)}</Text>
        <Text style={styles.heroCaption}>ÖSSZES RÖGZÍTETT AKTIVITÁS</Text>
        <Text style={styles.heroNote}>{records.activeDays} aktív nap · {records.longestStreak} napos rekord sorozat</Text>
      </LinearGradient>
      <SectionHeading eyebrow="YOUR NUMBERS" title="Áttekintés"/>
      <View style={styles.recordGrid}>
        <Record value={`🔥 ${records.longestStreak}`} label="Leghosszabb streak (nap)" />
        <Record value={records.activeDays} label="Aktív napok" />
        <Record value={formatMinutes(records.bestWeekMinutes)} label="Legjobb hét" />
        <Record value={formatMinutes(records.totalMinutes)} label="Összesen" />
      </View>

      <SectionHeading eyebrow="BODY COMPOSITION" title="Testméretek és trendek"/>
      <BodyTracker />
      <SectionHeading eyebrow="PERSONAL RECORDS" title="Gyakorlatok"/>
      <ExerciseRecords records={exerciseRecords} />

      <SectionHeading eyebrow="CONSISTENCY" title="Aktivitási térkép"/>
      <View style={card}>
        <Text style={styles.sectionTitle}>Az utolsó 12 hét</Text>
        <Text style={styles.muted}>Minél sötétebb, annál több perc. 🛡 = pihenőnap, ami megvédte a streaket.</Text>
        <Heatmap weeks={stats.heatmap} />
      </View>

      <View style={card}>
        <Text style={styles.sectionTitle}>Heti XP</Text>
        <WeeklyChart weeks={stats.weeklyXP} />
      </View>

      <View style={card}>
        <Text style={styles.sectionTitle}>Mire ment az idő?</Text>
        <View style={styles.splitBar}>
          {Object.keys(ACTIVITY_TYPES).map((t) =>
            minutesByType[t] > 0 ? (
              <View key={t} style={{ flex: minutesByType[t], backgroundColor: TYPE_COLORS[t] }} />
            ) : null
          )}
        </View>
        {Object.entries(ACTIVITY_TYPES).map(([t, info]) => (
          <View key={t} style={styles.typeRow}>
            <View style={[styles.dot, { backgroundColor: TYPE_COLORS[t] }]} />
            <Text style={styles.typeLabel}>{info.emoji} {info.label}</Text>
            <Text style={styles.typeValue}>
              {formatMinutes(minutesByType[t])} · {Math.round((minutesByType[t] / totalTypeMinutes) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const CELL = 18;

const styles = StyleSheet.create({
  statsHero: { padding: 26, borderRadius: 28, borderColor: '#67647D', borderWidth: 1, gap: 11, minHeight:185, justifyContent:'center' },
  heroEyebrow: { fontSize: 10, fontWeight: '900', color: colors.gold, letterSpacing: 2.0 },
  heroNumber: { fontSize: 42, fontWeight: '900', color: colors.text, letterSpacing: -1.4 },
  heroCaption: { color: colors.gold, fontWeight: '900', fontSize: 10, letterSpacing: 1.7 },
  heroNote: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  center: { alignItems: 'center', marginTop: 8 },
  recGap: { gap: 10 },
  exChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  exChip: { paddingHorizontal: 12, height: 36, borderRadius: 18, backgroundColor: colors.input, justifyContent: 'center' },
  exChipOn: { backgroundColor: '#594A6D', borderColor:colors.gold, borderWidth:1 },
  exChipText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  exChipTextOn: { color: colors.gold, fontWeight:'900' },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginBottom: 10 },
  muted: { color: colors.textMuted, fontSize: 12 },
  recordGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  record: { flexBasis: '46%', flexGrow: 1, alignItems: 'flex-start', paddingVertical: 18, paddingHorizontal: 18, backgroundColor:'#151C2D' },
  recordValue: { color: colors.text, fontSize: 27, fontWeight: '900', letterSpacing:-.65 },
  recordLabel: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
  heatWrap: { flexDirection: 'row', marginTop: 12, justifyContent: 'center' },
  heatLabels: { marginRight: 6, gap: 4 },
  heatLabel: { color: colors.textMuted, fontSize: 9, height: CELL, lineHeight: CELL },
  heatGrid: { flexDirection: 'row', gap: 4 },
  heatCol: { gap: 4 },
  heatCell: { width: CELL, height: CELL, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  heatRest: { borderWidth: 1, borderColor: colors.gold },
  restIcon: { fontSize: 9 },
  splitBar: { flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', backgroundColor: colors.input, marginVertical: 10 },
  typeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  typeLabel: { color: colors.text, fontSize: 14, flex: 1 },
  typeValue: { color: colors.textMuted, fontSize: 13 }
});
