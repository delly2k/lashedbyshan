import { NextResponse } from 'next/server';
import { AdminAuthError, requireAdmin } from '@/lib/admin/auth';
import {
  getRescheduleSlots,
  updateAdminAppointment,
} from '@/lib/admin/appointments';
import type { AppointmentStatus } from '@/lib/supabase/database.types';
import { fromTimestamptz, isValidBookingDateString } from '@/lib/utils/datetime';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const VALID_STATUSES: AppointmentStatus[] = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
];

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const status = body.status as AppointmentStatus | undefined;
    const startTimeIso = body.startTime as string | undefined;
    const date = body.date as string | undefined;

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    if (date && !isValidBookingDateString(date)) {
      return NextResponse.json({ error: 'Invalid date.' }, { status: 400 });
    }

    const appointment = await updateAdminAppointment(supabase, id, {
      status,
      startTime: startTimeIso ? fromTimestamptz(startTimeIso) : undefined,
      date,
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Unable to update appointment.' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date || !isValidBookingDateString(date)) {
      return NextResponse.json({ error: 'Valid date is required.' }, {
        status: 400,
      });
    }

    const slots = await getRescheduleSlots(supabase, id, date);
    return NextResponse.json({ slots });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Unable to load reschedule slots.' },
      { status: 500 },
    );
  }
}
