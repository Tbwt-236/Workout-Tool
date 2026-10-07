import { isUtcTimestamp } from '../domain/time.ts';

export interface HistoryCalendarEntry {
  readonly id: number;
  readonly completedAt: string;
}

export interface CalendarMonth {
  // Gregorian display range; month is 1–12, never the Date constructor's 0–11.
  readonly year: number;
  readonly month: number;
}

export interface HistoryCalendarOptions extends CalendarMonth {
  readonly timeZone: string;
  readonly weekStartsOn?: 'monday' | 'sunday';
}

export interface HistoryCalendarDay<T extends HistoryCalendarEntry> {
  readonly dateKey: string;
  readonly day: number;
  readonly workouts: readonly T[];
}

export interface HistoryCalendarMonth<T extends HistoryCalendarEntry> extends CalendarMonth {
  readonly weekStartsOn: 'monday' | 'sunday';
  readonly cells: readonly (HistoryCalendarDay<T> | null)[];
}

function assertCalendarMonth(value: CalendarMonth): void {
  if (!Number.isInteger(value.year) || value.year < 1 || value.year > 9999
    || !Number.isInteger(value.month) || value.month < 1 || value.month > 12) {
    throw new RangeError('InvalidCalendarMonth');
  }
}

// Presentation only: callers provide the device time zone and immutable, completed records.
// RangeError is an integration/data failure, not an empty calendar or display-ready message.
export function buildHistoryCalendar<T extends HistoryCalendarEntry>(
  workouts: readonly T[], options: HistoryCalendarOptions,
): HistoryCalendarMonth<T> {
  const { year, month, timeZone } = options;
  assertCalendarMonth(options);
  const weekStartsOn = options.weekStartsOn === undefined ? 'monday' : options.weekStartsOn;
  if (weekStartsOn !== 'monday' && weekStartsOn !== 'sunday') throw new RangeError('InvalidWeekStart');
  if (typeof timeZone !== 'string' || !timeZone.trim()) throw new RangeError('InvalidTimeZone');
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone, calendar: 'gregory', numberingSystem: 'latn',
    year: 'numeric', month: '2-digit', day: '2-digit', era: 'short',
  });
  const monthKey = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`;
  const grouped = new Map<string, T[]>();
  const seenIds = new Set<number>();
  for (const workout of workouts) {
    if (!workout || !Number.isSafeInteger(workout.id) || workout.id <= 0 || seenIds.has(workout.id)) {
      throw new RangeError('InvalidHistoryId');
    }
    seenIds.add(workout.id);
    if (!isUtcTimestamp(workout.completedAt)) throw new RangeError('InvalidCompletedAt');
    const utcYear = new Date(workout.completedAt).getUTCFullYear();
    if (utcYear < 1 || utcYear > 9999) throw new RangeError('InvalidCompletedAt');
    const parts = formatter.formatToParts(new Date(workout.completedAt));
    const localYear = Number(parts.find(part => part.type === 'year')!.value);
    if (parts.find(part => part.type === 'era')?.value !== 'AD' || localYear < 1 || localYear > 9999) {
      throw new RangeError('InvalidLocalDate');
    }
    const dateKey = ['year', 'month', 'day'].map(kind => parts.find(part => part.type === kind)!.value.padStart(kind === 'year' ? 4 : 2, '0')).join('-');
    if (!dateKey.startsWith(`${monthKey}-`)) continue;
    const dayWorkouts = grouped.get(dateKey) ?? [];
    dayWorkouts.push(workout);
    grouped.set(dateKey, dayWorkouts);
  }
  for (const dayWorkouts of grouped.values()) {
    dayWorkouts.sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt) || b.id - a.id);
  }
  const first = new Date(0);
  first.setUTCFullYear(year, month - 1, 1);
  const last = new Date(0);
  last.setUTCFullYear(year, month, 0);
  const dayCount = last.getUTCDate();
  const offset = (first.getUTCDay() + (weekStartsOn === 'monday' ? 6 : 0)) % 7;
  const cells = Array.from({ length: Math.ceil((offset + dayCount) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    if (day < 1 || day > dayCount) return null;
    const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`;
    return { dateKey, day, workouts: grouped.get(dateKey) ?? [] };
  });
  return { year, month, weekStartsOn, cells };
}

export function shiftCalendarMonth(month: CalendarMonth, direction: -1 | 1): CalendarMonth {
  assertCalendarMonth(month);
  if (direction !== -1 && direction !== 1) throw new RangeError('InvalidMonthDirection');
  const index = month.year * 12 + month.month - 1 + direction;
  const shifted = { year: Math.floor(index / 12), month: index % 12 + 1 };
  assertCalendarMonth(shifted);
  return shifted;
}
