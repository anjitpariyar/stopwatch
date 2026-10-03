'use no memo';
import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import type { UnlockDays } from '../../modules/unlock-counter';
import { countOn, dailyAverage, lastNDays } from '../unlock-stats';
import { UnlockWidget, type UnlockWidgetSize } from './UnlockWidget';

// Must match the widget names in app.json.
export const WIDGETS: Record<string, UnlockWidgetSize> = {
  UnlocksSmall: 'small',
  UnlocksMedium: 'medium',
  UnlocksBar: 'bar',
};

export function renderUnlockWidget(widgetName: string, days: UnlockDays, hasAccess: boolean) {
  const now = new Date();
  return (
    <UnlockWidget
      today={countOn(days, now)}
      average={dailyAverage(days, now)}
      week={lastNDays(days, 7, now)}
      hasAccess={hasAccess}
      widgetSize={WIDGETS[widgetName] ?? 'small'}
    />
  );
}

/** Re-renders every placed widget from the app side. */
export async function pushWidgetUpdate(days: UnlockDays, hasAccess: boolean) {
  for (const widgetName of Object.keys(WIDGETS)) {
    try {
      await requestWidgetUpdate({
        widgetName,
        renderWidget: () => renderUnlockWidget(widgetName, days, hasAccess),
        widgetNotFound: () => {},
      });
    } catch {
      // widget not on home screen or not available (Expo Go)
    }
  }
}
