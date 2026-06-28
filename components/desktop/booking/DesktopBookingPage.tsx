'use client';

import type { CustomerBookingStep } from '@/hooks/useCustomerBooking';
import { useCustomerBooking } from '@/hooks/useCustomerBooking';
import { DesktopShell } from '@/components/desktop/shared/DesktopShell';
import { BookingAlert, BookingLoadingState } from '@/components/shared/booking/BookingStates';
import { formatSelectedDateLabel } from '@/components/shared/booking/BookingCalendar';
import { BookingCalendar } from '@/components/shared/booking/BookingCalendar';
import { BookingReview, BookingSuccess } from '@/components/shared/booking/BookingReview';
import { CustomerDetailsForm } from '@/components/shared/booking/CustomerDetailsForm';
import { ServicePicker } from '@/components/shared/booking/ServicePicker';
import { TimeSlotPicker } from '@/components/shared/booking/TimeSlotPicker';
import { Button } from '@/components/shared/ui/Button';
import { Card } from '@/components/shared/ui/Card';
import { formatPriceJmd } from '@/lib/booking/format';
import { BookingWizardHeader } from '@/components/desktop/booking/BookingWizardHeader';

function getVisibleStep(step: CustomerBookingStep): number {
  switch (step) {
    case 'service':
      return 0;
    case 'date':
    case 'time':
      return 1;
    case 'details':
      return 2;
    case 'confirm':
      return 3;
    default:
      return 0;
  }
}

export function DesktopBookingPage() {
  const booking = useCustomerBooking();

  if (booking.isLoadingServices) {
    return (
      <DesktopShell showFooter={false}>
        <div className="mx-auto max-w-6xl px-8">
          <BookingLoadingState message="Loading services..." />
        </div>
      </DesktopShell>
    );
  }

  if (booking.step === 'success' && booking.selectedService && booking.selectedDate && booking.selectedSlot) {
    return (
      <DesktopShell showFooter={false}>
        <div className="mx-auto max-w-2xl px-8 py-6">
          <BookingSuccess
            service={booking.selectedService}
            date={booking.selectedDate}
            slot={booking.selectedSlot}
            details={booking.details}
            confirmation={booking.confirmation}
          />
          <div className="mt-6 flex gap-4">
            <Button href="/" size="lg" className="flex-1">
              Back to home
            </Button>
            <Button onClick={booking.resetBooking} variant="secondary" size="lg" className="flex-1">
              Book another appointment
            </Button>
          </div>
        </div>
      </DesktopShell>
    );
  }

  const visibleStep = getVisibleStep(booking.step);
  const chips: { label: string }[] = [];

  if (booking.selectedService) {
    chips.push({
      label: `${booking.selectedService.name} · ${formatPriceJmd(booking.selectedService.price_jmd)}`,
    });
  }

  if (booking.selectedService && booking.selectedDate && booking.selectedSlot) {
    chips.push({
      label: `${formatSelectedDateLabel(booking.selectedDate)} · ${booking.selectedSlot.label}`,
    });
  }

  return (
    <DesktopShell showFooter={false}>
      <div className="mx-auto max-w-3xl px-8 py-6">
        <BookingWizardHeader currentVisibleStep={visibleStep} chips={chips} />

        <Card variant="elevated" className="min-h-[420px] p-8">
          {booking.step === 'service' ? (
            <>
              <h2 className="font-display text-xl font-semibold text-rose-ink">
                Choose your service
              </h2>
              <div className="mt-6">
                <ServicePicker
                  services={booking.services}
                  selectedServiceId={booking.selectedService?.id}
                  onSelect={booking.selectService}
                  variant="desktop"
                />
              </div>
            </>
          ) : null}

          {booking.step === 'date' || booking.step === 'time' ? (
            <>
              <h2 className="font-display text-xl font-semibold text-rose-ink">
                Pick a date & time
              </h2>
              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <BookingCalendar
                  selectedDate={booking.selectedDate}
                  onSelectDate={(date) => {
                    booking.selectDate(date);
                    if (booking.step === 'date') {
                      booking.goToStep('time');
                    }
                  }}
                  variant="desktop"
                />
                <div>
                  {booking.selectedDate ? (
                    <>
                      <p className="mb-3 text-sm font-medium text-brand-black/70">
                        {formatSelectedDateLabel(booking.selectedDate)}
                      </p>
                      <TimeSlotPicker
                        slots={booking.slots}
                        selectedSlot={booking.selectedSlot}
                        onSelect={booking.selectSlot}
                        isLoading={booking.isLoadingSlots}
                        variant="desktop"
                      />
                    </>
                  ) : (
                    <p className="text-sm text-brand-black/50">
                      Select a date to view available times.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : null}

          {booking.step === 'details' ? (
            <>
              <h2 className="font-display text-xl font-semibold text-rose-ink">
                Your details
              </h2>
              <div className="mt-6">
                <CustomerDetailsForm
                  values={booking.details}
                  errors={booking.fieldErrors}
                  onChange={booking.updateDetails}
                />
              </div>
            </>
          ) : null}

          {booking.step === 'confirm' &&
          booking.selectedService &&
          booking.selectedDate &&
          booking.selectedSlot ? (
            <>
              <h2 className="font-display text-xl font-semibold text-rose-ink">
                Review your booking
              </h2>
              <div className="mt-6">
                <BookingReview
                  service={booking.selectedService}
                  date={booking.selectedDate}
                  slot={booking.selectedSlot}
                  details={booking.details}
                />
              </div>
            </>
          ) : null}

          {booking.error ? (
            <div className="mt-6">
              <BookingAlert message={booking.error} />
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-brand-blush/25 pt-6">
            <Button
              onClick={booking.goBack}
              variant="secondary"
              size="lg"
              className="!h-12 !rounded-full border border-rose-gold/50 bg-transparent px-6 text-rose-ink hover:bg-brand-cream"
            >
              Back
            </Button>
            {booking.step === 'confirm' ? (
              <Button
                onClick={() => void booking.submitBooking()}
                size="lg"
                disabled={booking.isSubmitting}
                className="!h-12 !rounded-full bg-rose-ink px-8 text-white hover:bg-rose-ink/90"
              >
                {booking.isSubmitting ? 'Submitting...' : 'Confirm booking'}
              </Button>
            ) : (
              <Button
                onClick={booking.goNext}
                size="lg"
                disabled={!booking.canContinue}
                className="!h-12 !rounded-full bg-rose-ink px-8 text-white hover:bg-rose-ink/90 disabled:opacity-50"
              >
                Continue
              </Button>
            )}
          </div>
        </Card>
      </div>
    </DesktopShell>
  );
}
