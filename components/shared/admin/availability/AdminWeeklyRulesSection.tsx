'use client';

import { useState } from 'react';
import { AdminDaySelect } from '@/components/shared/admin/availability/AdminDayOfWeekPicker';
import { Button } from '@/components/shared/ui/Button';
import { Input } from '@/components/shared/ui/Input';
import { Card } from '@/components/shared/ui/Card';
import {
  formatWeeklyRuleLabel,
  toApiTime,
} from '@/lib/admin/availabilityFormat';
import type { AvailabilityRule } from '@/lib/supabase/database.types';
import { cn } from '@/lib/utils/cn';

type AdminWeeklyRulesSectionProps = {
  rules: AvailabilityRule[];
  isSaving: boolean;
  onSave: (
    input: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      active?: boolean;
    },
    id?: string,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  compact?: boolean;
};

const emptyForm = {
  dayOfWeek: 6,
  startTime: '10:00',
  endTime: '18:00',
  active: true,
};

export function AdminWeeklyRulesSection({
  rules,
  isSaving,
  onSave,
  onDelete,
  compact,
}: AdminWeeklyRulesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setIsEditing(true);
  }

  function openEdit(rule: AvailabilityRule) {
    setEditingId(rule.id);
    setForm({
      dayOfWeek: rule.day_of_week,
      startTime: rule.start_time.slice(0, 5),
      endTime: rule.end_time.slice(0, 5),
      active: rule.active,
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
    await onSave(
      {
        dayOfWeek: form.dayOfWeek,
        startTime: toApiTime(form.startTime),
        endTime: toApiTime(form.endTime),
        active: form.active,
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
            Weekly lash hours
          </h2>
          <p className="mt-1 text-sm text-brand-black/60">
            Regular days and times when customers can book.
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
          <AdminDaySelect
            value={form.dayOfWeek}
            onChange={(dayOfWeek) => setForm((current) => ({ ...current, dayOfWeek }))}
            disabled={isSaving}
          />
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
          <label className="flex items-center gap-2 text-sm text-brand-black/70">
            <input
              type="checkbox"
              checked={form.active}
              disabled={isSaving}
              onChange={(event) =>
                setForm((current) => ({ ...current, active: event.target.checked }))
              }
            />
            Active for booking
          </label>
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
        {rules.length === 0 ? (
          <p className="text-sm text-brand-black/50">No weekly hours set yet.</p>
        ) : (
          rules.map((rule) => (
            <button
              key={rule.id}
              type="button"
              onClick={() => openEdit(rule)}
              className="flex w-full items-start justify-between gap-3 rounded-2xl border border-brand-blush/30 bg-white px-4 py-3 text-left transition hover:bg-brand-cream/40"
            >
              <div>
                <p className="font-medium text-brand-black">
                  {formatWeeklyRuleLabel(rule)}
                </p>
                {!rule.active ? (
                  <p className="mt-1 text-xs text-brand-black/50">Inactive</p>
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
