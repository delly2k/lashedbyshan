'use client';

import Link from 'next/link';
import { useCustomerBooking } from '@/hooks/useCustomerBooking';
import { MobileBookingShell } from '@/components/mobile/shared/MobileBookingShell';
import { BookingAlert, BookingLoadingState } from '@/components/shared/booking/BookingStates';
import { BookingStepIndicator } from '@/components/shared/booking/BookingStepIndicator';
import { formatSelectedDateLabel } from '@/components/shared/booking/BookingCalendar';
import { BookingCalendar } from '@/components/shared/booking/BookingCalendar';
import {
  BookingReview,
  BookingSuccess,
  BookingWhatsAppButton,
} from '@/components/shared/booking/BookingReview';
import { CustomerDetailsForm } from '@/components/shared/booking/CustomerDetailsForm';
import { ServicePicker, ServiceSummaryCard } from '@/components/shared/booking/ServicePicker';
import { TimeSlotPicker } from '@/components/shared/booking/TimeSlotPicker';
import { Button } from '@/components/shared/ui/Button';
import { Logo } from '@/components/shared/ui/Logo';

const STEP_TITLES = {
  service: 'Choose your service',
  date: 'Pick a date',
  time: 'Select a time',
  details: 'Your details',
  confirm: 'Confirm booking',
  success: 'All set',
} as const;

export function MobileBookingPage() {
  const booking = useCustomerBooking();

  if (booking.isLoadingServices) {
    return (
      <MobileBookingShell>
        <BookingLoadingState message="Loading services..." />
      </MobileBookingShell>
    );
  }

  if (booking.step === 'success' && booking.selectedService && booking.selectedDate && booking.selectedSlot) {
    return (
      <MobileBookingShell
        className="!pb-40"
        footer={
          <div className="flex flex-col gap-3">
            <BookingWhatsAppButton />
            <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={booking.resetBooking}
              size="lg"
              className="flex items-center justify-center gap-2 !h-12 !rounded-full bg-rose-ink text-white hover:bg-rose-ink/90"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M3 11l9-7 9 7" />
                <path d="M5 10v10a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V10" />
              </svg>
              Book again
            </Button>
            <Button
              href="/"
              variant="secondary"
              size="lg"
              className="flex items-center justify-center gap-2 !h-12 !rounded-full border border-rose-gold/50 bg-transparent text-rose-ink hover:bg-brand-cream"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M3 11l9-7 9 7" />
                <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
              </svg>
              Home
            </Button>
            </div>
          </div>
        }
      >
        <BookingSuccess
          service={booking.selectedService}
          date={booking.selectedDate}
          slot={booking.selectedSlot}
          details={booking.details}
          confirmation={booking.confirmation}
          showWhatsAppButton={false}
        />
      </MobileBookingShell>
    );
  }

  const showFooter = booking.step !== 'success';

  return (
    <MobileBookingShell
      footer={
        showFooter ? (
          <div className="flex flex-col gap-3">
            {booking.error ? <BookingAlert message={booking.error} /> : null}
            <div className="flex gap-3">
              <Button
                onClick={booking.goBack}
                variant="secondary"
                size="lg"
                className="min-w-[96px]"
              >
                Back
              </Button>
              {booking.step === 'confirm' ? (
                <Button
                  onClick={() => void booking.submitBooking()}
                  size="lg"
                  className="flex-1"
                  disabled={booking.isSubmitting}
                >
                  {booking.isSubmitting ? 'Submitting...' : 'Confirm booking'}
                </Button>
              ) : (
                <Button
                  onClick={booking.goNext}
                  size="lg"
                  className="flex-1"
                  disabled={!booking.canContinue}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        ) : undefined
      }
    >
      <div className="mb-5 flex items-center justify-between">
        <Link href="/" className="text-sm text-brand-black/50">
          ← Home
        </Link>
        <Logo size="sm" />
      </div>

      <BookingStepIndicator currentStep={booking.step} />

      <div className="mt-6">
        <h1 className="font-display text-2xl font-semibold text-brand-black">
          {STEP_TITLES[booking.step]}
        </h1>
        {booking.selectedService && booking.step !== 'service' ? (
          <p className="mt-2 text-sm text-brand-black/60">
            {booking.selectedService.name}
            {booking.selectedDate && booking.step !== 'date'
              ? ` · ${formatSelectedDateLabel(booking.selectedDate)}`
              : ''}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {booking.step === 'service' ? (
          <ServicePicker
            services={booking.services}
            selectedServiceId={booking.selectedService?.id}
            onSelect={booking.selectService}
          />
        ) : null}

        {booking.step === 'date' && booking.selectedService ? (
          <>
            <ServiceSummaryCard service={booking.selectedService} />
            <BookingCalendar
              selectedDate={booking.selectedDate}
              onSelectDate={booking.selectDate}
            />
          </>
        ) : null}

        {booking.step === 'time' && booking.selectedService && booking.selectedDate ? (
          <>
            <ServiceSummaryCard service={booking.selectedService} />
            <div>
              <p className="mb-3 text-sm font-medium text-brand-black/70">
                {formatSelectedDateLabel(booking.selectedDate)}
              </p>
              <TimeSlotPicker
                slots={booking.slots}
                selectedSlot={booking.selectedSlot}
                onSelect={booking.selectSlot}
                isLoading={booking.isLoadingSlots}
              />
            </div>
          </>
        ) : null}

        {booking.step === 'details' ? (
          <CustomerDetailsForm
            values={booking.details}
            errors={booking.fieldErrors}
            onChange={booking.updateDetails}
          />
        ) : null}

        {booking.step === 'confirm' &&
        booking.selectedService &&
        booking.selectedDate &&
        booking.selectedSlot ? (
          <BookingReview
            service={booking.selectedService}
            date={booking.selectedDate}
            slot={booking.selectedSlot}
            details={booking.details}
          />
        ) : null}
      </div>
    </MobileBookingShell>
  );
}
