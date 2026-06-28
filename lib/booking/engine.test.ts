import { describe, expect, it } from 'vitest';
import {
  cancelledAppointmentDoesNotBlockExample,
  createSampleContext,
  pendingAppointmentBlocksMorningExample,
  sampleClassicService,
  sundaySpecialHoursExample,
  tuesday13thBlockedByOtherWorkExample,
  tuesdayBlockedByOtherWorkExample,
  partialWorkBlockExample,
} from '@/lib/booking/examples';
import {
  computeAvailableWindows,
  generateBookingSlots,
  getAvailabilityForDate,
  getTotalBlockedMinutes,
  isSlotAvailable,
} from '@/lib/booking/engine';
import type { AvailabilityOverride } from '@/lib/supabase/database.types';
import {
  hasBlockingOverlap,
  mergeOverlappingRanges,
  rangesOverlap,
  subtractRanges,
} from '@/lib/booking/ranges';
import { jamaicaLocalToUtc, getDayOfWeekForDate, toJamaicaDateString } from '@/lib/utils/datetime';

describe('range utilities', () => {
  it('detects overlap using half-open intervals', () => {
    const a = {
      start: jamaicaLocalToUtc('2025-06-10', '10:00:00'),
      end: jamaicaLocalToUtc('2025-06-10', '12:00:00'),
    };
    const b = {
      start: jamaicaLocalToUtc('2025-06-10', '11:00:00'),
      end: jamaicaLocalToUtc('2025-06-10', '13:00:00'),
    };
    const c = {
      start: jamaicaLocalToUtc('2025-06-10', '12:00:00'),
      end: jamaicaLocalToUtc('2025-06-10', '13:00:00'),
    };

    expect(rangesOverlap(a, b)).toBe(true);
    expect(rangesOverlap(a, c)).toBe(false);
  });

  it('subtracts a blocker from available windows', () => {
    const windows = [
      {
        start: jamaicaLocalToUtc('2025-06-10', '09:00:00'),
        end: jamaicaLocalToUtc('2025-06-10', '19:00:00'),
      },
    ];
    const blocker = {
      start: jamaicaLocalToUtc('2025-06-10', '10:00:00'),
      end: jamaicaLocalToUtc('2025-06-10', '19:00:00'),
    };

    const result = subtractRanges(windows, [blocker]);

    expect(result).toHaveLength(1);
    expect(toJamaicaDateString(result[0].start)).toBe('2025-06-10');
    expect(result[0].start).toEqual(jamaicaLocalToUtc('2025-06-10', '09:00:00'));
    expect(result[0].end).toEqual(jamaicaLocalToUtc('2025-06-10', '10:00:00'));
  });

  it('merges overlapping windows', () => {
    const merged = mergeOverlappingRanges([
      {
        start: jamaicaLocalToUtc('2025-06-10', '09:00:00'),
        end: jamaicaLocalToUtc('2025-06-10', '12:00:00'),
      },
      {
        start: jamaicaLocalToUtc('2025-06-10', '11:00:00'),
        end: jamaicaLocalToUtc('2025-06-10', '14:00:00'),
      },
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].start).toEqual(jamaicaLocalToUtc('2025-06-10', '09:00:00'));
    expect(merged[0].end).toEqual(jamaicaLocalToUtc('2025-06-10', '14:00:00'));
  });
});

