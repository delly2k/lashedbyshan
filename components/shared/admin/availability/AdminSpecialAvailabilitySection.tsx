'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/ui/Button';
import { Card } from '@/components/shared/ui/Card';
import { Input } from '@/components/shared/ui/Input';
import { Textarea } from '@/components/shared/ui/Textarea';
import {
  formatAvailabilityOverrideLabel,
  toApiTime,
} from '@/lib/admin/availabilityFormat';
import type { AvailabilityOverride } from '@/lib/supabase/database.types';
import { getTodayJamaicaDateString } from '@/lib/utils/datetime';
import { cn } from '@/lib/utils/cn';

type AdminSpecialAvailabilitySectionProps = {
  overrides: AvailabilityOverride[];
  isSaving: boolean;
  onSave: (
    input: {
      date: string;
      startTime: string;
      endTime: string;
      type: AvailabilityOverride['type'];
      note?: string | null;
    },
    id?: string,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  compact?: boolean;
};

const emptyForm = {
  date: getTodayJamaicaDateString(),
  startTime: '14:00',
  endTime: '19:00',
  type: 'available' as AvailabilityOverride['type'],
  fullDay: false,
  note: '',
};

export function AdminSpecialAvailabilitySection({
  overrides,
  isSaving,
  onSave,
  onDelete,
  compact,
}: AdminSpecialAvailabilitySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const specialOverrides = overrides.filter(
    (override) => override.type === 'available',
  );

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setIsEditing(true);
  }

  function openEdit(override: AvailabilityOverride) {
    setEditingId(override.id);
    setForm({
      date: override.date,
      startTime: override.start_time.slice(0, 5),
      endTime: override.end_time.slice(0, 5),
      type: override.type,
      fullDay:
        override.start_time.startsWith('00:00') &&
        override.end_time.startsWith('23:59'),
      note: override.note ?? '',
    });
    setIsEditing(true);
  }

  function closeForm() {
    setIsEditing(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const startTime = form.fullDay ? '00:00:00' : toApiTime(form.startTime);
    const endTime = form.fullDay ? '23:59:59' : toApiTime(form.endTime);

    await onSave(
      {
        date: form.date,
        startTime,
        endTime,
        type: form.type,
        note: form.note.trim() || null,
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
            Special availability
          </h2>
          <p className="mt-1 text-sm text-brand-black/60">
            Add extra booking windows outside your regular weekly hours.
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
            label="Note (optional)"
            value={form.note}
            disabled={isSaving}
            placeholder="Holiday hours, special event..."
            onChange={(event) =>
              setForm((current) => ({ ...current, note: event.target.value }))
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
        {specialOverrides.length === 0 ? (
          <p className="text-sm text-brand-black/50">
            No special availability windows yet.
          </p>
        ) : (
          specialOverrides.map((override) => (
            <button
              key={override.id}
              type="button"
              onClick={() => openEdit(override)}
              className="flex w-full items-start justify-between gap-3 rounded-2xl border border-brand-blush/30 bg-white px-4 py-3 text-left transition hover:bg-brand-cream/40"
            >
              <div>
                <p className="font-medium text-brand-black">
                  {formatAvailabilityOverrideLabel(override)}
                </p>
                {override.note ? (
                  <p className="mt-1 text-sm text-brand-black/50">{override.note}</p>
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
