import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'animefitness:state';

export const INITIAL_STATE = {
  version: 1,
  character: null,
  activities: [],
  questCompletions: [],
  settings: { weeklyGoals: [] },
  program: null,
  programDays: [],
  lastBackupAt: null
};

export function normalizeState(raw) {
  return {
    ...INITIAL_STATE,
    ...raw,
    settings: { ...INITIAL_STATE.settings, ...raw.settings }
  };
}

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    return normalizeState(JSON.parse(raw));
  } catch {
    return INITIAL_STATE;
  }
}

export async function loadJSON(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveJSON(key, value) {
  try {
    if (value == null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); the in-memory value still works.
  }
}

export async function saveState(state) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
