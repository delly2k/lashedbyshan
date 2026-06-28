import { describe, expect, it } from 'vitest';
import {
  getTodayJamaicaDateString,
  isBookableDateString,
  isBookableSlotStart,
  isValidBookingDateString,
  jamaicaLocalToUtc,
} from '@/lib/utils/datetime';

describe('datetime booking helpers', () => {
  it('validates booking date format', () => {
    expect(isValidBookingDateString('2025-06-10')).toBe(true);
    expect(isValidBookingDateString('2025-6-10')).toBe(false);
  });

  it('rejects past booking dates in Jamaica time', () => {
    const today = getTodayJamaicaDateString();
    expect(isBookableDateString(today)).toBe(true);
    expect(isBookableDateString('2000-01-01')).toBe(false);
  });

  it('rejects past slot starts on the current day', () => {
    const today = getTodayJamaicaDateString();
    const pastStart = jamaicaLocalToUtc(today, '00:00:00');
    const futureStart = jamaicaLocalToUtc(today, '23:59:00');

    expect(isBookableSlotStart(pastStart, today)).toBe(false);
    expect(isBookableSlotStart(futureStart, today)).toBe(true);
    expect(isBookableSlotStart(futureStart, '2099-01-01')).toBe(true);
  });
});
