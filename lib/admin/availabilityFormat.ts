import { DAY_OF_WEEK_LABELS } from '@/lib/booking/constants';
import {
  formatRecurrenceLabel,
  getFullDayTimes,
  parseRecurrenceRule,
} from '@/lib/booking/recurrence';
import type {
  AvailabilityOverride,
  AvailabilityRule,
  UnavailableBlock,
} from '@/lib/supabase/database.types';
import {
  formatBookingDate,
  formatSlotLabel,
  fromTimestamptz,
  normalizeTimeString,
  toJamaicaDateString,
  toJamaicaTimeString,
} from '@/lib/utils/datetime';

export function formatAdminTime(time: string): string {
  const normalized = normalizeTimeString(time);
  return formatSlotLabel(fromTimestamptz(`2025-01-01T${normalized}-05:00`));
}

export function formatWeeklyRuleLabel(rule: AvailabilityRule): string {
  return `${DAY_OF_WEEK_LABELS[rule.day_of_week]} · ${formatAdminTime(rule.start_time)} – ${formatAdminTime(rule.end_time)}`;
}

export function isFullDayTimeRange(startTime: string, endTime: string): boolean {
  const fullDay = getFullDayTimes();
  return (
    normalizeTimeString(startTime) === fullDay.startTime &&
    normalizeTimeString(endTime) === fullDay.endTime
  );
}

export function formatUnavailableBlockLabel(block: UnavailableBlock): string {
  if (block.is_recurring) {
    const rule = parseRecurrenceRule(block.recurrence_rule);
    if (rule) {
      return formatRecurrenceLabel(rule);
    }

    return 'Recurring unavailable block';
  }

  const start = fromTimestamptz(block.start_time);
  const end = fromTimestamptz(block.end_time);
  const date = toJamaicaDateString(start);
  const startTime = toJamaicaTimeString(start);
  const endTime = toJamaicaTimeString(end);

  if (isFullDayTimeRange(startTime, endTime)) {
    return `${formatBookingDate(date)} · All day`;
  }

  return `${formatBookingDate(date)} · ${formatAdminTime(startTime)} – ${formatAdminTime(endTime)}`;
}

export function formatAvailabilityOverrideLabel(
  override: AvailabilityOverride,
): string {
  const typeLabel = override.type === 'available' ? 'Extra hours' : 'Closed';
  const timeLabel = isFullDayTimeRange(override.start_time, override.end_time)
    ? 'All day'
    : `${formatAdminTime(override.start_time)} – ${formatAdminTime(override.end_time)}`;

  return `${formatBookingDate(override.date)} · ${typeLabel} · ${timeLabel}`;
}

export function toTimeInputValue(time: string): string {
  return normalizeTimeString(time).slice(0, 5);
}

export function toApiTime(value: string): string {
  if (value.length === 5) {
    return `${value}:00`;
  }

  return normalizeTimeString(value);
}

export function blockToFormValues(block: UnavailableBlock) {
  if (block.is_recurring) {
    const rule = parseRecurrenceRule(block.recurrence_rule);

    return {
      isRecurring: true,
      fullDay: rule?.fullDay ?? false,
      daysOfWeek: rule?.daysOfWeek ?? [],
      startTime: toTimeInputValue(rule?.startTime ?? '09:00:00'),
      endTime: toTimeInputValue(rule?.endTime ?? '17:00:00'),
      date: '',
      reason: block.reason ?? '',
    };
  }

  const start = fromTimestamptz(block.start_time);
  const end = fromTimestamptz(block.end_time);
  const startTime = toJamaicaTimeString(start);
  const endTime = toJamaicaTimeString(end);

  return {
    isRecurring: false,
    fullDay: isFullDayTimeRange(startTime, endTime),
    daysOfWeek: [] as number[],
    date: toJamaicaDateString(start),
    startTime: toTimeInputValue(startTime),
    endTime: toTimeInputValue(endTime),
    reason: block.reason ?? '',
  };
}

export function isUpcomingUnavailableBlock(block: UnavailableBlock, now = new Date()) {
  if (block.is_recurring) {
    return true;
  }

  return fromTimestamptz(block.end_time) >= now;
}
