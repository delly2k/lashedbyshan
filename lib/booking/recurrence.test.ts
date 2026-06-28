import { describe, expect, it } from 'vitest';
import {
  buildWeeklyRecurrenceRule,
  expandRecurringBlockForDate,
  expandRecurringBlocksForDate,
  formatRecurrenceLabel,
  parseRecurrenceRule,
} from '@/lib/booking/recurrence';
import { jamaicaLocalToUtc } from '@/lib/utils/datetime';

describe('recurrence utilities', () => {
  it('parses and formats weekly recurrence rules', () => {
    const ruleJson = buildWeeklyRecurrenceRule({
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '09:00:00',
      endTime: '17:00:00',
    });

    const parsed = parseRecurrenceRule(ruleJson);
    expect(parsed).not.toBeNull();
    expect(formatRecurrenceLabel(parsed!)).toContain('Mon');
    expect(formatRecurrenceLabel(parsed!)).toContain('09:00');
  });

  it('expands recurring blocks only on selected weekdays', () => {
    const block = {
      is_recurring: true,
      recurrence_rule: buildWeeklyRecurrenceRule({
        daysOfWeek: [1, 3, 5],
        startTime: '09:00:00',
        endTime: '17:00:00',
      }),
      start_time: '2025-01-01T14:00:00.000Z',
      end_time: '2025-01-01T22:00:00.000Z',
    };

    expect(expandRecurringBlockForDate(block, '2025-06-08')).toBeNull();
    expect(expandRecurringBlockForDate(block, '2025-06-09')).toEqual({
      start_time: jamaicaLocalToUtc('2025-06-09', '09:00:00').toISOString(),
      end_time: jamaicaLocalToUtc('2025-06-09', '17:00:00').toISOString(),
    });
  });

  it('expands full-day recurring blocks', () => {
    const block = {
      is_recurring: true,
      recurrence_rule: buildWeeklyRecurrenceRule({
        daysOfWeek: [0],
        startTime: '00:00:00',
        endTime: '23:59:59',
        fullDay: true,
      }),
      start_time: '2025-01-01T05:00:00.000Z',
      end_time: '2025-01-02T04:59:59.000Z',
    };

    const expanded = expandRecurringBlockForDate(block, '2025-06-15');
    expect(expanded).toEqual({
      start_time: jamaicaLocalToUtc('2025-06-15', '00:00:00').toISOString(),
      end_time: jamaicaLocalToUtc('2025-06-15', '23:59:59').toISOString(),
    });
  });

  it('expands multiple recurring blocks for a date', () => {
    const blocks = [
      {
        is_recurring: true,
        recurrence_rule: buildWeeklyRecurrenceRule({
          daysOfWeek: [1],
          startTime: '09:00:00',
          endTime: '12:00:00',
        }),
        start_time: '2025-01-01T14:00:00.000Z',
        end_time: '2025-01-01T17:00:00.000Z',
      },
      {
        is_recurring: true,
        recurrence_rule: buildWeeklyRecurrenceRule({
          daysOfWeek: [2],
          startTime: '13:00:00',
          endTime: '17:00:00',
        }),
        start_time: '2025-01-01T18:00:00.000Z',
        end_time: '2025-01-01T22:00:00.000Z',
      },
    ];

    expect(expandRecurringBlocksForDate(blocks, '2025-06-09')).toHaveLength(1);
    expect(expandRecurringBlocksForDate(blocks, '2025-06-10')).toHaveLength(1);
    expect(expandRecurringBlocksForDate(blocks, '2025-06-11')).toHaveLength(0);
  });
});
