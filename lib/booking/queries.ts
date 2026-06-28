import type { SupabaseClient } from '@supabase/supabase-js';
import {
  BLOCKING_APPOINTMENT_STATUSES,
} from '@/lib/booking/constants';
import type { DayBookingContext } from '@/lib/booking/engine';
import {
  findBookingSlot,
  generateBookingSlots,
  getAppointmentEndTime,
  isSlotAvailable,
} from '@/lib/booking/engine';
import type {
  Appointment,
  Database,
  NewAppointmentRequest,
  Service,
} from '@/lib/supabase/database.types';
import { expandRecurringBlocksForDate } from '@/lib/booking/recurrence';
import {
  fromTimestamptz,
  isBookableDateString,
  isBookableSlotStart,
  isValidBookingDateString,
  toTimestamptz,
} from '@/lib/utils/datetime';

export class BookingEngineError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'INVALID_DATE'
      | 'SERVICE_NOT_FOUND'
      | 'SLOT_UNAVAILABLE'
      | 'DATABASE_ERROR',
  ) {
    super(message);
    this.name = 'BookingEngineError';
  }
}

export async function fetchActiveServices(
  supabase: SupabaseClient<Database>,
): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('price_jmd', { ascending: true });

  if (error) {
    throw new BookingEngineError(error.message, 'DATABASE_ERROR');
  }

  return data;
}

export async function fetchServiceById(
  supabase: SupabaseClient<Database>,
  serviceId: string,
): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    throw new BookingEngineError(error.message, 'DATABASE_ERROR');
  }

  return data;
}

export async function fetchAvailabilityRules(
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase
    .from('availability_rules')
    .select('*')
    .eq('active', true)
    .order('day_of_week', { ascending: true });

  if (error) {
    throw new BookingEngineError(error.message, 'DATABASE_ERROR');
  }

  return data;
}

export async function fetchAvailabilityOverridesForDate(
  supabase: SupabaseClient<Database>,
  date: string,
) {
  const { data, error } = await supabase
    .from('availability_overrides')
    .select('*')
    .eq('date', date);

  if (error) {
    throw new BookingEngineError(error.message, 'DATABASE_ERROR');
  }

  return data;
}

export async function fetchUnavailableBlocksForDate(
  supabase: SupabaseClient<Database>,
  date: string,
) {
  if (!isValidBookingDateString(date)) {
    throw new BookingEngineError('Invalid booking date format.', 'INVALID_DATE');
  }

  const dayStart = `${date}T00:00:00-05:00`;
  const dayEnd = `${date}T23:59:59.999-05:00`;

  const [{ data: oneTime, error: oneTimeError }, { data: recurring, error: recurringError }] =
    await Promise.all([
      supabase
        .from('unavailable_blocks')
        .select('start_time, end_time')
        .eq('is_recurring', false)
        .lt('start_time', dayEnd)
        .gt('end_time', dayStart),
      supabase
        .from('unavailable_blocks')
        .select('start_time, end_time, is_recurring, recurrence_rule')
        .eq('is_recurring', true),
    ]);

  if (oneTimeError || recurringError) {
    throw new BookingEngineError(
      (oneTimeError ?? recurringError)!.message,
      'DATABASE_ERROR',
    );
  }

  const expandedRecurring = expandRecurringBlocksForDate(recurring ?? [], date);

  return [...(oneTime ?? []), ...expandedRecurring];
}

export async function fetchBlockingAppointmentsForDate(
  supabase: SupabaseClient<Database>,
  date: string,
) {
  if (!isValidBookingDateString(date)) {
    throw new BookingEngineError('Invalid booking date format.', 'INVALID_DATE');
  }

  const dayStart = `${date}T00:00:00-05:00`;
  const dayEnd = `${date}T23:59:59.999-05:00`;

  const { data, error } = await supabase
    .from('appointments')
    .select('start_time, end_time, status')
    .in('status', [...BLOCKING_APPOINTMENT_STATUSES])
    .lt('start_time', dayEnd)
    .gt('end_time', dayStart);

  if (error) {
    throw new BookingEngineError(error.message, 'DATABASE_ERROR');
  }

  return data;
}

