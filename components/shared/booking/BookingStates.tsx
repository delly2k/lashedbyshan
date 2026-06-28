import { cn } from '@/lib/utils/cn';

type BookingAlertProps = {
  message: string;
  variant?: 'error' | 'info';
  className?: string;
};

export function BookingAlert({
  message,
  variant = 'error',
  className,
}: BookingAlertProps) {
  return (
    <div
      className={cn(
        'rounded-2xl px-4 py-3 text-sm',
        variant === 'error'
          ? 'bg-red-50 text-red-700 ring-1 ring-red-100'
          : 'bg-brand-cream text-brand-black/70 ring-1 ring-brand-blush/30',
        className,
      )}
      role="alert"
    >
      {message}
    </div>
  );
}

export function BookingLoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-blush border-t-brand-black" />
      <p className="text-sm text-brand-black/60">{message}</p>
    </div>
  );
}

export function BookingEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl bg-white/80 px-6 py-10 text-center ring-1 ring-brand-blush/30">
      <p className="font-medium text-brand-black">{title}</p>
      <p className="mt-2 text-sm text-brand-black/60">{description}</p>
    </div>
  );
}
