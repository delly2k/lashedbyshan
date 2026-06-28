import type { AppointmentStatus } from '@/lib/booking/types';
import { cn } from '@/lib/utils/cn';

const STATUS_STYLES: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-stone-100 text-stone-600 ring-stone-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-brand-cream text-brand-black ring-brand-blush/40',
  },
  no_show: {
    label: 'No-show',
    className: 'bg-red-50 text-red-700 ring-red-200',
  },
};

export function AppointmentStatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const config = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
