import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'animefitness:state';

export const INITIAL_STATE = {
  version: 1,
  character: null,
  activities: [],
  questCompletions: []
};

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_STATE, ...parsed };
  } catch {
    return INITIAL_STATE;
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