export async function loadDayBookingContext(
  supabase: SupabaseClient<Database>,
  date: string,
): Promise<DayBookingContext> {
  if (!isValidBookingDateString(date)) {
    throw new BookingEngineError('Invalid booking date format.', 'INVALID_DATE');
  }

  const [rules, overrides, unavailableBlocks, blockingAppointments] =
    await Promise.all([
      fetchAvailabilityRules(supabase),
      fetchAvailabilityOverridesForDate(supabase, date),
      fetchUnavailableBlocksForDate(supabase, date),
      fetchBlockingAppointmentsForDate(supabase, date),
    ]);

  return {
    date,
    rules,
    overrides,
    unavailableBlocks,
    blockingAppointments,
  };
}

export async function getAvailableSlots(
  supabase: SupabaseClient<Database>,
  serviceId: string,
  date: string,
) {
  if (!isBookableDateString(date)) {
    throw new BookingEngineError('Past dates cannot be booked.', 'INVALID_DATE');
  }

  const service = await fetchServiceById(supabase, serviceId);

  if (!service) {
    throw new BookingEngineError('Service not found.', 'SERVICE_NOT_FOUND');
  }

  const context = await loadDayBookingContext(supabase, date);
  return generateBookingSlots(service, context);
}

export type CreateAppointmentInput = {
  serviceId: string;
  date: string;
  startTime: Date;
  customerName: string;
  customerPhone: string;
  customerInstagram?: string | null;
  notes?: string | null;
};

export async function createAppointmentRequest(
  supabase: SupabaseClient<Database>,
  input: CreateAppointmentInput,
) {
  const service = await fetchServiceById(supabase, input.serviceId);

  if (!service) {
    throw new BookingEngineError('Service not found.', 'SERVICE_NOT_FOUND');
  }

  if (!isBookableDateString(input.date)) {
    throw new BookingEngineError('Past dates cannot be booked.', 'INVALID_DATE');
  }

  if (!isBookableSlotStart(input.startTime, input.date)) {
    throw new BookingEngineError(
      'The selected time is no longer available.',
      'SLOT_UNAVAILABLE',
    );
  }

  const context = await loadDayBookingContext(supabase, input.date);

  if (!isSlotAvailable(service, context, input.startTime)) {
    throw new BookingEngineError(
      'The selected time is no longer available.',
      'SLOT_UNAVAILABLE',
    );
  }

  const endTime = getAppointmentEndTime(
    input.startTime,
    service.duration_minutes,
    service.buffer_minutes,
  );

  const payload: NewAppointmentRequest = {
    service_id: service.id,
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone.trim(),
    customer_instagram: input.customerInstagram?.trim() || null,
    notes: input.notes?.trim() || null,
    start_time: toTimestamptz(input.startTime),
    end_time: toTimestamptz(endTime),
  };

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...payload,
      status: 'pending',
    })
    .select('id, start_time, end_time, status')
    .single();

  if (error) {
    if (error.code === '23P01') {
      throw new BookingEngineError(
        'The selected time is no longer available.',
        'SLOT_UNAVAILABLE',
      );
    }

    throw new BookingEngineError(error.message, 'DATABASE_ERROR');
  }

  return data;
}

export async function createAppointmentRequestFromIso(
  supabase: SupabaseClient<Database>,
  input: Omit<CreateAppointmentInput, 'startTime'> & { startTimeIso: string },
) {
  return createAppointmentRequest(supabase, {
    ...input,
    startTime: fromTimestamptz(input.startTimeIso),
  });
}

export async function validateSelectedSlot(
  supabase: SupabaseClient<Database>,
  serviceId: string,
  date: string,
  startTime: Date,
) {
  const service = await fetchServiceById(supabase, serviceId);

  if (!service) {
    throw new BookingEngineError('Service not found.', 'SERVICE_NOT_FOUND');
  }

  if (!isBookableDateString(date)) {
    throw new BookingEngineError('Past dates cannot be booked.', 'INVALID_DATE');
  }

  if (!isBookableSlotStart(startTime, date)) {
    throw new BookingEngineError(
      'The selected time is not available.',
      'SLOT_UNAVAILABLE',
    );
  }

  const context = await loadDayBookingContext(supabase, date);
  const slot = findBookingSlot(service, context, startTime);

  if (!slot) {
    throw new BookingEngineError(
      'The selected time is not available.',
      'SLOT_UNAVAILABLE',
    );
  }

  return slot;
}

export type AppointmentRequestResult = Pick<
  Appointment,
  'id' | 'start_time' | 'end_time' | 'status'
>;
