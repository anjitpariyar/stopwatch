import { requireOptionalNativeModule } from "expo";

/** Per-day unlock counts keyed by local date, e.g. { "2026-10-03": 42 }. */
export type UnlockDays = Record<string, number>;

type UnlockCounterNative = {
  isSupported(): boolean;
  hasUsageAccess(): boolean;
  openUsageAccessSettings(): Promise<void>;
  sync(): Promise<UnlockDays>;
};

// Android-only; null on iOS, web and Expo Go.
const native = requireOptionalNativeModule<UnlockCounterNative>("UnlockCounter");

export function isSupported(): boolean {
  return native?.isSupported() ?? false;
}

export function hasUsageAccess(): boolean {
  return native?.hasUsageAccess() ?? false;
}

export async function openUsageAccessSettings(): Promise<void> {
  await native?.openUsageAccessSettings();
}

/** Folds new unlocks from the system log into the stored history and returns it. */
export async function syncUnlocks(): Promise<UnlockDays> {
  return native ? native.sync() : {};
}
