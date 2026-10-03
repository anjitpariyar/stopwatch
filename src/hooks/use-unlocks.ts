import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import {
  hasUsageAccess,
  isSupported,
  openUsageAccessSettings,
  syncUnlocks,
  type UnlockDays,
} from "../../modules/unlock-counter";
import { pushWidgetUpdate } from "../widgets/render";

export function useUnlocks() {
  const [days, setDays] = useState<UnlockDays>({});
  const [hasAccess, setHasAccess] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const access = hasUsageAccess();
    const next = await syncUnlocks();
    setHasAccess(access);
    setDays(next);
    setLoaded(true);
    pushWidgetUpdate(next, access);
  }, []);

  // Sync on mount and on every return to the foreground. Coming back from the
  // Usage access settings screen lands here too, so the grant shows up at once.
  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return {
    days,
    hasAccess,
    loaded,
    supported: isSupported(),
    requestAccess: openUsageAccessSettings,
  };
}
