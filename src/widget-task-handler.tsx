'use no memo';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { hasUsageAccess, syncUnlocks } from '../modules/unlock-counter';
import { renderUnlockWidget } from './widgets/render';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetAction, widgetInfo } = props;

  switch (widgetAction) {
    // WIDGET_UPDATE fires on the periodic schedule and on every unlock while
    // our process is alive (see UnlockCounterPackage.kt).
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const days = await syncUnlocks();
      props.renderWidget(renderUnlockWidget(widgetInfo.widgetName, days, hasUsageAccess()));
      break;
    }

    // Taps use OPEN_APP, which the library handles natively.
    default:
      break;
  }
}
