import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { computeStats } from '../game/stats';
import { ACTIVITY_TYPES, parseDayKey } from '../game/gamification';
import { colors, card } from '../theme';

const HEAT_COLORS = ['#1a1a35', '#3b2a7a', '#5b3cc4', '#7c3aed', '#a78bfa'];
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
      <Svg width={width} height={height}>
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
  const { records, minutesByType } = stats;
  const totalTypeMinutes = records.totalMinutes || 1;

  return (
    <Screen title="Statisztika">
      <View style={styles.recordGrid}>
        <Record value={`🔥 ${records.longestStreak}`} label="Leghosszabb streak (nap)" />
        <Record value={records.activeDays} label="Aktív napok" />
        <Record value={formatMinutes(records.bestWeekMinutes)} label="Legjobb hét" />
        <Record value={formatMinutes(records.totalMinutes)} label="Összesen" />
      </View>

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
  center: { alignItems: 'center', marginTop: 8 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  muted: { color: colors.textMuted, fontSize: 12 },
  recordGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  record: { flexBasis: '47%', flexGrow: 1, alignItems: 'center', paddingVertical: 14 },
  recordValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  recordLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2, textAlign: 'center' },
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
