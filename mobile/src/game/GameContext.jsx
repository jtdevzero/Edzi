import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadState, saveState, loadJSON, saveJSON, INITIAL_STATE } from './store';
import { computeProgress, dayKey, weekKey } from './gamification';
import { questsForDay } from './quests';
import { computeAchievements, newlyUnlocked } from './achievements';
import { programRunStatus, getProgram } from './programs';
import { computeExerciseRecords, newRecords } from './stats';
import { sessionMinutes } from './session';

const SESSION_KEY = 'animefitness:session';

const GameContext = createContext(null);

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GameProvider({ children }) {
  const [state, setState] = useState(null);
  const [today, setToday] = useState(dayKey());
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    loadState().then(setState);
    loadJSON(SESSION_KEY).then(setSession);
  }, []);

  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  useEffect(() => {
    if (session !== undefined) saveJSON(SESSION_KEY, session);
  }, [session]);

  useEffect(() => {
    const timer = setInterval(() => setToday(dayKey()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const value = useMemo(() => {
    if (!state || session === undefined) return null;
    const progress = computeProgress(state, today);
    const achievements = computeAchievements(state, progress);
    const completedToday = new Set(
      state.questCompletions.filter((c) => c.date === today).map((c) => c.questId)
    );
    const quests = questsForDay(today).map((q) => ({ ...q, completed: completedToday.has(q.id) }));
    const programStatus = programRunStatus(state, today);

    function commit(nextState) {
      const after = computeProgress(nextState, today);
      setState(nextState);
      return {
        xpGained: after.totalXP - progress.totalXP,
        leveledUp: after.level > progress.level,
        evolved: after.evolutionStage > progress.evolutionStage,
        level: after.level,
        achievements: newlyUnlocked(achievements, computeAchievements(nextState, after)),
        records: newRecords(
          computeExerciseRecords(state),
          computeExerciseRecords(nextState),
          (nextState.activities.at(-1)?.exercises ?? []).map((e) => e.name)
        )
      };
    }

    function buildActivity({ type, title, duration, intensity, notes, templateId, exercises }) {
      const activity = {
        id: newId(),
        type,
        title,
        duration,
        intensity,
        notes,
        templateId: templateId ?? null,
        date: new Date().toISOString()
      };
      if (exercises?.length) activity.exercises = exercises;
      return activity;
    }

    function programDayEntry(activityId = null) {
      return {
        ...(activityId ? { activityId } : {}),
        programId: state.program.id,
        runStart: state.program.startDate,
        day: programStatus.doneCount + 1,
        date: today
      };
    }

    return {
      state,
      progress,
      achievements,
      quests,
      programStatus,
      createCharacter(name, classId) {
        setState((s) => ({ ...s, character: { name, classId, createdAt: new Date().toISOString() } }));
      },
      session,
      logActivity(input) {
        return commit({ ...state, activities: [...state.activities, buildActivity(input)] });
      },
      startSession(newSession) {
        setSession(newSession);
      },
      updateSession(updater) {
        setSession((s) => (s ? updater(s) : s));
      },
      discardSession() {
        setSession(null);
      },
      finishSession(intensity) {
        const exercises = session.exercises
          .filter((e) => e.sets.length)
          .map(({ name, unit, sets }) => ({ name, unit, sets }));
        const activity = buildActivity({
          type: 'workout',
          title: session.title,
          duration: sessionMinutes(session),
          intensity,
          notes: '',
          templateId: session.templateId,
          exercises
        });
        const completesProgram = Boolean(
          session.program && programStatus && !programStatus.doneToday && !programStatus.finished &&
          session.program.id === state.program?.id && session.program.startDate === state.program?.startDate
        );
        let nextState = { ...state, activities: [...state.activities, activity] };
        let finishedProgram = false;
        if (completesProgram) {
          const entry = programDayEntry(activity.id);
          finishedProgram = entry.day >= programStatus.program.days.length;
          nextState = { ...nextState, programDays: [...state.programDays, entry], program: finishedProgram ? null : state.program };
        }
        setSession(null);
        return { ...commit(nextState), programDay: completesProgram, finishedProgram };
      },
      deleteActivity(id) {
        setState((s) => ({
          ...s,
          activities: s.activities.filter((a) => a.id !== id),
          // XP for a program day linked to the deleted workout must also disappear.
          programDays: s.programDays.filter((d) => d.activityId !== id)
        }));
      },
      completeQuest(questId) {
        if (completedToday.has(questId)) return null;
        return commit({ ...state, questCompletions: [...state.questCompletions, { questId, date: today }] });
      },
      startProgram(programId) {
        if (!getProgram(programId)) return;
        setState((s) => ({ ...s, program: { id: programId, startDate: today } }));
      },
      abandonProgram() {
        setState((s) => ({ ...s, program: null }));
      },
      completeProgramDay() {
        if (!programStatus || programStatus.doneToday || programStatus.finished) return null;
        const entry = programDayEntry();
        const finished = entry.day >= programStatus.program.days.length;
        const result = commit({
          ...state,
          programDays: [...state.programDays, entry],
          program: finished ? null : state.program
        });
        return { ...result, finished };
      },
      setWeeklyGoal(goal) {
        const from = weekKey(today);
        setState((s) => ({
          ...s,
          settings: {
            ...s.settings,
            weeklyGoals: [...s.settings.weeklyGoals.filter((g) => g.from !== from), { from, goal }]
          }
        }));
      },
      markBackedUp() {
        setState((s) => ({ ...s, lastBackupAt: new Date().toISOString() }));
      },
      importState(imported) {
        setSession(null);
        setState({ ...imported, lastBackupAt: new Date().toISOString() });
      },
      resetAll() {
        setState(INITIAL_STATE);
      }
    };
  }, [state, today, session]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
