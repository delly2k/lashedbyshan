'use client';

import { useState } from 'react';
import { AdminDayOfWeekPicker } from '@/components/shared/admin/availability/AdminDayOfWeekPicker';
import { Button } from '@/components/shared/ui/Button';
import { Card } from '@/components/shared/ui/Card';
import { Input } from '@/components/shared/ui/Input';
import { Textarea } from '@/components/shared/ui/Textarea';
import {
  blockToFormValues,
  formatUnavailableBlockLabel,
  isUpcomingUnavailableBlock,
  toApiTime,
} from '@/lib/admin/availabilityFormat';
import type { UnavailableBlock } from '@/lib/supabase/database.types';
import { getTodayJamaicaDateString } from '@/lib/utils/datetime';
import { cn } from '@/lib/utils/cn';

type AdminUnavailableBlocksSectionProps = {
  blocks: UnavailableBlock[];
  isSaving: boolean;
  startOpen?: boolean;
  onSave: (
    input: {
      date?: string;
      startTime: string;
      endTime: string;
      reason?: string | null;
      isRecurring: boolean;
      fullDay: boolean;
      daysOfWeek?: number[];
    },
    id?: string,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  compact?: boolean;
};

const emptyForm = {
  isRecurring: false,
  fullDay: false,
  date: getTodayJamaicaDateString(),
  daysOfWeek: [1, 2, 3, 4, 5] as number[],
  startTime: '09:00',
  endTime: '17:00',
  reason: '',
};

export function AdminUnavailableBlocksSection({
  blocks,
  isSaving,
  startOpen,
  onSave,
  onDelete,
  compact,
}: AdminUnavailableBlocksSectionProps) {
  const [isEditing, setIsEditing] = useState(Boolean(startOpen));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const upcomingBlocks = blocks.filter((block) =>
    isUpcomingUnavailableBlock(block),
  );

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setIsEditing(true);
  }

  function openEdit(block: UnavailableBlock) {
    setEditingId(block.id);
    setForm(blockToFormValues(block));
    setIsEditing(true);
  }

  function closeForm() {
    setIsEditing(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    await onSave(
      {
        date: form.isRecurring ? undefined : form.date,
        startTime: toApiTime(form.startTime),
        endTime: toApiTime(form.endTime),
        reason: form.reason.trim() || null,
        isRecurring: form.isRecurring,
        fullDay: form.fullDay,
        daysOfWeek: form.isRecurring ? form.daysOfWeek : undefined,
      },
      editingId ?? undefined,
    );
    closeForm();
  }

  return (
    <Card variant="elevated" className={cn('p-4', !compact && 'p-6')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-brand-black">
            Unavailable blocks
          </h2>
          <p className="mt-1 text-sm text-brand-black/60">
            Block time for your other job. Customers won&apos;t see the reason.
          </p>
        </div>
        {!isEditing ? (
          <Button type="button" size="sm" variant="secondary" onClick={openCreate}>
            Add
          </Button>
        ) : null}
      </div>

      {isEditing ? (
        <form onSubmit={(event) => void handleSubmit(event)} className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() =>
                setForm((current) => ({ ...current, isRecurring: false }))
              }
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium',
                !form.isRecurring
                  ? 'bg-brand-black text-white'
                  : 'bg-white text-brand-black/60 shadow-soft',
              )}
            >
              One-time
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() =>
                setForm((current) => ({ ...current, isRecurring: true }))
              }
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium',
                form.isRecurring
                  ? 'bg-brand-black text-white'
                  : 'bg-white text-brand-black/60 shadow-soft',
              )}
            >
              Recurring weekly
            </button>
          </div>

          {!form.isRecurring ? (
            <Input
              label="Date"
              type="date"
              value={form.date}
              disabled={isSaving}
              onChange={(event) =>
                setForm((current) => ({ ...current, date: event.target.value }))
              }
              required
            />
          ) : (
            <div className="space-y-2">
              <span className="text-sm font-medium text-brand-black/70">
                Repeat on
              </span>
              <AdminDayOfWeekPicker
                value={form.daysOfWeek}
                disabled={isSaving}
                onChange={(daysOfWeek) =>
                  setForm((current) => ({ ...current, daysOfWeek }))
                }
              />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-brand-black/70">
            <input
              type="checkbox"
              checked={form.fullDay}
              disabled={isSaving}
              onChange={(event) =>
                setForm((current) => ({ ...current, fullDay: event.target.checked }))
              }
            />
            Full day
          </label>

          {!form.fullDay ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Start time"
                type="time"
                value={form.startTime}
                disabled={isSaving}
                onChange={(event) =>
                  setForm((current) => ({ ...current, startTime: event.target.value }))
                }
                required
              />
              <Input
                label="End time"
                type="time"
                value={form.endTime}
                disabled={isSaving}
                onChange={(event) =>
                  setForm((current) => ({ ...current, endTime: event.target.value }))
                }
                required
              />
            </div>
          ) : null}

          <Textarea
            label="Reason (admin only)"
            value={form.reason}
            disabled={isSaving}
            placeholder="Other work, appointment, travel..."
            onChange={(event) =>
              setForm((current) => ({ ...current, reason: event.target.value }))
            }
          />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            {editingId ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isSaving}
                onClick={() => void onDelete(editingId).then(closeForm)}
              >
                Delete
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isSaving}
              onClick={closeForm}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      <div className="mt-4 space-y-3">
        {upcomingBlocks.length === 0 ? (
          <p className="text-sm text-brand-black/50">No blocked time scheduled.</p>
        ) : (
          upcomingBlocks.map((block) => (
            <button
              key={block.id}
              type="button"
              onClick={() => openEdit(block)}
              className="flex w-full items-start justify-between gap-3 rounded-2xl border border-brand-blush/30 bg-white px-4 py-3 text-left transition hover:bg-brand-cream/40"
            >
              <div>
                <p className="font-medium text-brand-black">
                  {formatUnavailableBlockLabel(block)}
                </p>
                {block.reason ? (
                  <p className="mt-1 text-sm text-brand-black/50">{block.reason}</p>
                ) : null}
              </div>
              <span className="text-sm text-brand-black/40">Edit</span>
            </button>
          ))
        )}
      </div>
    </Card>
  );
}
