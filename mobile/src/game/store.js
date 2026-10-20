import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'animefitness:state';

export const INITIAL_STATE = {
  version: 3,
  character: null,
  activities: [],
  questCompletions: [],
  settings: { weeklyGoals: [] },
  program: null,
  programDays: [],
  bodyMeasurements: [],
  recoveryEntries: [],
  trainingPlan: null,
  preferences: { appMode: 'hunter' },
  profile: { goalWeightKg: null },
  lastBackupAt: null
};

export function normalizeState(raw) {
  const data = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const array = (key) => Array.isArray(data[key]) ? data[key] : [];
  const settings = data.settings && typeof data.settings === 'object' ? data.settings : {};
  const profile = data.profile && typeof data.profile === 'object' ? data.profile : {};
  return {
    ...INITIAL_STATE,
    ...data,
    version: 3,
    activities: array('activities'),
    questCompletions: array('questCompletions'),
    programDays: array('programDays'),
    bodyMeasurements: array('bodyMeasurements'),
    recoveryEntries: array('recoveryEntries'),
    trainingPlan: data.trainingPlan && typeof data.trainingPlan === 'object' ? data.trainingPlan : null,
    preferences: { ...INITIAL_STATE.preferences, ...(data.preferences && typeof data.preferences === 'object' ? data.preferences : {}) },
    settings: { ...INITIAL_STATE.settings, ...settings,
      weeklyGoals: Array.isArray(settings.weeklyGoals) ? settings.weeklyGoals : [] },
    profile: { ...INITIAL_STATE.profile, ...profile }
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
