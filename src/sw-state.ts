import AsyncStorage from "@react-native-async-storage/async-storage";

export const SW_KEY = "@sw_state";

export interface SWState {
  isRunning: boolean;
  startTime: number;
  savedTime: number;
  laps: number[];
}

export const INITIAL: SWState = {
  isRunning: false,
  startTime: 0,
  savedTime: 0,
  laps: [],
};

export function computeTime(s: SWState, now = Date.now()): number {
  return s.isRunning ? s.savedTime + (now - s.startTime) : s.savedTime;
}

export async function loadSWState(): Promise<SWState> {
  try {
    const raw = await AsyncStorage.getItem(SW_KEY);
    return raw ? (JSON.parse(raw) as SWState) : INITIAL;
  } catch {
    return INITIAL;
  }
}

export async function saveSWState(state: SWState): Promise<void> {
  try {
    await AsyncStorage.setItem(SW_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}
