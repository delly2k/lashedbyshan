import {
  DEFAULT_BUFFER_MINUTES,
  DEFAULT_SLOT_INTERVAL_MINUTES,
  isBlockingAppointmentStatus,
} from '@/lib/booking/constants';
import type {
  Appointment,
  AvailabilityOverride,
  AvailabilityRule,
  Service,
  UnavailableBlock,
} from '@/lib/supabase/database.types';
import {
  addMinutes,
  alignToInterval,
  formatSlotLabel,
  getDayOfWeekForDate,
  getJamaicaDayBounds,
  getTodayJamaicaDateString,
  isBookableSlotStart,
  jamaicaLocalToUtc,
  normalizeTimeString,
} from '@/lib/utils/datetime';
import {
  clipRangeToBounds,
  createRange,
  mergeOverlappingRanges,
  rangeContains,
  sortRanges,
  subtractRanges,
  type TimeRange,
} from '@/lib/booking/ranges';

export type BookingSlot = {
  startTime: Date;
  endTime: Date;
  serviceEndTime: Date;
  date: string;
  label: string;
};

export type DayAvailability = {
  date: string;
  dayOfWeek: number;
  windows: TimeRange[];
};

export type DayBookingContext = {
  date: string;
  rules: AvailabilityRule[];
  overrides: AvailabilityOverride[];
  unavailableBlocks: Array<Pick<UnavailableBlock, 'start_time' | 'end_time'>>;
  blockingAppointments: Array<
    Pick<Appointment, 'start_time' | 'end_time' | 'status'>
  >;
};

export type SlotGenerationOptions = {
  intervalMinutes?: number;
};

function timeOnDateToRange(date: string, startTime: string, endTime: string): TimeRange {
  return createRange(
    jamaicaLocalToUtc(date, normalizeTimeString(startTime)),
    jamaicaLocalToUtc(date, normalizeTimeString(endTime)),
  );
}

function timestamptzToRange(startTime: string, endTime: string): TimeRange {
  return createRange(new Date(startTime), new Date(endTime));
}

function getRegularWindowsForDate(
  rules: AvailabilityRule[],
  date: string,
): TimeRange[] {
  const dayOfWeek = getDayOfWeekForDate(date);

  return rules
    .filter((rule) => rule.active && rule.day_of_week === dayOfWeek)
    .map((rule) => timeOnDateToRange(date, rule.start_time, rule.end_time));
}

function applyAvailabilityOverrides(
  windows: TimeRange[],
  overrides: AvailabilityOverride[],
  date: string,
): TimeRange[] {
  const dayOverrides = overrides.filter((override) => override.date === date);
  const availableOverrides = dayOverrides.filter(
    (override) => override.type === 'available',
  );
  const unavailableOverrides = dayOverrides.filter(
    (override) => override.type === 'unavailable',
  );

  const withAdded = mergeOverlappingRanges([
    ...windows,
    ...availableOverrides.map((override) =>
      timeOnDateToRange(date, override.start_time, override.end_time),
    ),
  ]);

  const unavailableRanges = unavailableOverrides.map((override) =>
    timeOnDateToRange(date, override.start_time, override.end_time),
  );

  return subtractRanges(withAdded, unavailableRanges);
}

function clipRangesToDay(ranges: TimeRange[], date: string): TimeRange[] {
  const { start, end } = getJamaicaDayBounds(date);
  const dayBounds = createRange(start, end);

  return sortRanges(
    ranges
      .map((range) => clipRangeToBounds(range, dayBounds))
      .filter((range): range is TimeRange => range !== null),
  );
}

function toTimestamptzRanges(
  entries: Array<{ start_time: string; end_time: string }>,
  date: string,
): TimeRange[] {
  return clipRangesToDay(
    entries.map((entry) => timestamptzToRange(entry.start_time, entry.end_time)),
    date,
  );
}

export function getTotalBlockedMinutes(
  durationMinutes: number,
  bufferMinutes: number,
): number {
  return durationMinutes + bufferMinutes;
}

export function getAppointmentEndTime(
  startTime: Date,
  durationMinutes: number,
  bufferMinutes: number,
): Date {
  return addMinutes(startTime, getTotalBlockedMinutes(durationMinutes, bufferMinutes));
}

export function getServiceEndTime(startTime: Date, durationMinutes: number): Date {
  return addMinutes(startTime, durationMinutes);
}

export function computeAvailableWindows(context: DayBookingContext): TimeRange[] {
  const regularWindows = getRegularWindowsForDate(context.rules, context.date);
  const withOverrides = applyAvailabilityOverrides(
    regularWindows,
    context.overrides,
    context.date,
  );

  const blockers = [
    ...toTimestamptzRanges(context.unavailableBlocks, context.date),
    ...toTimestamptzRanges(
      context.blockingAppointments.filter((appointment) =>
        isBlockingAppointmentStatus(appointment.status),
      ),
      context.date,
    ),
  ];

  return subtractRanges(withOverrides, blockers);
}

export function getAvailabilityForDate(
  context: DayBookingContext,
): DayAvailability {
  return {
    date: context.date,
    dayOfWeek: getDayOfWeekForDate(context.date),
    windows: computeAvailableWindows(context),
  };
}

export function generateBookingSlots(
  service: Service,
  context: DayBookingContext,
  options: SlotGenerationOptions = {},
): BookingSlot[] {
  const intervalMinutes =
    options.intervalMinutes ?? DEFAULT_SLOT_INTERVAL_MINUTES;
  const totalBlockedMinutes = getTotalBlockedMinutes(
    service.duration_minutes,
    service.buffer_minutes ?? DEFAULT_BUFFER_MINUTES,
  );
  const windows = computeAvailableWindows(context);
  const slots: BookingSlot[] = [];

  for (const window of windows) {
    let cursor = alignToInterval(window.start, intervalMinutes);

    if (cursor < window.start) {
      cursor = addMinutes(cursor, intervalMinutes);
    }

    while (addMinutes(cursor, totalBlockedMinutes) <= window.end) {
      const serviceEndTime = getServiceEndTime(cursor, service.duration_minutes);
      const endTime = getAppointmentEndTime(
        cursor,
        service.duration_minutes,
        service.buffer_minutes ?? DEFAULT_BUFFER_MINUTES,
      );
      const candidate = createRange(cursor, endTime);

      if (rangeContains(window, candidate)) {
        slots.push({
          startTime: cursor,
          endTime,
          serviceEndTime,
          date: context.date,
          label: formatSlotLabel(cursor),
        });
      }

      cursor = addMinutes(cursor, intervalMinutes);
    }
  }

  if (context.date === getTodayJamaicaDateString()) {
    return slots.filter((slot) => isBookableSlotStart(slot.startTime, context.date));
  }

  return slots;
}

export function isSlotAvailable(
  service: Service,
  context: DayBookingContext,
  startTime: Date,
): boolean {
  const endTime = getAppointmentEndTime(
    startTime,
    service.duration_minutes,
    service.buffer_minutes ?? DEFAULT_BUFFER_MINUTES,
  );
  const candidate = createRange(startTime, endTime);
  const windows = computeAvailableWindows(context);

  return windows.some((window) => rangeContains(window, candidate));
}

export function findBookingSlot(
  service: Service,
  context: DayBookingContext,
  startTime: Date,
  options?: SlotGenerationOptions,
): BookingSlot | null {
  return (
    generateBookingSlots(service, context, options).find(
      (slot) => slot.startTime.getTime() === startTime.getTime(),
    ) ?? null
  );
}
