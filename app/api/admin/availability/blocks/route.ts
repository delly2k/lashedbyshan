import { NextResponse } from 'next/server';
import { AdminAuthError, requireAdmin } from '@/lib/admin/auth';
import {
  buildOneTimeBlockRange,
  createUnavailableBlock,
} from '@/lib/admin/availability';
import {
  buildWeeklyRecurrenceRule,
  getFullDayTimes,
} from '@/lib/booking/recurrence';
import { jamaicaLocalToUtc } from '@/lib/utils/datetime';

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.json();

    const isRecurring = Boolean(body.isRecurring);
    const fullDay = Boolean(body.fullDay);
    const startTime = fullDay ? getFullDayTimes().startTime : body.startTime;
    const endTime = fullDay ? getFullDayTimes().endTime : body.endTime;

    if (isRecurring) {
      const daysOfWeek = (body.daysOfWeek as number[]) ?? [];
      if (daysOfWeek.length === 0) {
        return NextResponse.json(
          { error: 'Select at least one day for recurring blocks.' },
          { status: 400 },
        );
      }

      const recurrenceRule = buildWeeklyRecurrenceRule({
        daysOfWeek,
        startTime,
        endTime,
        fullDay,
      });

      const anchorDate = body.anchorDate ?? '2025-01-01';
      const block = await createUnavailableBlock(supabase, {
        startTime: jamaicaLocalToUtc(anchorDate, startTime),
        endTime: jamaicaLocalToUtc(anchorDate, endTime),
        reason: body.reason,
        isRecurring: true,
        recurrenceRule,
      });

      return NextResponse.json({ block });
    }

    if (!body.date) {
      return NextResponse.json({ error: 'Date is required.' }, { status: 400 });
    }

    const range = buildOneTimeBlockRange(body.date, startTime, endTime);
    const block = await createUnavailableBlock(supabase, {
      startTime: range.startTime,
      endTime: range.endTime,
      reason: body.reason,
      isRecurring: false,
    });

    return NextResponse.json({ block });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create block.' },
      { status: 400 },
    );
  }
}
