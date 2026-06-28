import type { SupabaseClient } from '@supabase/supabase-js';
import {
  generateBookingSlots,
  getAppointmentEndTime,
  isSlotAvailable,
} from '@/lib/booking/engine';
import type { Database } from '@/lib/supabase/database.types';
import type { TablesUpdate } from '@/lib/supabase/database.types';
import type { AdminAppointment, AdminDashboardData } from '@/lib/admin/types';
import type { AppointmentStatus } from '@/lib/supabase/database.types';
import {
  formatSlotLabel,
  fromTimestamptz,
  getTodayJamaicaDateString,
  toJamaicaDateString,
  toTimestamptz,
} from '@/lib/utils/datetime';

const APPOINTMENT_SELECT = `
  *,
  service:services(*)
`;

export async function fetchAdminAppointments(
  supabase: SupabaseClient<Database>,
  options: {
    date?: string;
    status?: AppointmentStatus;
    upcoming?: boolean;
    today?: boolean;
    search?: string;
  } = {},
): Promise<AdminAppointment[]> {
  let query = supabase
    .from('appointments')
    .select(APPOINTMENT_SELECT)
    .order('start_time', { ascending: true });

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.today) {
    const today = getTodayJamaicaDateString();
    const dayStart = `${today}T00:00:00-05:00`;
    const dayEnd = `${today}T23:59:59.999-05:00`;
    query = query.gte('start_time', dayStart).lte('start_time', dayEnd);
  } else if (options.date) {
    const dayStart = `${options.date}T00:00:00-05:00`;
    const dayEnd = `${options.date}T23:59:59.999-05:00`;
    query = query.gte('start_time', dayStart).lte('start_time', dayEnd);
  }

  if (options.upcoming) {
    query = query
      .gte('start_time', new Date().toISOString())
      .in('status', ['pending', 'confirmed']);
  }

  if (options.search?.trim()) {
    const term = options.search.trim().replace(/[%_,]/g, '');
    if (term) {
      query = query.or(
        `customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%,customer_instagram.ilike.%${term}%`,
      );
    }
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminAppointment[];
}

export async function fetchAdminDashboardData(
  supabase: SupabaseClient<Database>,
): Promise<AdminDashboardData> {
  const today = getTodayJamaicaDateString();
  const dayStart = `${today}T00:00:00-05:00`;
  const dayEnd = `${today}T23:59:59.999-05:00`;
  const nowIso = new Date().toISOString();

  const [
    todayResult,
    upcomingResult,
    pendingResult,
    confirmedResult,
    pendingListResult,
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT)
      .gte('start_time', dayStart)
      .lte('start_time', dayEnd)
      .order('start_time', { ascending: true }),
    supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT)
      .gte('start_time', nowIso)
      .in('status', ['pending', 'confirmed'])
      .order('start_time', { ascending: true })
      .limit(8),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .gte('start_time', nowIso),
    supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT)
      .eq('status', 'pending')
      .order('start_time', { ascending: true })
      .limit(6),
  ]);

  if (
    todayResult.error ||
    upcomingResult.error ||
    pendingResult.error ||
    confirmedResult.error ||
    pendingListResult.error
  ) {
    throw (
      todayResult.error ??
      upcomingResult.error ??
      pendingResult.error ??
      confirmedResult.error ??
      pendingListResult.error
    );
  }

  const todayAppointments = (todayResult.data ?? []) as AdminAppointment[];

  return {
    stats: {
      todayCount: todayAppointments.length,
      pendingCount: pendingResult.count ?? 0,
      confirmedCount: confirmedResult.count ?? 0,
      upcomingCount: upcomingResult.data?.length ?? 0,
    },
    todayAppointments,
    upcomingAppointments: (upcomingResult.data ?? []) as AdminAppointment[],
    pendingAppointments: (pendingListResult.data ?? []) as AdminAppointment[],
  };
}

export async function updateAdminAppointment(
  supabase: SupabaseClient<Database>,
  appointmentId: string,
  input: {
    status?: AdminAppointment['status'];
    startTime?: Date;
    date?: string;
  },
) {
  const { data: existing, error: fetchError } = await supabase
    .from('appointments')
    .select(APPOINTMENT_SELECT)
    .eq('id', appointmentId)
    .single();

  if (fetchError || !existing) {
    throw new Error('Appointment not found.');
  }

  const appointment = existing as AdminAppointment;
  const updates: TablesUpdate<'appointments'> = {};

  if (input.status) {
    updates.status = input.status;
  }

  if (input.startTime) {
    const date =
      input.date ?? toJamaicaDateString(fromTimestamptz(appointment.start_time));
    const { loadDayBookingContext } = await import('@/lib/booking/queries');
    const context = await loadDayBookingContext(supabase, date);
    const blockingWithoutSelf = context.blockingAppointments.filter(
      (item) =>
        item.start_time !== appointment.start_time ||
        item.end_time !== appointment.end_time,
    );

    const rescheduleContext = {
      ...context,
      blockingAppointments: blockingWithoutSelf,
    };

    if (
      !isSlotAvailable(
        appointment.service,
        rescheduleContext,
        input.startTime,
      )
    ) {
      throw new Error('The selected time is not available.');
    }

    updates.start_time = toTimestamptz(input.startTime);
    updates.end_time = toTimestamptz(
      getAppointmentEndTime(
        input.startTime,
        appointment.service.duration_minutes,
        appointment.service.buffer_minutes,
      ),
    );
  }

  if (Object.keys(updates).length === 0) {
    return appointment;
  }

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .select(APPOINTMENT_SELECT)
    .single();

  if (error) {
    if (error.code === '23P01') {
      throw new Error('The selected time is no longer available.');
    }
    throw error;
  }

  return data as AdminAppointment;
}

export async function getRescheduleSlots(
  supabase: SupabaseClient<Database>,
  appointmentId: string,
  date: string,
) {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(APPOINTMENT_SELECT)
    .eq('id', appointmentId)
    .single();

  if (error || !appointment) {
    throw new Error('Appointment not found.');
  }

  const typedAppointment = appointment as AdminAppointment;
  const { loadDayBookingContext } = await import('@/lib/booking/queries');
  const context = await loadDayBookingContext(supabase, date);
  const contextWithoutSelf = {
    ...context,
    blockingAppointments: context.blockingAppointments.filter(
      (item) =>
        item.start_time !== typedAppointment.start_time ||
        item.end_time !== typedAppointment.end_time,
    ),
  };

  return generateBookingSlots(typedAppointment.service, contextWithoutSelf).map(
    (slot) => ({
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      label: formatSlotLabel(slot.startTime),
      date: slot.date,
    }),
  );
}
