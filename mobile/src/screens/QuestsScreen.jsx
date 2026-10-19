import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { CATEGORY_LABELS } from '../game/quests';
import { PROGRAMS, programDayXP } from '../game/programs';
import { confirm } from '../utils/notify';
import { announceReward } from '../utils/rewards';
import { unlockAudio } from '../utils/device';
import { createSession } from '../game/session';
import { colors, card } from '../theme';

const CATEGORY_COLORS = { physical: colors.red, mental: colors.blue, recovery: colors.green };

function ProgramPicker({ onStart }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[card, styles.gap]}>
      <Pressable onPress={() => setOpen(!open)} style={styles.pickerHead}>
        <View style={styles.flex}>
          <Text style={styles.sectionTitle}>🥋 Kihívás programok</Text>
          <Text style={styles.muted}>Többhetes terv, minden napra pontos feladattal.</Text>
        </View>
        <Text style={styles.muted}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open && PROGRAMS.map((p) => (
        <View key={p.id} style={styles.programOption}>
          <Text style={styles.programName}>{p.emoji} {p.name} <Text style={styles.muted}>· {p.days.length} nap</Text></Text>
          <Text style={styles.muted}>{p.description}</Text>
          <Text style={styles.muted}>1. nap: {p.days[0].tasks.join(', ')}</Text>
          <Pressable onPress={() => onStart(p)} style={styles.outlineBtn}>
            <Text style={styles.outlineText}>Indítás</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function ActiveProgram({ status, onComplete, onAbandon, onWorkout }) {
  const { program, doneCount, doneToday, currentDay, today } = status;
  const pct = doneCount / program.days.length;
  return (
    <View style={[card, styles.gap, styles.programCard]}>
      <View style={styles.badges}>
        <Text style={styles.programTag}>{program.emoji} {program.name}</Text>
        <Text style={styles.xp}>+{programDayXP(program.id, currentDay)} XP</Text>
      </View>
      <Text style={styles.title}>{currentDay}. nap: {today.title}</Text>
      {today.tasks.map((t) => <Text key={t} style={styles.task}>• {t}</Text>)}
      <View style={styles.track}><View style={[styles.fill, { width: `${pct * 100}%` }]} /></View>
      <Text style={styles.muted}>{doneCount}/{program.days.length} nap kész</Text>
      {!doneToday && today.exercises && (
        <Pressable onPress={onWorkout} style={styles.workoutBtn}>
          <Text style={styles.workoutText}>▶ Edzésmódban (számlálóval)</Text>
        </Pressable>
      )}
      <Pressable disabled={doneToday} onPress={onComplete} style={[styles.button, doneToday && styles.buttonDone]}>
        <Text style={styles.buttonText}>{doneToday ? '✅ A mai programnap kész' : 'Megcsináltam'}</Text>
      </Pressable>
      {doneToday && <Text style={styles.mutedCenter}>Holnap jön a {currentDay + 1}. nap.</Text>}
      <Pressable onPress={onAbandon} hitSlop={8}>
        <Text style={styles.abandon}>Program feladása</Text>
      </Pressable>
    </View>
  );
}

export default function QuestsScreen() {
  const { state, quests, completeQuest, programStatus, startProgram, abandonProgram, completeProgramDay, startSession } = useGame();
  const allDone = quests.every((q) => q.completed);

  function complete(q) {
    const result = completeQuest(q.id);
    if (result) announceReward(result, { title: 'Quest kész', message: q.title });
  }

  function start(p) {
    confirm(p.name, `${p.days.length} napos program. Minden nap egy feladat, a kihagyott nap nem büntet. Indulhat?`, () => startProgram(p.id));
  }

  function completeDay() {
    const result = completeProgramDay();
    if (!result) return;
    announceReward(result, {
      title: 'Programnap kész',
      message: result.finished
        ? `🎉 Teljesítetted a teljes programot: ${programStatus.program.name}!`
        : `${programStatus.program.name}: ${programStatus.currentDay}. nap`
    });
  }

  return (
    <Screen title="Questek" subtitle="Napi questek és kihívás programok.">
      {programStatus ? (
        <ActiveProgram
          status={programStatus}
          onComplete={completeDay}
          onWorkout={() => {
            unlockAudio();
            startSession(createSession({
              title: `${programStatus.program.name} · ${programStatus.currentDay}. nap`,
              program: state.program,
              exercises: programStatus.today.exercises
            }));
          }}
          onAbandon={() => confirm('Program feladása', 'Az eddigi napok XP-je megmarad, de újrakezdésnél az 1. naptól indul. Biztos?', abandonProgram)}
        />
      ) : (
        <ProgramPicker onStart={start} />
      )}

      <Text style={styles.heading}>Napi questek</Text>
      <Text style={styles.muted}>Minden nap 3 új quest. Éjfélkor frissülnek.</Text>
      {allDone && (
        <View style={[card, styles.celebrate]}>
          <Text style={styles.celebrateText}>🏆 Minden mai quest kész! Holnap újak jönnek.</Text>
        </View>
      )}
      {quests.map((q) => (
        <View key={q.id} style={[card, styles.quest, q.completed && styles.questDone]}>
          <View style={styles.badges}>
            <Text style={[styles.badge, { color: CATEGORY_COLORS[q.category], borderColor: CATEGORY_COLORS[q.category] }]}>
              {CATEGORY_LABELS[q.category]}
            </Text>
            <Text style={styles.xp}>+{q.xp} XP</Text>
          </View>
          <Text style={styles.title}>{q.title}</Text>
          <Text style={styles.desc}>{q.description}</Text>
          <Pressable disabled={q.completed} onPress={() => complete(q)} style={[styles.button, q.completed && styles.buttonDone]}>
            <Text style={styles.buttonText}>{q.completed ? '✅ Teljesítve' : 'Teljesítettem'}</Text>
          </Pressable>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: 8 },
  heading: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  muted: { color: colors.textMuted, fontSize: 12 },
  mutedCenter: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  pickerHead: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 8 },
  programOption: { backgroundColor: colors.input, borderRadius: 12, padding: 12, gap: 6 },
  programName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  outlineBtn: { borderColor: colors.primary, borderWidth: 1, borderRadius: 10, height: 44, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  outlineText: { color: colors.primarySoft, fontWeight: '700' },
  programCard: { borderColor: colors.gold },
  programTag: { color: colors.gold, fontWeight: '700', fontSize: 13, flex: 1 },
  task: { color: colors.text, fontSize: 15 },
  track: { height: 8, backgroundColor: '#1e1b4b', borderRadius: 4, overflow: 'hidden', marginTop: 4 },
  fill: { height: '100%', backgroundColor: colors.gold },
  workoutBtn: { backgroundColor: colors.green, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  workoutText: { color: '#052e16', fontWeight: '800', fontSize: 15 },
  abandon: { color: colors.textMuted, fontSize: 12, textAlign: 'center', textDecorationLine: 'underline', paddingVertical: 6 },
  celebrate: { borderColor: colors.gold, alignItems: 'center' },
  celebrateText: { color: colors.gold, fontWeight: '700', fontSize: 15, textAlign: 'center' },
  quest: { gap: 8 },
  questDone: { opacity: 0.6 },
  badges: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  badge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, fontWeight: '700', overflow: 'hidden' },
  xp: { color: colors.primarySoft, fontWeight: '800', fontSize: 14 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  desc: { color: colors.textMuted, fontSize: 14 },
  button: { backgroundColor: colors.primary, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  buttonDone: { backgroundColor: '#14532d' },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 }
});
