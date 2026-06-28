import { APP_TIMEZONE } from '@/lib/utils/timezone';

/** Jamaica is UTC-5 year-round (no daylight saving). */
const JAMAICA_UTC_OFFSET_HOURS = 5;

const jamaicaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const jamaicaTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const jamaicaDisplayTimeFormatter = new Intl.DateTimeFormat('en-JM', {
  timeZone: APP_TIMEZONE,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const jamaicaDisplayDateFormatter = new Intl.DateTimeFormat('en-JM', {
  timeZone: APP_TIMEZONE,
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

/** Calendar date string (YYYY-MM-DD) for America/Jamaica. */
export function toJamaicaDateString(date: Date): string {
  return jamaicaDateFormatter.format(date);
}

export function getTodayJamaicaDateString(): string {
  return toJamaicaDateString(new Date());
}

/** Local time string (HH:mm:ss) for America/Jamaica. */
export function toJamaicaTimeString(date: Date): string {
  return jamaicaTimeFormatter.format(date);
}

/** Day of week 0–6 (Sunday–Saturday) in America/Jamaica. */
export function getJamaicaDayOfWeek(date: Date): number {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    weekday: 'short',
  }).format(date);

  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return map[weekday] ?? 0;
}

export function getDayOfWeekForDate(date: string): number {
  return getJamaicaDayOfWeek(jamaicaLocalToUtc(date, '12:00:00'));
}

/** Normalize PostgreSQL TIME values such as `10:00:00` or `10:00:00+00`. */
export function normalizeTimeString(time: string): string {
  return time.slice(0, 8);
}

/**
 * Build a UTC Date from a Jamaica calendar date and local time.
 * America/Jamaica is fixed at UTC-5.
 */
export function jamaicaLocalToUtc(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute, second = '0'] = normalizeTimeString(time).split(':');

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      Number(hour) + JAMAICA_UTC_OFFSET_HOURS,
      Number(minute),
      Number(second),
    ),
  );
}

/** Inclusive day bounds in UTC for a Jamaica calendar date. */
export function getJamaicaDayBounds(date: string): { start: Date; end: Date } {
  const start = jamaicaLocalToUtc(date, '00:00:00');
  const end = jamaicaLocalToUtc(date, '23:59:59');
  end.setMilliseconds(999);
  return { start, end };
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function minutesSinceMidnightJamaica(date: Date): number {
  const [hour, minute, second] = toJamaicaTimeString(date).split(':').map(Number);
  return hour * 60 + minute + second / 60;
}

export function alignToInterval(date: Date, intervalMinutes: number): Date {
  const dateString = toJamaicaDateString(date);
  const totalMinutes = minutesSinceMidnightJamaica(date);
  const alignedMinutes =
    Math.ceil(totalMinutes / intervalMinutes) * intervalMinutes;

  const hours = Math.floor(alignedMinutes / 60);
  const minutes = alignedMinutes % 60;

  return jamaicaLocalToUtc(
    dateString,
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`,
  );
}

export function formatSlotLabel(date: Date): string {
  return jamaicaDisplayTimeFormatter.format(date);
}

export function formatBookingDate(date: string): string {
  return jamaicaDisplayDateFormatter.format(jamaicaLocalToUtc(date, '12:00:00'));
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) {
    return `${remainder} min`;
  }

  if (remainder === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainder} min`;
}

/** Serialize a Date as ISO 8601 UTC for timestamptz columns. */
export function toTimestamptz(date: Date): string {
  return date.toISOString();
}

/** Parse a timestamptz string from Supabase into a Date. */
export function fromTimestamptz(value: string): Date {
  return new Date(value);
}

export function isValidBookingDateString(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/** True when the calendar date is today or in the future (America/Jamaica). */
export function isBookableDateString(date: string): boolean {
  return isValidBookingDateString(date) && date >= getTodayJamaicaDateString();
}

/** True when a slot start time is still in the future for the given booking date. */
export function isBookableSlotStart(
  startTime: Date,
  date: string,
  now: Date = new Date(),
): boolean {
  if (!isBookableDateString(date)) {
    return false;
  }

  if (date > getTodayJamaicaDateString()) {
    return true;
  }

  return startTime.getTime() > now.getTime();
}
