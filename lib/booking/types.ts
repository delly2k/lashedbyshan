export type {
  Appointment,
  AppointmentStatus,
  AvailabilityOverride,
  AvailabilityOverrideType,
  AvailabilityRule,
  Database,
  NewAppointmentRequest,
  Profile,
  PublicUnavailableBlock,
  Service,
  Tables,
  TablesInsert,
  TablesUpdate,
  UnavailableBlock,
  UserRole,
} from '@/lib/supabase/database.types';

export type {
  BookingSlot,
  DayAvailability,
  DayBookingContext,
  SlotGenerationOptions,
} from '@/lib/booking/engine';

export {
  APPOINTMENT_STATUSES,
  AVAILABILITY_OVERRIDE_TYPES,
  BLOCKING_APPOINTMENT_STATUSES,
  DAY_OF_WEEK_LABELS,
  DEFAULT_BUFFER_MINUTES,
  DEFAULT_SLOT_INTERVAL_MINUTES,
  isBlockingAppointmentStatus,
} from '@/lib/booking/constants';

export type BookingStep = 'service' | 'datetime' | 'details' | 'confirm';

export { PLACEHOLDER_SERVICES } from '@/lib/booking/seed-fallback';

export {
  getAppointmentEndTime,
  getTotalBlockedMinutes,
} from '@/lib/booking/engine';