describe('booking engine', () => {
  it('blocks the full other-work window from 10:00 AM to 7:00 PM', () => {
    const { context, service } = tuesdayBlockedByOtherWorkExample();
    const slots = generateBookingSlots(service, context);

    expect(slots).toHaveLength(0);
    expect(
      slots.some((slot) =>
        hasBlockingOverlap(
          { start: slot.startTime, end: slot.endTime },
          [
            {
              start: jamaicaLocalToUtc('2025-06-10', '10:00:00'),
              end: jamaicaLocalToUtc('2025-06-10', '19:00:00'),
            },
          ],
        ),
      ),
    ).toBe(false);
  });

  it('blocks all customer slots on Tuesday the 13th from 10:00 AM to 7:00 PM', () => {
    const { context, service, date } = tuesday13thBlockedByOtherWorkExample();
    const slots = generateBookingSlots(service, context);
    const blockStart = jamaicaLocalToUtc(date, '10:00:00');
    const blockEnd = jamaicaLocalToUtc(date, '19:00:00');

    expect(
      slots.some((slot) =>
        hasBlockingOverlap({ start: slot.startTime, end: slot.endTime }, [
          { start: blockStart, end: blockEnd },
        ]),
      ),
    ).toBe(false);
  });

  it('removes slots covered by an unavailable override', () => {
    const unavailableOverride: AvailabilityOverride = {
      id: 'override-unavailable',
      date: '2025-06-10',
      start_time: '10:00:00',
      end_time: '19:00:00',
      type: 'unavailable',
      note: 'Closed afternoon',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
    };
    const context = createSampleContext({
      unavailableBlocks: [],
      overrides: [unavailableOverride],
    });
    const slots = generateBookingSlots(sampleClassicService, context);

    expect(
      slots.every(
        (slot) => slot.endTime <= jamaicaLocalToUtc('2025-06-10', '10:00:00'),
      ),
    ).toBe(true);
  });

  it('filters past slot starts for the current day', () => {
    const today = toJamaicaDateString(new Date());
    const context = createSampleContext({
      date: today,
      unavailableBlocks: [],
      rules: [
        {
          id: 'today-rule',
          day_of_week: getDayOfWeekForDate(today),
          start_time: '00:00:00',
          end_time: '23:59:59',
          active: true,
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
        },
      ],
    });

    const slots = generateBookingSlots(sampleClassicService, context);

    expect(slots.every((slot) => slot.startTime.getTime() > Date.now())).toBe(true);
  });

  it('keeps morning slots when other work starts later in the day', () => {
    const { context, service } = partialWorkBlockExample();
    const slots = generateBookingSlots(service, context);

    expect(slots.length).toBeGreaterThan(0);
    expect(
      slots.every((slot) => slot.endTime <= jamaicaLocalToUtc('2025-06-10', '14:00:00')),
    ).toBe(true);
    expect(
      slots.some(
        (slot) => slot.startTime.getTime() === jamaicaLocalToUtc('2025-06-10', '09:00:00').getTime(),
      ),
    ).toBe(true);
  });

  it('respects service duration plus buffer when generating slots', () => {
    const { context, service } = partialWorkBlockExample();
    const slots = generateBookingSlots(service, context, { intervalMinutes: 15 });
    const blockedMinutes = getTotalBlockedMinutes(
      service.duration_minutes,
      service.buffer_minutes,
    );

    expect(blockedMinutes).toBe(105);
    expect(
      slots.every(
        (slot) =>
          slot.endTime.getTime() - slot.startTime.getTime() ===
          blockedMinutes * 60_000,
      ),
    ).toBe(true);
  });

  it('ignores cancelled appointments when computing availability', () => {
    const { context, service } = cancelledAppointmentDoesNotBlockExample();
    const slots = generateBookingSlots(service, context);

    expect(
      slots.some(
        (slot) => slot.startTime.getTime() === jamaicaLocalToUtc('2025-06-10', '09:00:00').getTime(),
      ),
    ).toBe(true);
  });

  it('removes slots that overlap pending appointments', () => {
    const { context, service } = pendingAppointmentBlocksMorningExample();
    const slots = generateBookingSlots(service, context);

    expect(
      slots.some(
        (slot) => slot.startTime.getTime() === jamaicaLocalToUtc('2025-06-10', '09:00:00').getTime(),
      ),
    ).toBe(false);
    expect(
      slots.some(
        (slot) => slot.startTime.getTime() >= jamaicaLocalToUtc('2025-06-10', '10:45:00').getTime(),
      ),
    ).toBe(true);
  });

  it('adds special available overrides on days without regular rules', () => {
    const { context, service } = sundaySpecialHoursExample();
    const availability = getAvailabilityForDate(context);
    const slots = generateBookingSlots(service, context);

    expect(availability.windows).toHaveLength(1);
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].startTime).toEqual(jamaicaLocalToUtc('2025-06-15', '11:00:00'));
  });

  it('returns no slots when the full service window does not fit', () => {
    const context = createSampleContext({
      unavailableBlocks: [],
      rules: [
        {
          id: 'short-window',
          day_of_week: 2,
          start_time: '09:00:00',
          end_time: '10:00:00',
          active: true,
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
        },
      ],
    });

    const slots = generateBookingSlots(sampleClassicService, context);
    expect(slots).toHaveLength(0);
  });

  it('validates a slot against computed availability windows', () => {
    const { context, service } = partialWorkBlockExample();
    const validStart = jamaicaLocalToUtc('2025-06-10', '09:00:00');
    const invalidStart = jamaicaLocalToUtc('2025-06-10', '15:00:00');

    expect(isSlotAvailable(service, context, validStart)).toBe(true);
    expect(isSlotAvailable(service, context, invalidStart)).toBe(false);
  });

  it('computes availability using regular hours minus blockers', () => {
    const { context } = tuesdayBlockedByOtherWorkExample();
    const windows = computeAvailableWindows(context);

    expect(windows).toHaveLength(1);
    expect(windows[0].start).toEqual(jamaicaLocalToUtc('2025-06-10', '09:00:00'));
    expect(windows[0].end).toEqual(jamaicaLocalToUtc('2025-06-10', '10:00:00'));
  });

  it('subtracts expanded recurring weekday blocks from regular hours', () => {
    const context = createSampleContext({
      unavailableBlocks: [
        {
          start_time: jamaicaLocalToUtc('2025-06-10', '09:00:00').toISOString(),
          end_time: jamaicaLocalToUtc('2025-06-10', '17:00:00').toISOString(),
        },
      ],
    });
    const windows = computeAvailableWindows(context);

    expect(windows).toHaveLength(1);
    expect(windows[0].start).toEqual(jamaicaLocalToUtc('2025-06-10', '17:00:00'));
    expect(windows[0].end).toEqual(jamaicaLocalToUtc('2025-06-10', '19:00:00'));
  });
});
