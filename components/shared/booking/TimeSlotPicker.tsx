import type { SerializedBookingSlot } from '@/hooks/useCustomerBooking';
import {
  BookingEmptyState,
  BookingLoadingState,
} from '@/components/shared/booking/BookingStates';
import { cn } from '@/lib/utils/cn';

type TimeSlotPickerProps = {
  slots: SerializedBookingSlot[];
  selectedSlot: SerializedBookingSlot | null;
  onSelect: (slot: SerializedBookingSlot) => void;
  isLoading: boolean;
  variant?: 'mobile' | 'desktop';
};

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelect,
  isLoading,
  variant = 'mobile',
}: TimeSlotPickerProps) {
  if (isLoading) {
    return <BookingLoadingState message="Finding available times..." />;
  }

  if (slots.length === 0) {
    return (
      <BookingEmptyState
        title="No times available"
        description="Shan may not have lash hours on this day, or the day is fully booked. Try a Saturday, or another date with open hours."
      />
    );
  }

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2',
        variant === 'desktop' && 'gap-3',
      )}
    >
      {slots.map((slot) => {
        const isSelected = selectedSlot?.startTime === slot.startTime;

        return (
          <button
            key={slot.startTime}
            type="button"
            onClick={() => onSelect(slot)}
            className={cn(
              'rounded-full px-4 py-3 text-sm font-medium transition',
              variant === 'desktop' && 'px-5 py-3',
              isSelected
                ? 'bg-brand-black text-white shadow-soft'
                : 'bg-white text-brand-black ring-1 ring-brand-blush/40 hover:bg-brand-cream',
            )}
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
}
