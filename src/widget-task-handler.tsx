'use no memo';
import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { StopwatchWidget } from './widgets/StopwatchWidget';
import { computeTime, INITIAL, loadSWState, saveSWState } from './sw-state';
import type { SWState } from './sw-state';

type WidgetName = 'StopwatchLarge' | 'StopwatchMedium' | 'StopwatchSmall' | 'StopwatchBar';
type WidgetSize = 'large' | 'medium' | 'small' | 'bar';

const NAME_TO_SIZE: Record<WidgetName, WidgetSize> = {
  StopwatchLarge: 'large',
  StopwatchMedium: 'medium',
  StopwatchSmall: 'small',
  StopwatchBar: 'bar',
};

function renderFor(name: string, state: SWState, now: number) {
  const size = NAME_TO_SIZE[name as WidgetName] ?? 'large';
  const displayTime = computeTime(state, now);
  return (
    <StopwatchWidget
      displayTime={displayTime}
      isRunning={state.isRunning}
      lapCount={state.laps.length}
      widgetSize={size}
    />
  );
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetAction, widgetInfo, clickAction } = props;
  const widgetName = widgetInfo.widgetName;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const state = await loadSWState();
      props.renderWidget(renderFor(widgetName, state, Date.now()));
      break;
    }

    case 'WIDGET_CLICK': {
      const state = await loadSWState();
      const now = Date.now();

      if (clickAction === 'TOGGLE') {
        let next: SWState;
        if (state.isRunning) {
          const saved = state.savedTime + (now - state.startTime);
          next = { ...state, isRunning: false, savedTime: saved };
        } else {
          next = { ...state, isRunning: true, startTime: now };
        }
        await saveSWState(next);
        props.renderWidget(renderFor(widgetName, next, now));

      } else if (clickAction === 'LAP' && state.isRunning) {
        const currentTime = computeTime(state, now);
        const next: SWState = { ...state, laps: [currentTime, ...state.laps] };
        await saveSWState(next);
        props.renderWidget(renderFor(widgetName, next, now));

      } else if (clickAction === 'RESET') {
        await saveSWState(INITIAL);
        props.renderWidget(renderFor(widgetName, INITIAL, now));

      } else {
        // OPEN_APP or unknown — no re-render needed
      }
      break;
    }

    case 'WIDGET_DELETED':
      break;

    default:
      break;
  }
}
