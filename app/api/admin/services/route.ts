import { NextResponse } from 'next/server';
import { AdminAuthError, requireAdmin } from '@/lib/admin/auth';
import { createService, fetchAllServices } from '@/lib/admin/services';

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    const services = await fetchAllServices(supabase);
    return NextResponse.json({ services });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Unable to load services.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.json();

    const service = await createService(supabase, {
      name: body.name,
      description: body.description,
      priceJmd: Number(body.priceJmd),
      durationMinutes: Number(body.durationMinutes),
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
      { error: error instanceof Error ? error.message : 'Unable to create service.' },
      { status: 400 },
    );
  }
}
