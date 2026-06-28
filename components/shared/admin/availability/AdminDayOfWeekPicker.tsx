'use client';

import { DAY_OF_WEEK_LABELS } from '@/lib/booking/constants';
import { cn } from '@/lib/utils/cn';

type AdminDayOfWeekPickerProps = {
  value: number[];
  onChange: (days: number[]) => void;
  disabled?: boolean;
};

export function AdminDayOfWeekPicker({
  value,
  onChange,
  disabled,
}: AdminDayOfWeekPickerProps) {
  function toggleDay(day: number) {
    if (disabled) {
      return;
    }

    if (value.includes(day)) {
      onChange(value.filter((current) => current !== day));
      return;
    }

    onChange([...value, day].sort((a, b) => a - b));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DAY_OF_WEEK_LABELS.map((label, day) => {
        const isSelected = value.includes(day);

        return (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => toggleDay(day)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition',
              isSelected
                ? 'bg-brand-black text-white'
                : 'bg-white text-brand-black/60 shadow-soft',
              disabled && 'opacity-50',
            )}
          >
            {label.slice(0, 3)}
          </button>
        );
      })}
    </div>
  );
}

type AdminDaySelectProps = {
  value: number;
  onChange: (day: number) => void;
  disabled?: boolean;
};

export function AdminDaySelect({ value, onChange, disabled }: AdminDaySelectProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-brand-black/70">Day of week</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-12 rounded-2xl border border-brand-blush/40 bg-white px-4 text-brand-black outline-none transition focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 disabled:opacity-50"
      >
        {DAY_OF_WEEK_LABELS.map((label, day) => (
          <option key={label} value={day}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
