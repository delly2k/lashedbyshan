import { NextResponse } from 'next/server';
import { AdminAuthError, requireAdmin } from '@/lib/admin/auth';
import {
  buildOneTimeBlockRange,
  deleteUnavailableBlock,
  updateUnavailableBlock,
} from '@/lib/admin/availability';
import {
  buildWeeklyRecurrenceRule,
  getFullDayTimes,
} from '@/lib/booking/recurrence';
import { jamaicaLocalToUtc } from '@/lib/utils/datetime';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const isRecurring = Boolean(body.isRecurring);
    const fullDay = Boolean(body.fullDay);
    const startTime = fullDay ? getFullDayTimes().startTime : body.startTime;
    const endTime = fullDay ? getFullDayTimes().endTime : body.endTime;

    if (isRecurring) {
      const daysOfWeek = (body.daysOfWeek as number[]) ?? [];
      const recurrenceRule = buildWeeklyRecurrenceRule({
        daysOfWeek,
        startTime,
        endTime,
        fullDay,
      });
      const anchorDate = body.anchorDate ?? '2025-01-01';

      const block = await updateUnavailableBlock(supabase, id, {
        startTime: jamaicaLocalToUtc(anchorDate, startTime),
        endTime: jamaicaLocalToUtc(anchorDate, endTime),
        reason: body.reason ?? null,
        isRecurring: true,
        recurrenceRule,
      });

      return NextResponse.json({ block });
    }

    const range = buildOneTimeBlockRange(body.date, startTime, endTime);
    const block = await updateUnavailableBlock(supabase, id, {
      startTime: range.startTime,
      endTime: range.endTime,
      reason: body.reason ?? null,
      isRecurring: false,
      recurrenceRule: null,
    });

    return NextResponse.json({ block });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update block.' },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await context.params;
    await deleteUnavailableBlock(supabase, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Unable to delete block.' },
      { status: 500 },
    );
  }
}
