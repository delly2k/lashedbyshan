import { NextResponse } from 'next/server';
import { AdminAuthError, requireAdmin } from '@/lib/admin/auth';
import { updateService } from '@/lib/admin/services';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const service = await updateService(supabase, id, {
      name: body.name,
      description: body.description,
      priceJmd: body.priceJmd !== undefined ? Number(body.priceJmd) : undefined,
      durationMinutes:
        body.durationMinutes !== undefined
          ? Number(body.durationMinutes)
          : undefined,
      bufferMinutes:
        body.bufferMinutes !== undefined ? Number(body.bufferMinutes) : undefined,
      active: body.active,
    });

    return NextResponse.json({ service });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update service.' },
      { status: 400 },
    );
  }
}
