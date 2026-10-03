import type { UnlockDays } from "../modules/unlock-counter";

export type Period = "day" | "week" | "month" | "year";

export interface PeriodRow {
  key: string;
  label: string;
  sublabel: string;
  count: number;
  /** Days of this period that have elapsed and are tracked, for per-day averages. */
  dayCount: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Local-date key matching the native store's "yyyy-MM-dd". */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Weeks start on Monday. */
function startOfWeek(d: Date): Date {
  const offset = (d.getDay() + 6) % 7;
  return addDays(startOfDay(d), -offset);
}

function fmtShort(d: Date) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function countOn(days: UnlockDays, d: Date): number {
  return days[dayKey(d)] ?? 0;
}

/** Earliest tracked day, or today when nothing is recorded yet. */
function firstDay(days: UnlockDays, today: Date): Date {
  const keys = Object.keys(days);
  if (keys.length === 0) return today;
  return parseKey(keys.reduce((a, b) => (a < b ? a : b)));
}

/** The last `n` days, oldest first, ending today. */
export function lastNDays(days: UnlockDays, n: number, now = new Date()) {
  const today = startOfDay(now);
  return Array.from({ length: n }, (_, i) => {
    const d = addDays(today, i - (n - 1));
    return { date: d, letter: WEEKDAYS[d.getDay()][0], count: countOn(days, d) };
  });
}

/** Mean unlocks per completed day (today excluded so a fresh morning doesn't drag it down). */
export function dailyAverage(days: UnlockDays, now = new Date()): number {
  const today = startOfDay(now);
  const first = firstDay(days, today);
  let total = 0;
  let n = 0;
  for (let d = first; d < today; d = addDays(d, 1)) {
    total += countOn(days, d);
    n++;
  }
  return n === 0 ? 0 : Math.round(total / n);
}

export function weekTotal(days: UnlockDays, now = new Date()): number {
  const today = startOfDay(now);
  let total = 0;
  for (let d = startOfWeek(today); d <= today; d = addDays(d, 1)) total += countOn(days, d);
  return total;
}

/** History grouped by period, newest first, from the first tracked day to today. */
export function groupHistory(days: UnlockDays, period: Period, now = new Date()): PeriodRow[] {
  const today = startOfDay(now);
  const first = firstDay(days, today);
  const rows = new Map<string, PeriodRow>();

  for (let d = first; d <= today; d = addDays(d, 1)) {
    let key: string;
    let label: string;
    let sublabel: string;

    if (period === "day") {
      key = dayKey(d);
      const ago = Math.round((today.getTime() - d.getTime()) / 86400000);
      label = ago === 0 ? "Today" : ago === 1 ? "Yesterday" : `${WEEKDAYS[d.getDay()]}, ${fmtShort(d)}`;
      sublabel = ago <= 1 ? fmtShort(d) : d.getFullYear() === today.getFullYear() ? "" : String(d.getFullYear());
    } else if (period === "week") {
      const start = startOfWeek(d);
      const end = addDays(start, 6);
      key = dayKey(start);
      label = start.getTime() === startOfWeek(today).getTime() ? "This week" : `${fmtShort(start)} – ${fmtShort(end)}`;
      sublabel = String(start.getFullYear());
    } else if (period === "month") {
      key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
      label = MONTHS[d.getMonth()];
      sublabel = String(d.getFullYear());
    } else {
      key = String(d.getFullYear());
      label = key;
      sublabel = "";
    }

    const row = rows.get(key) ?? { key, label, sublabel, count: 0, dayCount: 0 };
    row.count += countOn(days, d);
    row.dayCount += 1;
    rows.set(key, row);
  }

  return [...rows.values()].reverse();
}
