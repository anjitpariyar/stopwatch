'use no memo';
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

const BG = '#000000';
const TEXT_DARK = '#F5F5F4';
const MUTED = '#78716C';
const FAINT = '#3A3733';

const RUNNING = '#4CFF7E';
const PAUSED = '#FFE24D';

function accent(isReady: boolean, isRunning: boolean) {
  if (isReady) return MUTED;
  return isRunning ? RUNNING : PAUSED;
}

function pad2(n: number): string {
  return String(Math.floor(n)).padStart(2, '0');
}

function fmtMain(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${pad2(m)}:${pad2(s)}`;
}

function fmtCs(ms: number): string {
  return pad2((ms % 1000) / 10);
}

export interface StopwatchWidgetProps {
  displayTime: number;
  isRunning: boolean;
  lapCount: number;
  widgetSize?: 'large' | 'medium' | 'small' | 'bar';
}

export function StopwatchWidget({
  displayTime,
  isRunning,
  lapCount,
  widgetSize = 'large',
}: StopwatchWidgetProps) {
  const main = fmtMain(displayTime);
  const cs = fmtCs(displayTime);
  const isReady = displayTime === 0 && !isRunning;
  const status = isReady ? 'READY' : isRunning ? 'RUNNING' : 'PAUSED';
  const playIcon = isRunning ? '⏸' : '▶';
  const canReset = !isReady;
  const canLap = isRunning;
  const stateColor = accent(isReady, isRunning);

  // ── Bar ──────────────────────────────────────────────────────
  if (widgetSize === 'bar') {
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
        <FlexWidget style={{ flex: 1 }}>
          <TextWidget
            text={`${main}.${cs}`}
            style={{ fontSize: 22, color: TEXT_DARK, fontFamily: 'monospace' }}
          />
        </FlexWidget>
        <FlexWidget
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: stateColor,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          clickAction="TOGGLE"
        >
          <TextWidget text={playIcon} style={{ fontSize: 14, color: BG }} />
        </FlexWidget>
      </FlexWidget>
    );
  }

  // ── Small (2x2) ──────────────────────────────────────────────
  if (widgetSize === 'small') {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          flexDirection: 'column',
          backgroundColor: BG,
          borderRadius: 20,
          padding: 10,
        }}
        clickAction="OPEN_APP"
      >
        <FlexWidget
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <FlexWidget
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stateColor }}
          />
          <FlexWidget
            style={{
              width: 26, height: 26, borderRadius: 13,
              borderWidth: 1, borderColor: canReset ? TEXT_DARK : FAINT,
              justifyContent: 'center', alignItems: 'center',
            }}
            clickAction="RESET"
          >
            <TextWidget text="↺" style={{ fontSize: 11, color: canReset ? TEXT_DARK : FAINT }} />
          </FlexWidget>
        </FlexWidget>
        <FlexWidget
          style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
        >
          <TextWidget text={main} style={{ fontSize: 22, color: TEXT_DARK, fontFamily: 'monospace' }} />
          <TextWidget text={`.${cs}`} style={{ fontSize: 10, color: MUTED, fontFamily: 'monospace' }} />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <FlexWidget
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: stateColor,
              justifyContent: 'center', alignItems: 'center',
            }}
            clickAction="TOGGLE"
          >
            <TextWidget text={playIcon} style={{ fontSize: 16, color: BG }} />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    );
  }

  // ── Medium ───────────────────────────────────────────────────
  if (widgetSize === 'medium') {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          flexDirection: 'column',
          backgroundColor: BG,
          borderRadius: 20,
          padding: 16,
        }}
        clickAction="OPEN_APP"
      >
        <FlexWidget
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <TextWidget text="STOPWATCH" style={{ fontSize: 8, color: MUTED, fontFamily: 'monospace' }} />
          <TextWidget text={status} style={{ fontSize: 8, color: stateColor, fontFamily: 'monospace' }} />
        </FlexWidget>
        <FlexWidget style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
          <TextWidget text={main} style={{ fontSize: 38, color: TEXT_DARK, fontFamily: 'monospace' }} />
          <TextWidget text={`.${cs}`} style={{ fontSize: 16, color: MUTED, fontFamily: 'monospace' }} />
        </FlexWidget>
        <FlexWidget
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <FlexWidget
            style={{
              width: 36, height: 36, borderRadius: 18,
              borderWidth: 1.5, borderColor: canReset ? TEXT_DARK : FAINT,
              justifyContent: 'center', alignItems: 'center',
            }}
            clickAction="RESET"
          >
            <TextWidget text="↺" style={{ fontSize: 15, color: canReset ? TEXT_DARK : FAINT }} />
          </FlexWidget>
          <FlexWidget
            style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: stateColor,
              justifyContent: 'center', alignItems: 'center',
            }}
            clickAction="TOGGLE"
          >
            <TextWidget text={playIcon} style={{ fontSize: 20, color: BG }} />
          </FlexWidget>
          <FlexWidget
            style={{
              width: 36, height: 36, borderRadius: 18,
              borderWidth: 1.5, borderColor: canLap ? TEXT_DARK : FAINT,
              justifyContent: 'center', alignItems: 'center',
            }}
            clickAction="LAP"
          >
            <TextWidget text="⚑" style={{ fontSize: 13, color: canLap ? TEXT_DARK : FAINT }} />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    );
  }

  // ── Large (default) ──────────────────────────────────────────
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        backgroundColor: BG,
        borderRadius: 24,
        padding: 20,
      }}
      clickAction="OPEN_APP"
    >
      <FlexWidget
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}
      >
        <TextWidget text="STOPWATCH" style={{ fontSize: 9, color: MUTED, fontFamily: 'monospace' }} />
        <TextWidget text={status} style={{ fontSize: 9, color: stateColor, fontFamily: 'monospace' }} />
      </FlexWidget>
      <FlexWidget style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
        <TextWidget text={main} style={{ fontSize: 52, color: TEXT_DARK, fontFamily: 'monospace' }} />
        <TextWidget text={`.${cs}`} style={{ fontSize: 22, color: MUTED, fontFamily: 'monospace' }} />
      </FlexWidget>
      <TextWidget
        text={
          lapCount === 0
            ? 'NO LAPS YET · TAP THE FLAG TO RECORD ONE'
            : `${lapCount} LAP${lapCount === 1 ? '' : 'S'} RECORDED`
        }
        style={{ fontSize: 8, color: MUTED, fontFamily: 'monospace', marginBottom: 14 }}
      />
      <FlexWidget
        style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}
      >
        <FlexWidget
          style={{
            width: 48, height: 48, borderRadius: 24,
            borderWidth: 1.5, borderColor: canReset ? TEXT_DARK : FAINT,
            justifyContent: 'center', alignItems: 'center',
          }}
          clickAction="RESET"
        >
          <TextWidget text="↺" style={{ fontSize: 19, color: canReset ? TEXT_DARK : FAINT }} />
        </FlexWidget>
        <FlexWidget
          style={{
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: stateColor,
            justifyContent: 'center', alignItems: 'center',
          }}
          clickAction="TOGGLE"
        >
          <TextWidget text={playIcon} style={{ fontSize: 26, color: BG }} />
        </FlexWidget>
        <FlexWidget
          style={{
            width: 48, height: 48, borderRadius: 24,
            borderWidth: 1.5, borderColor: canLap ? TEXT_DARK : FAINT,
            justifyContent: 'center', alignItems: 'center',
          }}
          clickAction="LAP"
        >
          <TextWidget text="⚑" style={{ fontSize: 17, color: canLap ? TEXT_DARK : FAINT }} />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
