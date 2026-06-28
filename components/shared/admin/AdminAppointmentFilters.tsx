'use client';

import { Input } from '@/components/shared/ui/Input';
import { cn } from '@/lib/utils/cn';

export type AdminAppointmentView =
  | 'today'
  | 'upcoming'
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'date';

export const ADMIN_APPOINTMENT_FILTERS: Array<{
  label: string;
  value: AdminAppointmentView;
}> = [
  { label: 'Today', value: 'today' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'By date', value: 'date' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Completed', value: 'completed' },
  { label: 'No-show', value: 'no_show' },
];

type AdminAppointmentFiltersProps = {
  activeView: AdminAppointmentView;
  search: string;
  onViewChange: (view: AdminAppointmentView) => void;
  onSearchChange: (value: string) => void;
  compact?: boolean;
};

export function AdminAppointmentFilters({
  activeView,
  search,
  onViewChange,
  onSearchChange,
  compact,
}: AdminAppointmentFiltersProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Search"
        type="search"
        value={search}
        placeholder="Name, phone, or Instagram"
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <div
        className={cn(
          'flex gap-2 pb-1',
          compact ? 'overflow-x-auto' : 'flex-wrap',
        )}
      >
        {ADMIN_APPOINTMENT_FILTERS.map((filter) => {
          const isActive = filter.value === activeView;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onViewChange(filter.value)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 font-medium transition',
                compact ? 'text-xs' : 'text-sm',
                isActive
                  ? 'bg-brand-black text-white'
                  : compact
                    ? 'bg-white text-brand-black/60 shadow-soft'
                    : 'bg-brand-cream text-brand-black/70',
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
