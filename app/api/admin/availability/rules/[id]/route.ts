import { NextResponse } from 'next/server';
import { AdminAuthError, requireAdmin } from '@/lib/admin/auth';
import {
  deleteAvailabilityRule,
  updateAvailabilityRule,
} from '@/lib/admin/availability';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const rule = await updateAvailabilityRule(supabase, id, {
      dayOfWeek: body.dayOfWeek !== undefined ? Number(body.dayOfWeek) : undefined,
      startTime: body.startTime,
      endTime: body.endTime,
      active: body.active,
    });

    return NextResponse.json({ rule });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update rule.' },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await context.params;
    await deleteAvailabilityRule(supabase, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Unable to delete rule.' },
      { status: 500 },
    );
  }
}
