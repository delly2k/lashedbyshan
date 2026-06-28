import type { CustomerFormData } from '@/lib/booking/validation';
import type { Service } from '@/lib/booking/types';
import type { SerializedBookingSlot } from '@/hooks/useCustomerBooking';
import { formatSelectedDateLabel } from '@/components/shared/booking/BookingCalendar';
import { formatPriceJmd } from '@/lib/booking/format';
import { BRAND } from '@/lib/constants/brand';
import { Button } from '@/components/shared/ui/Button';
import { Card } from '@/components/shared/ui/Card';
import { LocationPrivacyCallout } from '@/components/shared/booking/LocationPrivacyCallout';

export type BookingConfirmationDetails = {
  id: string;
  status: string;
};

type BookingReviewProps = {
  service: Service;
  date: string;
  slot: SerializedBookingSlot;
  details: CustomerFormData;
  confirmation?: BookingConfirmationDetails | null;
  showWhatsAppButton?: boolean;
};

export function BookingWhatsAppButton({ className }: { className?: string }) {
  return (
    <Button
      href={BRAND.whatsappLink}
      size="lg"
      className={
        className ??
        'flex w-full items-center justify-center gap-2.5 !h-12 !rounded-full bg-rose-ink text-white hover:bg-rose-ink/90'
      }
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-[18px] w-[18px]"
        aria-hidden="true"
      >
        <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c2.2.9 2.2.6 2.6.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z" />
      </svg>
      Message on WhatsApp
    </Button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-brand-blush/20 py-3 last:border-b-0">
      <span className="text-sm text-brand-black/50">{label}</span>
      <span className="text-right text-sm font-medium text-brand-black">{value}</span>
    </div>
  );
}

export function BookingReview({
  service,
  date,
  slot,
  details,
}: BookingReviewProps) {
  return (
    <Card variant="elevated" className="p-5">
      <h2 className="font-display text-xl font-semibold text-brand-black">
        Review your booking
      </h2>
      <div className="mt-4">
        <ReviewRow label="Service" value={service.name} />
        <ReviewRow label="Price" value={formatPriceJmd(service.price_jmd)} />
        <ReviewRow label="Date" value={formatSelectedDateLabel(date)} />
        <ReviewRow label="Time" value={slot.label} />
        <ReviewRow label="Name" value={details.name.trim()} />
        <ReviewRow label="Phone" value={details.phone.trim()} />
        {details.instagram.trim() ? (
          <ReviewRow label="Instagram" value={details.instagram.trim()} />
        ) : null}
        {details.notes.trim() ? (
          <ReviewRow label="Notes" value={details.notes.trim()} />
        ) : null}
      </div>
      <LocationPrivacyCallout className="mt-4" />
    </Card>
  );
}

export function BookingSuccess({
  service,
  date,
  slot,
  details,
  confirmation,
  showWhatsAppButton = true,
}: BookingReviewProps) {
  const reference = confirmation?.id.slice(0, 8).toUpperCase();

  return (
    <div className="flex flex-col gap-7">
      <div className="rounded-[2rem] bg-gradient-to-br from-brand-pink via-brand-blush/50 to-white p-6 text-center shadow-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-soft">
          ✓
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold text-brand-black">
          Booking submitted
        </h2>
        <p className="mt-2 text-sm text-brand-black/65">
          Your appointment is pending confirmation. Shan will reach out soon.
        </p>
        {reference ? (
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-brand-black/45">
            Reference {reference}
          </p>
        ) : null}
      </div>

      <Card variant="elevated" className="p-5">
        <ReviewRow label="Service" value={service.name} />
        <ReviewRow label="Price" value={formatPriceJmd(service.price_jmd)} />
        <ReviewRow label="Date" value={formatSelectedDateLabel(date)} />
        <ReviewRow label="Time" value={slot.label} />
        <ReviewRow label="Name" value={details.name.trim()} />
        {details.notes.trim() ? (
          <ReviewRow label="Notes" value={details.notes.trim()} />
        ) : null}
      </Card>

      {showWhatsAppButton ? <BookingWhatsAppButton /> : null}
    </div>
  );
}
