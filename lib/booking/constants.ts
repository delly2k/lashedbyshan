export const DEFAULT_BUFFER_MINUTES = 15;

export const DEFAULT_SLOT_INTERVAL_MINUTES = 15;

export const APPOINTMENT_STATUSES = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
] as const;

export const AVAILABILITY_OVERRIDE_TYPES = ['available', 'unavailable'] as const;

export const BLOCKING_APPOINTMENT_STATUSES = ['pending', 'confirmed'] as const;

export type BlockingAppointmentStatus =
  (typeof BLOCKING_APPOINTMENT_STATUSES)[number];

export function isBlockingAppointmentStatus(
  status: string,
): status is BlockingAppointmentStatus {
  return BLOCKING_APPOINTMENT_STATUSES.includes(
    status as BlockingAppointmentStatus,
  );
}

/** 0 = Sunday through 6 = Saturday (matches PostgreSQL / JS getDay). */
export const DAY_OF_WEEK_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
