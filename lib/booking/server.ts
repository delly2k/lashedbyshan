import { createAdminClient } from '@/lib/supabase/admin';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import {
  createAppointmentRequest,
  fetchActiveServices,
  getAvailableSlots,
  loadDayBookingContext,
  type CreateAppointmentInput,
} from '@/lib/booking/queries';

/**
 * Server-side booking data loader.
 * Uses the service role because availability tables are admin-only in RLS.
 * Never expose raw unavailable block reasons to customers.
 */
function getServerBookingClient(): SupabaseClient<Database> {
  return createAdminClient();
}

export async function getActiveServicesServer() {
  return fetchActiveServices(getServerBookingClient());
}

export async function getDayBookingContextServer(date: string) {
  return loadDayBookingContext(getServerBookingClient(), date);
}

export async function getAvailableSlotsServer(serviceId: string, date: string) {
  return getAvailableSlots(getServerBookingClient(), serviceId, date);
}

export async function submitAppointmentRequestServer(input: CreateAppointmentInput) {
  return createAppointmentRequest(getServerBookingClient(), input);
}
