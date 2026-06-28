import type { UnavailableBlock } from '@/lib/supabase/database.types';
import { getDayOfWeekForDate, jamaicaLocalToUtc, toTimestamptz } from '@/lib/utils/datetime';

export type WeeklyRecurrenceRule = {
  type: 'weekly';
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  fullDay?: boolean;
};

export function parseRecurrenceRule(
  value: string | null,
): WeeklyRecurrenceRule | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as WeeklyRecurrenceRule;

    if (
      parsed.type !== 'weekly' ||
      !Array.isArray(parsed.daysOfWeek) ||
      !parsed.startTime ||
      !parsed.endTime
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function buildWeeklyRecurrenceRule(input: {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  fullDay?: boolean;
}): string {
  const rule: WeeklyRecurrenceRule = {
    type: 'weekly',
    daysOfWeek: input.daysOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
    fullDay: input.fullDay ?? false,
  };

  return JSON.stringify(rule);
}

export function expandRecurringBlockForDate(
  block: Pick<
    UnavailableBlock,
    'is_recurring' | 'recurrence_rule' | 'start_time' | 'end_time'
  >,
  date: string,
): { start_time: string; end_time: string } | null {
  if (!block.is_recurring) {
    return null;
  }

  const rule = parseRecurrenceRule(block.recurrence_rule);

  if (!rule) {
    return null;
  }

  const dayOfWeek = getDayOfWeekForDate(date);

  if (!rule.daysOfWeek.includes(dayOfWeek)) {
    return null;
  }

  const startTime = rule.fullDay ? '00:00:00' : rule.startTime;
  const endTime = rule.fullDay ? '23:59:59' : rule.endTime;

  return {
    start_time: toTimestamptz(jamaicaLocalToUtc(date, startTime)),
    end_time: toTimestamptz(jamaicaLocalToUtc(date, endTime)),
  };
}

export function expandRecurringBlocksForDate(
  blocks: Array<
    Pick<
      UnavailableBlock,
      'is_recurring' | 'recurrence_rule' | 'start_time' | 'end_time'
    >
  >,
  date: string,
): Array<{ start_time: string; end_time: string }> {
  return blocks
    .map((block) => expandRecurringBlockForDate(block, date))
    .filter((range): range is { start_time: string; end_time: string } =>
      Boolean(range),
    );
}

export function formatRecurrenceLabel(rule: WeeklyRecurrenceRule): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = rule.daysOfWeek.map((day) => dayNames[day]).join(', ');
  const timeLabel = rule.fullDay
    ? 'All day'
    : `${rule.startTime.slice(0, 5)} – ${rule.endTime.slice(0, 5)}`;

  return `Every ${days} · ${timeLabel}`;
}

export function getFullDayTimes() {
  return {
    startTime: '00:00:00',
    endTime: '23:59:59',
  };
}
