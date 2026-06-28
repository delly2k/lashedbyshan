'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/ui/Button';
import { Card } from '@/components/shared/ui/Card';
import { Input } from '@/components/shared/ui/Input';
import { Textarea } from '@/components/shared/ui/Textarea';
import { formatPriceJmd } from '@/lib/booking/format';
import { formatDuration } from '@/lib/utils/datetime';
import type { Service } from '@/lib/supabase/database.types';
import { cn } from '@/lib/utils/cn';

type AdminServicesSectionProps = {
  services: Service[];
  isSaving: boolean;
  onSave: (
    input: {
      name: string;
      description?: string;
      priceJmd: number;
      durationMinutes: number;
      bufferMinutes?: number;
      active?: boolean;
    },
    id?: string,
  ) => Promise<void>;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
  compact?: boolean;
};

const emptyForm = {
  name: '',
  description: '',
  priceJmd: '5000',
  durationMinutes: '90',
  bufferMinutes: '15',
  active: true,
};

function formatServiceLabel(service: Service): string {
  return `${service.name} · ${formatPriceJmd(service.price_jmd)} · ${formatDuration(service.duration_minutes)}`;
}

export function AdminServicesSection({
  services,
  isSaving,
  onSave,
  onToggleActive,
  compact,
}: AdminServicesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setIsEditing(true);
  }

  function openEdit(service: Service) {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description,
      priceJmd: String(service.price_jmd),
      durationMinutes: String(service.duration_minutes),
      bufferMinutes: String(service.buffer_minutes),
      active: service.active,
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
        name: form.name,
        description: form.description,
        priceJmd: Number(form.priceJmd),
        durationMinutes: Number(form.durationMinutes),
        bufferMinutes: Number(form.bufferMinutes),
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
            Lash services
          </h2>
          <p className="mt-1 text-sm text-brand-black/60">
            Inactive services are hidden from customers.
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
            label="Service name"
            value={form.name}
            disabled={isSaving}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            disabled={isSaving}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Price (JMD)"
              type="number"
              min={1}
              step={100}
              value={form.priceJmd}
              disabled={isSaving}
              onChange={(event) =>
                setForm((current) => ({ ...current, priceJmd: event.target.value }))
              }
              required
            />
            <Input
              label="Duration (minutes)"
              type="number"
              min={1}
              step={15}
              value={form.durationMinutes}
              disabled={isSaving}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  durationMinutes: event.target.value,
                }))
              }
              required
            />
            <Input
              label="Buffer (minutes)"
              type="number"
              min={0}
              step={5}
              value={form.bufferMinutes}
              disabled={isSaving}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  bufferMinutes: event.target.value,
                }))
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
            Active for customer booking
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
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
        {services.length === 0 ? (
          <p className="text-sm text-brand-black/50">No services configured yet.</p>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border border-brand-blush/30 bg-white px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(service)}
                  className="flex-1 text-left"
                >
                  <p className="font-medium text-brand-black">
                    {formatServiceLabel(service)}
                  </p>
                  {service.description ? (
                    <p className="mt-1 text-sm text-brand-black/50">
                      {service.description}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-brand-black/40">
                    Buffer: {formatDuration(service.buffer_minutes)}
                    {!service.active ? ' · Inactive' : ''}
                  </p>
                </button>
                <Button
                  type="button"
                  size="sm"
                  variant={service.active ? 'ghost' : 'secondary'}
                  disabled={isSaving}
                  onClick={() => void onToggleActive(service.id, !service.active)}
                >
                  {service.active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
