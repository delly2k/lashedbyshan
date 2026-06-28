import { NextResponse } from 'next/server';
import { AdminAuthError, requireAdmin } from '@/lib/admin/auth';
import { createAvailabilityOverride } from '@/lib/admin/availability';
import type { AvailabilityOverrideType } from '@/lib/supabase/database.types';

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.json();

    const override = await createAvailabilityOverride(supabase, {
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      type: body.type as AvailabilityOverrideType,
      note: body.note,
    });

    return NextResponse.json({ override });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to create override.',
      },
      { status: 400 },
    );
  }
}
