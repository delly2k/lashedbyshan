import { NextResponse } from 'next/server';
import { AdminAuthError, requireAdmin } from '@/lib/admin/auth';
import { fetchAdminAppointments } from '@/lib/admin/appointments';
import type { AppointmentStatus } from '@/lib/supabase/database.types';

const STATUS_VIEWS: AppointmentStatus[] = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
];

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');
    const date = searchParams.get('date') ?? undefined;
    const search = searchParams.get('q') ?? undefined;
    const legacyStatus = searchParams.get('status');

    const resolvedView =
      view ??
      (legacyStatus && STATUS_VIEWS.includes(legacyStatus as AppointmentStatus)
        ? legacyStatus
        : date
          ? 'date'
          : 'today');

    const status =
      resolvedView && STATUS_VIEWS.includes(resolvedView as AppointmentStatus)
        ? (resolvedView as AppointmentStatus)
        : undefined;

    const appointments = await fetchAdminAppointments(supabase, {
      date: resolvedView === 'date' ? date : undefined,
      status,
      upcoming: resolvedView === 'upcoming',
      today: resolvedView === 'today',
      search,
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Unable to load appointments.' },
      { status: 500 },
    );
  }
}
