import { NextResponse } from 'next/server';
import {
  BookingEngineError,
  getAvailableSlotsServer,
  serializeBookingSlot,
} from '@/lib/booking';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('serviceId');
  const date = searchParams.get('date');

  if (!serviceId || !date) {
    return NextResponse.json(
      { error: 'serviceId and date are required.' },
      { status: 400 },
    );
  }

  try {
    const slots = await getAvailableSlotsServer(serviceId, date);

    return NextResponse.json({
      date,
      serviceId,
      slots: slots.map(serializeBookingSlot),
    });
  } catch (error) {
    if (error instanceof BookingEngineError) {
      return NextResponse.json({ error: error.message, code: error.code }, {
        status: error.code === 'SERVICE_NOT_FOUND' ? 404 : 400,
      });
    }

    return NextResponse.json(
      { error: 'Unable to load available slots.' },
      { status: 500 },
    );
  }
}
