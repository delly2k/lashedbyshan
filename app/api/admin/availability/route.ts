import { NextResponse } from 'next/server';
import { AdminAuthError, requireAdmin } from '@/lib/admin/auth';
import { fetchAdminAvailabilityData } from '@/lib/admin/availability';

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    const data = await fetchAdminAvailabilityData(supabase);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Unable to load availability data.' },
      { status: 500 },
    );
  }
}
