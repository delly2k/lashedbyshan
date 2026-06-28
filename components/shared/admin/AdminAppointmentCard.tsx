'use client';

import { useState } from 'react';
import type { AdminAppointment } from '@/lib/admin/types';
import {
  formatAdminAppointmentDate,
  formatAdminAppointmentTime,
} from '@/lib/admin/format';
import { AppointmentStatusBadge } from '@/components/shared/admin/AppointmentStatusBadge';
import { BookingCalendar } from '@/components/shared/booking/BookingCalendar';
import { BookingAlert } from '@/components/shared/booking/BookingStates';
import { TimeSlotPicker } from '@/components/shared/booking/TimeSlotPicker';
import { Button } from '@/components/shared/ui/Button';
import { Card } from '@/components/shared/ui/Card';
import { formatPriceJmd } from '@/lib/booking/format';
import type { AppointmentStatus } from '@/lib/booking/types';
import { toJamaicaDateString, fromTimestamptz } from '@/lib/utils/datetime';

type AdminAppointmentCardProps = {
  appointment: AdminAppointment;
  isUpdating?: boolean;
  onUpdateStatus: (status: AppointmentStatus) => Promise<void>;
  onReschedule: (startTime: string, date: string) => Promise<void>;
  onLoadRescheduleSlots: (
    date: string,
  ) => Promise<Array<{ startTime: string; label: string }>>;
  compact?: boolean;
};

export function AdminAppointmentCard({
  appointment,
  isUpdating = false,
  onUpdateStatus,
  onReschedule,
  onLoadRescheduleSlots,
  compact = false,
}: AdminAppointmentCardProps) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(
    toJamaicaDateString(fromTimestamptz(appointment.start_time)),
  );
  const [rescheduleSlots, setRescheduleSlots] = useState<
    Array<{ startTime: string; label: string }>
  >([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState<
    string | null
  >(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function openReschedule() {
    setShowReschedule(true);
    setLocalError(null);
    setIsLoadingSlots(true);

    try {
      const slots = await onLoadRescheduleSlots(rescheduleDate);
      setRescheduleSlots(slots);
      setSelectedRescheduleSlot(null);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : 'Unable to load times.',
      );
    } finally {
      setIsLoadingSlots(false);
    }
  }

  async function handleDateChange(date: string) {
    setRescheduleDate(date);
    setIsLoadingSlots(true);
    setLocalError(null);

    try {
      const slots = await onLoadRescheduleSlots(date);
      setRescheduleSlots(slots);
      setSelectedRescheduleSlot(null);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : 'Unable to load times.',
      );
    } finally {
      setIsLoadingSlots(false);
    }
  }

  async function submitReschedule() {
    if (!selectedRescheduleSlot) {
      return;
    }

    try {
      await onReschedule(selectedRescheduleSlot, rescheduleDate);
      setShowReschedule(false);
    } catch {
      // Error handled by parent hook
    }
  }

  const canConfirm = appointment.status === 'pending';
  const canCancel = ['pending', 'confirmed'].includes(appointment.status);
  const canComplete = appointment.status === 'confirmed';
  const canNoShow = appointment.status === 'confirmed';
  const canReschedule = ['pending', 'confirmed'].includes(appointment.status);

  return (
    <Card variant="elevated" className={compact ? 'p-4' : 'p-5'}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-brand-black">
              {appointment.customer_name}
            </h3>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <p className="mt-2 text-sm text-brand-black/60">
            {appointment.service.name} · {formatPriceJmd(appointment.service.price_jmd)}
          </p>
          <p className="mt-1 text-sm text-brand-black/60">
            {formatAdminAppointmentDate(appointment.start_time)} ·{' '}
            {formatAdminAppointmentTime(appointment.start_time)}
          </p>
        </div>
      </div>

      {!compact ? (
        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-brand-black/50">Phone</dt>
            <dd className="font-medium">{appointment.customer_phone}</dd>
          </div>
          {appointment.customer_instagram ? (
            <div className="flex justify-between gap-4">
              <dt className="text-brand-black/50">Instagram</dt>
              <dd className="font-medium">{appointment.customer_instagram}</dd>
            </div>
          ) : null}
          {appointment.notes ? (
            <div>
              <dt className="text-brand-black/50">Notes</dt>
              <dd className="mt-1 rounded-2xl bg-brand-cream px-3 py-2">
                {appointment.notes}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {localError ? (
        <div className="mt-4">
          <BookingAlert message={localError} />
        </div>
      ) : null}

      {showReschedule ? (
        <div className="mt-4 space-y-4 border-t border-brand-blush/20 pt-4">
          <BookingCalendar
            selectedDate={rescheduleDate}
            onSelectDate={handleDateChange}
            variant={compact ? 'mobile' : 'desktop'}
          />
          <TimeSlotPicker
            slots={rescheduleSlots.map((slot) => ({
              ...slot,
              endTime: slot.startTime,
              serviceEndTime: slot.startTime,
              date: rescheduleDate,
            }))}
            selectedSlot={
              selectedRescheduleSlot
                ? {
                    startTime: selectedRescheduleSlot,
                    endTime: selectedRescheduleSlot,
                    serviceEndTime: selectedRescheduleSlot,
                    date: rescheduleDate,
                    label:
                      rescheduleSlots.find(
                        (slot) => slot.startTime === selectedRescheduleSlot,
                      )?.label ?? '',
                  }
                : null
            }
            onSelect={(slot) => setSelectedRescheduleSlot(slot.startTime)}
            isLoading={isLoadingSlots}
            variant={compact ? 'mobile' : 'desktop'}
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowReschedule(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedRescheduleSlot || isUpdating}
              onClick={() => void submitReschedule()}
            >
              Save new time
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {canConfirm ? (
            <Button
              size="sm"
              disabled={isUpdating}
              onClick={() => void onUpdateStatus('confirmed')}
            >
              Confirm
            </Button>
          ) : null}
          {canComplete ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={isUpdating}
              onClick={() => void onUpdateStatus('completed')}
            >
              Completed
            </Button>
          ) : null}
          {canNoShow ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={isUpdating}
              onClick={() => void onUpdateStatus('no_show')}
            >
              No-show
            </Button>
          ) : null}
          {canReschedule ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={isUpdating}
              onClick={() => void openReschedule()}
            >
              Reschedule
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={isUpdating}
              onClick={() => void onUpdateStatus('cancelled')}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      )}
    </Card>
  );
}
