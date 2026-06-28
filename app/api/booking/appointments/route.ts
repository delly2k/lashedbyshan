import { NextResponse } from 'next/server';
import {
  BookingEngineError,
  submitAppointmentRequestServer,
} from '@/lib/booking';
import {
  hasFormErrors,
  validateCustomerForm,
  type CustomerFormData,
} from '@/lib/booking/validation';
import { fromTimestamptz, isBookableDateString, isValidBookingDateString } from '@/lib/utils/datetime';

type AppointmentRequestBody = {
  serviceId?: string;
  date?: string;
  startTime?: string;
  customer?: Partial<CustomerFormData>;
};

export async function POST(request: Request) {
  let body: AppointmentRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const serviceId = body.serviceId?.trim();
  const date = body.date?.trim();
  const startTimeIso = body.startTime?.trim();
  const customer = body.customer ?? {};

  if (!serviceId || !date || !startTimeIso) {
    return NextResponse.json(
      { error: 'Service, date, and time are required.' },
      { status: 400 },
    );
  }

  if (!isValidBookingDateString(date)) {
    return NextResponse.json({ error: 'Invalid date.' }, { status: 400 });
  }

  if (!isBookableDateString(date)) {
    return NextResponse.json({ error: 'Past dates cannot be booked.' }, { status: 400 });
  }

  const formData: CustomerFormData = {
    name: customer.name ?? '',
    phone: customer.phone ?? '',
    instagram: customer.instagram ?? '',
    notes: customer.notes ?? '',
  };

  const formErrors = validateCustomerForm(formData);

  if (hasFormErrors(formErrors)) {
    return NextResponse.json(
      { error: 'Please check your details.', fieldErrors: formErrors },
      { status: 400 },
    );
  }

  try {
    const appointment = await submitAppointmentRequestServer({
      serviceId,
      date,
      startTime: fromTimestamptz(startTimeIso),
      customerName: formData.name.trim(),
      customerPhone: formData.phone.trim(),
      customerInstagram: formData.instagram.trim() || null,
      notes: formData.notes.trim() || null,
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    if (error instanceof BookingEngineError) {
      const status =
        error.code === 'SERVICE_NOT_FOUND'
          ? 404
          : error.code === 'SLOT_UNAVAILABLE'
            ? 409
            : 400;

      return NextResponse.json({ error: error.message, code: error.code }, {
        status,
      });
    }

    return NextResponse.json(
      { error: 'Unable to submit your booking. Please try again.' },
      { status: 500 },
    );
  }
}
