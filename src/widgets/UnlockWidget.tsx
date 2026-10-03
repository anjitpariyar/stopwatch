'use no memo';
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

const BG = '#000000';
const TEXT = '#F5F5F4';
const MUTED = '#78716C';
const FAINT = '#2A2724';
const ACCENT = '#4CFF7E';

const BAR_MAX = 44;

export type UnlockWidgetSize = 'small' | 'medium' | 'bar';

export interface UnlockWidgetProps {
  today: number;
  average: number;
  /** Last 7 days, oldest first; the last entry is today. */
  week: { letter: string; count: number }[];
  hasAccess: boolean;
  widgetSize?: UnlockWidgetSize;
}

function NoAccess({ radius }: { radius: number }) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: BG,
        borderRadius: radius,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget text="UNLOCKS" style={{ fontSize: 9, color: MUTED, fontFamily: 'monospace' }} />
      <TextWidget
        text="Tap to grant usage access"
        style={{ fontSize: 11, color: TEXT, fontFamily: 'monospace', marginTop: 4, textAlign: 'center' }}
      />
    </FlexWidget>
  );
}

export function UnlockWidget({ today, average, week, hasAccess, widgetSize = 'small' }: UnlockWidgetProps) {
  const avgLabel = average > 0 ? `AVG ${average}/DAY` : 'TODAY';

  // ── Bar ──────────────────────────────────────────────────────
  if (widgetSize === 'bar') {
    if (!hasAccess) return <NoAccess radius={16} />;
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: BG,
          borderRadius: 16,
          paddingHorizontal: 18,
        }}
        clickAction="OPEN_APP"
      >
        <FlexWidget style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT, marginRight: 10 }} />
        <FlexWidget style={{ flex: 1 }}>
          <TextWidget text="UNLOCKS TODAY" style={{ fontSize: 10, color: MUTED, fontFamily: 'monospace' }} />
        </FlexWidget>
        <TextWidget text={String(today)} style={{ fontSize: 24, color: TEXT, fontFamily: 'monospace' }} />
      </FlexWidget>
    );
  }

  // ── Small (2x2) ──────────────────────────────────────────────
  if (widgetSize === 'small') {
    if (!hasAccess) return <NoAccess radius={20} />;
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          flexDirection: 'column',
          backgroundColor: BG,
          borderRadius: 20,
          padding: 14,
        }}
        clickAction="OPEN_APP"
      >
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FlexWidget style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT, marginRight: 6 }} />
          <TextWidget text="UNLOCKS" style={{ fontSize: 9, color: MUTED, fontFamily: 'monospace' }} />
        </FlexWidget>
        <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'center', alignItems: 'center' }}>
          <TextWidget text={String(today)} style={{ fontSize: 44, color: TEXT, fontFamily: 'monospace' }} />
        </FlexWidget>
        <FlexWidget style={{ width: 'match_parent', alignItems: 'center' }}>
          <TextWidget text={avgLabel} style={{ fontSize: 8, color: MUTED, fontFamily: 'monospace' }} />
        </FlexWidget>
      </FlexWidget>
    );
  }

  // ── Medium (4x2): today + last 7 days ────────────────────────
  if (!hasAccess) return <NoAccess radius={20} />;
  const max = Math.max(1, ...week.map((d) => d.count));
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BG,
        borderRadius: 20,
        padding: 16,
      }}
      clickAction="OPEN_APP"
    >
      <FlexWidget style={{ flexDirection: 'column', justifyContent: 'center', marginRight: 16 }}>
        <TextWidget text="UNLOCKS" style={{ fontSize: 9, color: MUTED, fontFamily: 'monospace' }} />
        <TextWidget text={String(today)} style={{ fontSize: 40, color: TEXT, fontFamily: 'monospace' }} />
        <TextWidget text={avgLabel} style={{ fontSize: 8, color: MUTED, fontFamily: 'monospace' }} />
      </FlexWidget>
      <FlexWidget style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {week.map((d, i) => {
          const isToday = i === week.length - 1;
          return (
            <FlexWidget key={i} style={{ flexDirection: 'column', alignItems: 'center' }}>
              <FlexWidget style={{ height: BAR_MAX, justifyContent: 'flex-end' }}>
                <FlexWidget
                  style={{
                    width: 10,
                    height: Math.max(2, Math.round((d.count / max) * BAR_MAX)),
                    borderRadius: 3,
                    backgroundColor: isToday ? ACCENT : d.count > 0 ? MUTED : FAINT,
                  }}
                />
              </FlexWidget>
              <TextWidget
                text={d.letter}
                style={{ fontSize: 8, color: isToday ? ACCENT : MUTED, fontFamily: 'monospace', marginTop: 4 }}
              />
            </FlexWidget>
          );
        })}
      </FlexWidget>
    </FlexWidget>
  );
}
