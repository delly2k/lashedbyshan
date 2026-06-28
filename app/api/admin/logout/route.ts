import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

export async function POST() {
  try {
    const { supabase } = await requireAdmin();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
