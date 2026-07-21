import { useEffect, useRef, useState, useCallback } from "react";
import { AppState } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";
import React from "react";
import { StopwatchWidget } from "../widgets/StopwatchWidget";
import {
  computeTime,
  INITIAL,
  loadSWState,
  saveSWState,
  type SWState,
} from "../sw-state";

const WIDGET_SIZES = [
  ["StopwatchLarge", "large"],
  ["StopwatchMedium", "medium"],
  ["StopwatchSmall", "small"],
  ["StopwatchBar", "bar"],
] as const;

const WIDGET_TICK_MS = 1000;

async function pushWidgetUpdate(state: SWState, now: number) {
  const displayTime = computeTime(state, now);
  for (const [name, size] of WIDGET_SIZES) {
    try {
      await requestWidgetUpdate({
        widgetName: name,
        renderWidget: () =>
          React.createElement(StopwatchWidget, {
            displayTime,
            isRunning: state.isRunning,
            lapCount: state.laps.length,
            widgetSize: size,
          }),
        widgetNotFound: () => {},
      });
    } catch {
      // widget not on home screen or not available (Expo Go)
    }
  }
}

export function useStopwatch() {
  const [swState, setSwState] = useState<SWState>(INITIAL);
  const [displayTime, setDisplayTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // keep a ref that always holds the latest state for use in intervals
  const stateRef = useRef<SWState>(INITIAL);
  const lastWidgetPushRef = useRef(0);

  const stopTick = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTick = (state: SWState) => {
    stopTick();
    lastWidgetPushRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setDisplayTime(computeTime(stateRef.current, now));
      // Widget re-renders aren't free (RemoteViews redraw), so push at 1s
      // cadence rather than every 16ms tick. Without this the widget only
      // ever reflected the moment start/pause/lap/reset was pressed.
      if (now - lastWidgetPushRef.current >= WIDGET_TICK_MS) {
        lastWidgetPushRef.current = now;
        pushWidgetUpdate(stateRef.current, now);
      }
    }, 16);
  };

  const applyState = useCallback((state: SWState) => {
    stateRef.current = state;
    setSwState(state);
    if (state.isRunning) {
      setDisplayTime(computeTime(state, Date.now()));
      startTick(state);
    } else {
      stopTick();
      setDisplayTime(state.savedTime);
    }
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    loadSWState().then(applyState);
    return stopTick;
  }, []);

  // Re-sync when app comes back to foreground (widget may have changed state)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") loadSWState().then(applyState);
    });
    return () => sub.remove();
  }, [applyState]);

  const start = useCallback(() => {
    const now = Date.now();
    const next: SWState = { ...stateRef.current, isRunning: true, startTime: now };
    applyState(next);
    saveSWState(next);
    pushWidgetUpdate(next, now);
  }, [applyState]);

  const pause = useCallback(() => {
    const now = Date.now();
    const saved = stateRef.current.savedTime + (now - stateRef.current.startTime);
    const next: SWState = { ...stateRef.current, isRunning: false, savedTime: saved };
    applyState(next);
    saveSWState(next);
    pushWidgetUpdate(next, now);
  }, [applyState]);

  const reset = useCallback(() => {
    applyState(INITIAL);
    saveSWState(INITIAL);
    pushWidgetUpdate(INITIAL, Date.now());
  }, [applyState]);

  const lap = useCallback(() => {
    const now = Date.now();
    const currentTime = computeTime(stateRef.current, now);
    const next: SWState = {
      ...stateRef.current,
      laps: [currentTime, ...stateRef.current.laps],
    };
    applyState(next);
    saveSWState(next);
    pushWidgetUpdate(next, now);
  }, [applyState]);

  const isReady = !swState.isRunning && swState.savedTime === 0 && swState.laps.length === 0;

  return {
    displayTime,
    isRunning: swState.isRunning,
    isReady,
    laps: swState.laps,
    start,
    pause,
    reset,
    lap,
  };
}
