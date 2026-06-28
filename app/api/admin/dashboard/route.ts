import { NextResponse } from 'next/server';
import { AdminAuthError, requireAdmin } from '@/lib/admin/auth';
import { fetchAdminDashboardData } from '@/lib/admin/appointments';

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    const data = await fetchAdminDashboardData(supabase);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Unable to load dashboard data.' },
      { status: 500 },
    );
  }
}
