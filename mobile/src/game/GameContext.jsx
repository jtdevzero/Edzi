import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadState, saveState, INITIAL_STATE } from './store';
import { computeProgress, dayKey } from './gamification';
import { questsForDay } from './quests';

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
    const completedToday = new Set(
      state.questCompletions.filter((c) => c.date === today).map((c) => c.questId)
    );
    const quests = questsForDay(today).map((q) => ({ ...q, completed: completedToday.has(q.id) }));

    return {
      state,
      progress,
      quests,
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
        const before = computeProgress(state, today);
        const nextState = { ...state, activities: [...state.activities, activity] };
        const after = computeProgress(nextState, today);
        setState(nextState);
        return {
          xpGained: after.totalXP - before.totalXP,
          leveledUp: after.level > before.level,
          evolved: after.evolutionStage > before.evolutionStage,
          level: after.level
        };
      },
      deleteActivity(id) {
        setState((s) => ({ ...s, activities: s.activities.filter((a) => a.id !== id) }));
      },
      completeQuest(questId) {
        if (completedToday.has(questId)) return null;
        const before = computeProgress(state, today);
        const nextState = {
          ...state,
          questCompletions: [...state.questCompletions, { questId, date: today }]
        };
        const after = computeProgress(nextState, today);
        setState(nextState);
        return { xpGained: after.totalXP - before.totalXP, leveledUp: after.level > before.level };
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
