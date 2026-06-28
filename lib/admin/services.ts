import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Service } from '@/lib/supabase/database.types';

export function validateServiceInput(input: {
  name?: string;
  priceJmd?: number;
  durationMinutes?: number;
  bufferMinutes?: number;
}) {
  if (input.name !== undefined && !input.name.trim()) {
    throw new Error('Service name is required.');
  }

  if (input.priceJmd !== undefined && input.priceJmd <= 0) {
    throw new Error('Price must be greater than zero.');
  }

  if (input.durationMinutes !== undefined && input.durationMinutes <= 0) {
    throw new Error('Duration must be greater than zero.');
  }

  if (input.bufferMinutes !== undefined && input.bufferMinutes < 0) {
    throw new Error('Buffer time cannot be negative.');
  }
}

export async function fetchAllServices(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('price_jmd', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function createService(
  supabase: SupabaseClient<Database>,
  input: {
    name: string;
    description?: string;
    priceJmd: number;
    durationMinutes: number;
    bufferMinutes?: number;
    active?: boolean;
  },
): Promise<Service> {
  validateServiceInput(input);

  const { data, error } = await supabase
    .from('services')
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() || '',
      price_jmd: input.priceJmd,
      duration_minutes: input.durationMinutes,
      buffer_minutes: input.bufferMinutes ?? 15,
      active: input.active ?? true,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateService(
  supabase: SupabaseClient<Database>,
  id: string,
  input: Partial<{
    name: string;
    description: string;
    priceJmd: number;
    durationMinutes: number;
    bufferMinutes: number;
    active: boolean;
  }>,
): Promise<Service> {
  validateServiceInput(input);

  const { data, error } = await supabase
    .from('services')
    .update({
      name: input.name?.trim(),
      description: input.description?.trim(),
      price_jmd: input.priceJmd,
      duration_minutes: input.durationMinutes,
      buffer_minutes: input.bufferMinutes,
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
