'use client';

import { useMemo, useState } from 'react';
import {
  getDayOfWeekForDate,
  getTodayJamaicaDateString,
  jamaicaLocalToUtc,
} from '@/lib/utils/datetime';
import { cn } from '@/lib/utils/cn';

type BookingCalendarProps = {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  variant?: 'mobile' | 'desktop';
};

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const startOffset = firstDay.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells: Array<{ date: string | null; day: number | null }> = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push({ date: null, day: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ date, day });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, day: null });
  }

  return cells;
}

function formatMonthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat('en-JM', {
    timeZone: 'America/Jamaica',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month, 15, 12)));
}

export function BookingCalendar({
  selectedDate,
  onSelectDate,
  variant = 'mobile',
}: BookingCalendarProps) {
  const today = getTodayJamaicaDateString();
  const [year, month] = useMemo(() => {
    const base = selectedDate ?? today;
    const [y, m] = base.split('-').map(Number);
    return [y, m - 1] as const;
  }, [selectedDate, today]);

  const [visibleYear, setVisibleYear] = useState(year);
  const [visibleMonth, setVisibleMonth] = useState(month);

  const cells = useMemo(
    () => getMonthMatrix(visibleYear, visibleMonth),
    [visibleMonth, visibleYear],
  );

  function shiftMonth(delta: number) {
    const next = new Date(Date.UTC(visibleYear, visibleMonth + delta, 1));
    setVisibleYear(next.getUTCFullYear());
    setVisibleMonth(next.getUTCMonth());
  }

  function isDisabled(date: string) {
    return date < today;
  }

  return (
    <div
      className={cn(
        'rounded-3xl bg-white/90 p-4 ring-1 ring-brand-blush/30',
        variant === 'desktop' && 'p-6',
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cream text-brand-black transition hover:bg-brand-blush/30"
          aria-label="Previous month"
        >
          ‹
        </button>
        <h3 className="font-display text-lg font-semibold text-brand-black">
          {formatMonthLabel(visibleYear, visibleMonth)}
        </h3>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cream text-brand-black transition hover:bg-brand-blush/30"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-brand-black/45">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-2">
            {label}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          if (!cell.date || cell.day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const disabled = isDisabled(cell.date);
          const isSelected = selectedDate === cell.date;
          const isToday = cell.date === today;
          const dayOfWeek = getDayOfWeekForDate(cell.date);
          const isSunday = dayOfWeek === 0;

          return (
            <button
              key={cell.date}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(cell.date!)}
              className={cn(
                'aspect-square rounded-2xl text-sm font-medium transition',
                disabled && 'cursor-not-allowed text-brand-black/20',
                !disabled && !isSelected && 'text-brand-black hover:bg-brand-cream',
                isSelected && 'bg-brand-black text-white shadow-soft',
                isToday && !isSelected && 'ring-1 ring-brand-blush',
                isSunday && !isSelected && !disabled && 'text-brand-black/70',
              )}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function formatSelectedDateLabel(date: string): string {
  return new Intl.DateTimeFormat('en-JM', {
    timeZone: 'America/Jamaica',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(jamaicaLocalToUtc(date, '12:00:00'));
}
