import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AvailabilityOverride,
  AvailabilityRule,
  Database,
  UnavailableBlock,
} from '@/lib/supabase/database.types';
import { expandRecurringBlocksForDate } from '@/lib/booking/recurrence';
import {
  getTodayJamaicaDateString,
  isValidBookingDateString,
  jamaicaLocalToUtc,
  toTimestamptz,
} from '@/lib/utils/datetime';

export type AdminAvailabilityData = {
  rules: AvailabilityRule[];
  overrides: AvailabilityOverride[];
  blocks: UnavailableBlock[];
};

function assertValidTimeOrder(startTime: string, endTime: string) {
  if (endTime <= startTime) {
    throw new Error('End time must be after start time.');
  }
}

export async function fetchAllAvailabilityRules(
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase
    .from('availability_rules')
    .select('*')
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchUpcomingAvailabilityOverrides(
  supabase: SupabaseClient<Database>,
) {
  const today = getTodayJamaicaDateString();
  const { data, error } = await supabase
    .from('availability_overrides')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchAllUnavailableBlocks(
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase
    .from('unavailable_blocks')
    .select('*')
    .order('is_recurring', { ascending: false })
    .order('start_time', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchAdminAvailabilityData(
  supabase: SupabaseClient<Database>,
): Promise<AdminAvailabilityData> {
  const [rules, overrides, blocks] = await Promise.all([
    fetchAllAvailabilityRules(supabase),
    fetchUpcomingAvailabilityOverrides(supabase),
    fetchAllUnavailableBlocks(supabase),
  ]);

  return { rules, overrides, blocks };
}

export async function createAvailabilityRule(
  supabase: SupabaseClient<Database>,
  input: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    active?: boolean;
  },
) {
  assertValidTimeOrder(input.startTime, input.endTime);

  const { data, error } = await supabase
    .from('availability_rules')
    .insert({
      day_of_week: input.dayOfWeek,
      start_time: input.startTime,
      end_time: input.endTime,
      active: input.active ?? true,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateAvailabilityRule(
  supabase: SupabaseClient<Database>,
  id: string,
  input: Partial<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    active: boolean;
  }>,
) {
  if (input.startTime && input.endTime) {
    assertValidTimeOrder(input.startTime, input.endTime);
  }

  const { data, error } = await supabase
    .from('availability_rules')
    .update({
      day_of_week: input.dayOfWeek,
      start_time: input.startTime,
      end_time: input.endTime,
      active: input.active,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteAvailabilityRule(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { error } = await supabase
    .from('availability_rules')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function createAvailabilityOverride(
  supabase: SupabaseClient<Database>,
  input: {
    date: string;
    startTime: string;
    endTime: string;
    type: AvailabilityOverride['type'];
    note?: string | null;
  },
) {
  if (!isValidBookingDateString(input.date)) {
    throw new Error('Invalid date.');
  }

  assertValidTimeOrder(input.startTime, input.endTime);

  const { data, error } = await supabase
    .from('availability_overrides')
    .insert({
      date: input.date,
      start_time: input.startTime,
      end_time: input.endTime,
      type: input.type,
      note: input.note?.trim() || null,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateAvailabilityOverride(
  supabase: SupabaseClient<Database>,
  id: string,
  input: Partial<{
    date: string;
    startTime: string;
    endTime: string;
    type: AvailabilityOverride['type'];
    note: string | null;
  }>,
) {
  if (input.startTime && input.endTime) {
    assertValidTimeOrder(input.startTime, input.endTime);
  }

  const { data, error } = await supabase
    .from('availability_overrides')
    .update({
      date: input.date,
      start_time: input.startTime,
      end_time: input.endTime,
      type: input.type,
      note: input.note,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteAvailabilityOverride(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { error } = await supabase
    .from('availability_overrides')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function createUnavailableBlock(
  supabase: SupabaseClient<Database>,
  input: {
    startTime: Date;
    endTime: Date;
    reason?: string | null;
    isRecurring?: boolean;
    recurrenceRule?: string | null;
  },
) {
  if (input.endTime <= input.startTime) {
    throw new Error('End time must be after start time.');
  }

  const { data, error } = await supabase
    .from('unavailable_blocks')
    .insert({
      start_time: toTimestamptz(input.startTime),
      end_time: toTimestamptz(input.endTime),
      reason: input.reason?.trim() || null,
      is_recurring: input.isRecurring ?? false,
      recurrence_rule: input.recurrenceRule ?? null,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUnavailableBlock(
  supabase: SupabaseClient<Database>,
  id: string,
  input: Partial<{
    startTime: Date;
    endTime: Date;
    reason: string | null;
    isRecurring: boolean;
    recurrenceRule: string | null;
  }>,
) {
  if (input.startTime && input.endTime && input.endTime <= input.startTime) {
    throw new Error('End time must be after start time.');
  }

  const { data, error } = await supabase
    .from('unavailable_blocks')
    .update({
      start_time: input.startTime ? toTimestamptz(input.startTime) : undefined,
      end_time: input.endTime ? toTimestamptz(input.endTime) : undefined,
      reason: input.reason,
      is_recurring: input.isRecurring,
      recurrence_rule: input.recurrenceRule,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteUnavailableBlock(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { error } = await supabase.from('unavailable_blocks').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

export function buildOneTimeBlockRange(date: string, startTime: string, endTime: string) {
  return {
    startTime: jamaicaLocalToUtc(date, startTime),
    endTime: jamaicaLocalToUtc(date, endTime),
  };
}

export async function fetchExpandedUnavailableBlocksForDate(
  supabase: SupabaseClient<Database>,
  date: string,
): Promise<Array<{ start_time: string; end_time: string }>> {
  if (!isValidBookingDateString(date)) {
    throw new Error('Invalid date.');
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
    throw oneTimeError ?? recurringError;
  }

  const expandedRecurring = expandRecurringBlocksForDate(recurring ?? [], date);

  return [...(oneTime ?? []), ...expandedRecurring];
}
