import type { CustomerBookingStep } from '@/hooks/useCustomerBooking';
import { cn } from '@/lib/utils/cn';

const STEPS: { id: CustomerBookingStep; label: string }[] = [
  { id: 'service', label: 'Service' },
  { id: 'date', label: 'Date' },
  { id: 'time', label: 'Time' },
  { id: 'details', label: 'Details' },
  { id: 'confirm', label: 'Confirm' },
];

type BookingStepIndicatorProps = {
  currentStep: CustomerBookingStep;
  variant?: 'mobile' | 'desktop';
};

export function BookingStepIndicator({
  currentStep,
  variant = 'mobile',
}: BookingStepIndicatorProps) {
  const currentIndex = STEPS.findIndex((step) => step.id === currentStep);

  if (currentStep === 'success') {
    return null;
  }

  if (variant === 'desktop') {
    return (
      <div className="flex flex-wrap gap-3">
        {STEPS.map((step, index) => {
          const isActive = index === currentIndex;
          const isComplete = index < currentIndex;

          return (
            <div
              key={step.id}
              className={cn(
                'rounded-2xl px-4 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-brand-black text-white'
                  : isComplete
                    ? 'bg-brand-blush/30 text-brand-black'
                    : 'bg-white text-brand-black/45 shadow-soft',
              )}
            >
              {index + 1}. {step.label}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {STEPS.map((step, index) => {
        const isActive = index === currentIndex;
        const isComplete = index < currentIndex;

        return (
          <span
            key={step.id}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition',
              isActive
                ? 'bg-brand-black text-white'
                : isComplete
                  ? 'bg-brand-blush/40 text-brand-black'
                  : 'bg-white text-brand-black/45 shadow-soft',
            )}
          >
            {step.label}
          </span>
        );
      })}
    </div>
  );
}
