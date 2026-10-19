import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadState, saveState, INITIAL_STATE } from './store';
import { computeProgress, dayKey, weekKey } from './gamification';
import { questsForDay } from './quests';
import { computeAchievements, newlyUnlocked } from './achievements';
import { programRunStatus, getProgram } from './programs';

const GameContext = createContext(null);

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GameProvider({ children }) {
  const [state, setState] = useState(null);
  const [today, setToday] = useState(dayKey());

  useEffect(() => {
    loadState().then(setState);
  }, []);

  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  useEffect(() => {
    const timer = setInterval(() => setToday(dayKey()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const value = useMemo(() => {
    if (!state) return null;
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
        achievements: newlyUnlocked(achievements, computeAchievements(nextState, after))
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
      logActivity({ type, title, duration, intensity, notes, templateId }) {
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
        return commit({ ...state, activities: [...state.activities, activity] });
      },
      deleteActivity(id) {
        setState((s) => ({ ...s, activities: s.activities.filter((a) => a.id !== id) }));
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
        const entry = {
          programId: state.program.id,
          runStart: state.program.startDate,
          day: programStatus.doneCount + 1,
          date: today
        };
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
        setState({ ...imported, lastBackupAt: new Date().toISOString() });
      },
      resetAll() {
        setState(INITIAL_STATE);
      }
    };
  }, [state, today]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
