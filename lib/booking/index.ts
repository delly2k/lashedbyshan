export type {
  Appointment,
  AvailabilityOverride,
  AvailabilityRule,
  BookingSlot,
  DayAvailability,
  DayBookingContext,
  NewAppointmentRequest,
  Service,
  UnavailableBlock,
} from '@/lib/booking/types';

export type { SlotGenerationOptions } from '@/lib/booking/engine';
export type { CreateAppointmentInput } from '@/lib/booking/queries';

export {
  APPOINTMENT_STATUSES,
  AVAILABILITY_OVERRIDE_TYPES,
  BLOCKING_APPOINTMENT_STATUSES,
  DAY_OF_WEEK_LABELS,
  DEFAULT_BUFFER_MINUTES,
  DEFAULT_SLOT_INTERVAL_MINUTES,
  isBlockingAppointmentStatus,
} from '@/lib/booking/constants';

export {
  computeAvailableWindows,
  findBookingSlot,
  generateBookingSlots,
  getAppointmentEndTime,
  getAvailabilityForDate,
  getServiceEndTime,
  getTotalBlockedMinutes,
  isSlotAvailable,
} from '@/lib/booking/engine';

export {
  createRange,
  hasBlockingOverlap,
  mergeOverlappingRanges,
  rangesOverlap,
  subtractRanges,
  type TimeRange,
} from '@/lib/booking/ranges';

export {
  addMinutes,
  formatBookingDate,
  formatDuration,
  formatSlotLabel,
  fromTimestamptz,
  getDayOfWeekForDate,
  getJamaicaDayBounds,
  isBookableDateString,
  isBookableSlotStart,
  isValidBookingDateString,
  jamaicaLocalToUtc,
  toTimestamptz,
} from '@/lib/utils/datetime';

export {
  BookingEngineError,
  createAppointmentRequest,
  createAppointmentRequestFromIso,
  fetchActiveServices,
  fetchAvailabilityOverridesForDate,
  fetchAvailabilityRules,
  fetchBlockingAppointmentsForDate,
  fetchServiceById,
  fetchUnavailableBlocksForDate,
  getAvailableSlots,
  loadDayBookingContext,
  validateSelectedSlot,
} from '@/lib/booking/queries';

export {
  getActiveServicesServer,
  getAvailableSlotsServer,
  getDayBookingContextServer,
  submitAppointmentRequestServer,
} from '@/lib/booking/server';

export {
  cancelledAppointmentDoesNotBlockExample,
  createSampleContext,
  partialWorkBlockExample,
  runBookingEngineExample,
  tuesdayBlockedByOtherWorkExample,
} from '@/lib/booking/examples';

export type BookingStep = 'service' | 'datetime' | 'details' | 'confirm';

export { PLACEHOLDER_SERVICES } from '@/lib/booking/seed-fallback';

export {
  buildWeeklyRecurrenceRule,
  expandRecurringBlocksForDate,
  formatRecurrenceLabel,
  parseRecurrenceRule,
} from '@/lib/booking/recurrence';

export function serializeBookingSlot(slot: import('@/lib/booking/engine').BookingSlot) {
  return {
    startTime: slot.startTime.toISOString(),
    endTime: slot.endTime.toISOString(),
    serviceEndTime: slot.serviceEndTime.toISOString(),
    date: slot.date,
    label: slot.label,
  };
}

export function serializeDayAvailability(
  availability: import('@/lib/booking/engine').DayAvailability,
) {
  return {
    date: availability.date,
    dayOfWeek: availability.dayOfWeek,
    windows: availability.windows.map((window) => ({
      start: window.start.toISOString(),
      end: window.end.toISOString(),
    })),
  };
}
