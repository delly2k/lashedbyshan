import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

const WIZARD_STEPS = [
  'Service',
  'Date & time',
  'Your details',
  'Review',
] as const;

type BookingWizardHeaderProps = {
  currentVisibleStep: number;
  chips: { label: string }[];
};

export function BookingWizardHeader({
  currentVisibleStep,
  chips,
}: BookingWizardHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href="/"
        className="text-sm text-brand-black/50 transition hover:text-brand-black"
      >
        ← Back to home
      </Link>

      <h1 className="mt-4 font-display text-3xl font-semibold text-rose-ink">
        Book your appointment
      </h1>

      <div className="mt-8">
        <div className="flex items-start">
          {WIZARD_STEPS.map((label, index) => {
            const isActive = index === currentVisibleStep;
            const isComplete = index < currentVisibleStep;

            return (
              <div
                key={label}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center',
                  index < WIZARD_STEPS.length - 1 && 'flex-1',
                )}
              >
                <div className="flex w-full items-center">
                  {index > 0 ? (
                    <div
                      className={cn(
                        'h-0.5 flex-1',
                        isComplete || isActive
                          ? 'bg-rose-gold/35'
                          : 'bg-rose-gold/35',
                      )}
                    />
                  ) : (
                    <div className="flex-1" />
                  )}
                  <div
                    className={cn(
                      'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition',
                      isActive && 'border-rose-ink bg-rose-ink text-white',
                      isComplete &&
                        'border-rose-gold bg-rose-gold text-white',
                      !isActive &&
                        !isComplete &&
                        'border-rose-gold/40 bg-white text-transparent',
                    )}
                  >
                    {isComplete ? (
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M3 8.5 6.5 12 13 4" />
                      </svg>
                    ) : (
                      <span
                        className={cn(
                          'h-2.5 w-2.5 rounded-full',
                          isActive ? 'bg-white' : 'bg-rose-gold/40',
                        )}
                      />
                    )}
                  </div>
                  {index < WIZARD_STEPS.length - 1 ? (
                    <div className="h-0.5 flex-1 bg-rose-gold/35" />
                  ) : (
                    <div className="flex-1" />
                  )}
                </div>
                <p
                  className={cn(
                    'mt-2 hidden text-center text-xs font-medium sm:block',
                    isActive ? 'text-rose-ink' : 'text-brand-black/45',
                    isComplete && 'text-rose-gold',
                  )}
                >
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {chips.length > 0 ? (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="rounded-full border border-rose-gold/35 bg-white px-3.5 py-1.5 text-sm text-rose-ink"
            >
              {chip.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
