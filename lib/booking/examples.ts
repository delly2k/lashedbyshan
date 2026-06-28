import type {
  AvailabilityOverride,
  AvailabilityRule,
  Service,
} from '@/lib/supabase/database.types';
import type { DayBookingContext } from '@/lib/booking/engine';
import {
  generateBookingSlots,
  getAvailabilityForDate,
} from '@/lib/booking/engine';
import { jamaicaLocalToUtc, toTimestamptz } from '@/lib/utils/datetime';

const SAMPLE_DATE = '2025-06-10';

export const sampleClassicService: Service = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Classic Set',
  description: 'Natural, one-extension-per-lash look.',
  price_jmd: 5000,
  duration_minutes: 90,
  buffer_minutes: 15,
  active: true,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

export const sampleTuesdayRules: AvailabilityRule[] = [
  {
    id: 'rule-tuesday',
    day_of_week: 2,
    start_time: '09:00:00',
    end_time: '19:00:00',
    active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
];

export const sampleUnavailableBlock = {
  start_time: toTimestamptz(jamaicaLocalToUtc(SAMPLE_DATE, '10:00:00')),
  end_time: toTimestamptz(jamaicaLocalToUtc(SAMPLE_DATE, '19:00:00')),
};

export const samplePartialUnavailableBlock = {
  start_time: toTimestamptz(jamaicaLocalToUtc(SAMPLE_DATE, '14:00:00')),
  end_time: toTimestamptz(jamaicaLocalToUtc(SAMPLE_DATE, '19:00:00')),
};

export const samplePendingAppointment = {
  start_time: toTimestamptz(jamaicaLocalToUtc(SAMPLE_DATE, '09:00:00')),
  end_time: toTimestamptz(jamaicaLocalToUtc(SAMPLE_DATE, '10:45:00')),
  status: 'pending' as const,
};

export const sampleCancelledAppointment = {
  start_time: toTimestamptz(jamaicaLocalToUtc(SAMPLE_DATE, '09:00:00')),
  end_time: toTimestamptz(jamaicaLocalToUtc(SAMPLE_DATE, '10:45:00')),
  status: 'cancelled' as const,
};

export const sampleAvailableOverride: AvailabilityOverride = {
  id: 'override-sunday',
  date: '2025-06-15',
  start_time: '11:00:00',
  end_time: '15:00:00',
  type: 'available',
  note: 'Special Sunday hours',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

export function createSampleContext(
  overrides: Partial<DayBookingContext> = {},
): DayBookingContext {
  return {
    date: SAMPLE_DATE,
    rules: sampleTuesdayRules,
    overrides: [],
    unavailableBlocks: [sampleUnavailableBlock],
    blockingAppointments: [],
    ...overrides,
  };
}

export function tuesdayBlockedByOtherWorkExample() {
  return {
    date: SAMPLE_DATE,
    service: sampleClassicService,
    context: createSampleContext(),
  };
}

export function partialWorkBlockExample() {
  return {
    date: SAMPLE_DATE,
    service: sampleClassicService,
    context: createSampleContext({
      unavailableBlocks: [samplePartialUnavailableBlock],
    }),
  };
}

export function sundaySpecialHoursExample() {
  return {
    date: '2025-06-15',
    service: sampleClassicService,
    context: createSampleContext({
      date: '2025-06-15',
      rules: [],
      overrides: [sampleAvailableOverride],
      unavailableBlocks: [],
    }),
  };
}

export function cancelledAppointmentDoesNotBlockExample() {
  return {
    date: SAMPLE_DATE,
    service: sampleClassicService,
    context: createSampleContext({
      unavailableBlocks: [],
      blockingAppointments: [sampleCancelledAppointment],
    }),
  };
}

export function pendingAppointmentBlocksMorningExample() {
  return {
    date: SAMPLE_DATE,
    service: sampleClassicService,
    context: createSampleContext({
      unavailableBlocks: [],
      blockingAppointments: [samplePendingAppointment],
    }),
  };
}

export function tuesday13thBlockedByOtherWorkExample() {
  const date = '2025-05-13';

  return {
    date,
    service: sampleClassicService,
    context: createSampleContext({
      date,
      unavailableBlocks: [
        {
          start_time: toTimestamptz(jamaicaLocalToUtc(date, '10:00:00')),
          end_time: toTimestamptz(jamaicaLocalToUtc(date, '19:00:00')),
        },
      ],
    }),
  };
}

export function runBookingEngineExample() {
  const { context, service } = tuesdayBlockedByOtherWorkExample();
  const availability = getAvailabilityForDate(context);
  const slots = generateBookingSlots(service, context);

  return {
    availability,
    slots,
    blockedWindowCount: createSampleContext().unavailableBlocks.length,
  };
}
