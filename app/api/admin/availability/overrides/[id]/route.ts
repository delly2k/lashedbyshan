import { NextResponse } from 'next/server';
import { AdminAuthError, requireAdmin } from '@/lib/admin/auth';
import {
  deleteAvailabilityOverride,
  updateAvailabilityOverride,
} from '@/lib/admin/availability';
import type { AvailabilityOverrideType } from '@/lib/supabase/database.types';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const override = await updateAvailabilityOverride(supabase, id, {
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      type: body.type as AvailabilityOverrideType | undefined,
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
          error instanceof Error ? error.message : 'Unable to update override.',
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await context.params;
    await deleteAvailabilityOverride(supabase, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Unable to delete override.' },
      { status: 500 },
    );
  }
}
