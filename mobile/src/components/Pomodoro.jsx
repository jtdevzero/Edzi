import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useGame } from '../game/GameContext';
import { loadJSON, saveJSON } from '../game/store';
import { pomodoroStatus, formatClock, POMODORO } from '../game/session';
import { beep, keepScreenAwake, unlockAudio } from '../utils/device';
import { confirm } from '../utils/notify';
import { announceReward } from '../utils/rewards';
import { colors, card } from '../theme';

const KEY = 'animefitness:pomodoro';

export default function Pomodoro({ onLogged }) {
  const { logActivity } = useGame();
  const [run, setRun] = useState(undefined);
  const [now, setNow] = useState(Date.now());
  const lastPhase = useRef(null);

  useEffect(() => {
    loadJSON(KEY).then(setRun);
  }, []);

  useEffect(() => {
    if (run !== undefined) saveJSON(KEY, run);
    if (!run) return undefined;
    const tick = setInterval(() => setNow(Date.now()), 500);
    const release = keepScreenAwake();
    return () => {
      clearInterval(tick);
      release();
    };
  }, [run]);

  const status = run ? pomodoroStatus(run.startedAt, now) : null;

  useEffect(() => {
    if (!status) {
      lastPhase.current = null;
      return;
    }
    if (lastPhase.current && lastPhase.current !== status.phase) beep(status.phase === 'break' ? 3 : 2);
    lastPhase.current = status.phase;
  }, [status?.phase]);

  if (run === undefined) return null;

  function start() {
    unlockAudio();
    beep(1);
    setRun({ startedAt: Date.now(), title: 'Pomodoro tanulás' });
  }

  function finish() {
    const minutes = Math.max(1, status.focusMinutes);
    const rounds = Math.max(1, status.completedRounds);
    const result = logActivity({
      type: 'study',
      title: `Pomodoro × ${rounds}`,
      duration: minutes,
      intensity: 6,
      notes: ''
    });
    setRun(null);
    announceReward(result, { title: 'Tanulás kész', message: `${minutes} perc fókusz, ${rounds} kör.` });
    onLogged?.();
  }

  return (
    <View style={[card, styles.gap, run && (status.phase === 'focus' ? styles.focusCard : styles.breakCard)]}>
      <Text style={styles.title}>🍅 Pomodoro</Text>
      {!run ? (
        <>
          <Text style={styles.muted}>{POMODORO.focus} perc fókusz, {POMODORO.break} perc szünet, ismétlés. A végén automatikusan naplózza a tanulást.</Text>
          <Pressable onPress={start} style={styles.primary}>
            <Text style={styles.primaryText}>▶ Indítás</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.phase}>{status.phase === 'focus' ? 'FÓKUSZ' : 'SZÜNET'} · {status.round}. kör</Text>
          <Text style={styles.clock}>{formatClock(status.remaining)}</Text>
          <Text style={styles.mutedCenter}>Eddig {status.focusMinutes} perc fókusz</Text>
          <Pressable onPress={finish} style={styles.primary}>
            <Text style={styles.primaryText}>Befejezés és naplózás</Text>
          </Pressable>
          <Pressable onPress={() => confirm('Pomodoro elvetése', 'Nem kerül naplózásra. Biztos?', () => setRun(null))} hitSlop={8}>
            <Text style={styles.cancel}>Elvetés</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 10 },
  focusCard: { borderColor: colors.red },
  breakCard: { borderColor: colors.green },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  muted: { color: colors.textMuted, fontSize: 12 },
  mutedCenter: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  phase: { color: colors.textSoft, fontWeight: '800', fontSize: 13, letterSpacing: 1, textAlign: 'center' },
  clock: { color: colors.text, fontSize: 56, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] },
  primary: { backgroundColor: colors.primary, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  cancel: { color: colors.textMuted, textAlign: 'center', textDecorationLine: 'underline', paddingVertical: 6 }
});
