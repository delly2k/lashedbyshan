import { NextResponse } from 'next/server';
import { getActiveServicesServer } from '@/lib/booking/server';
import { BookingEngineError } from '@/lib/booking/queries';

export async function GET() {
  try {
    const services = await getActiveServicesServer();

    return NextResponse.json({ services });
  } catch (error) {
    if (error instanceof BookingEngineError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'Unable to load services. Please try again.' },
      { status: 500 },
    );
  }
}
