'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DesktopAdminShell } from '@/components/desktop/shared/DesktopAdminShell';
import {
  AdminAppointmentFilters,
  type AdminAppointmentView,
} from '@/components/shared/admin/AdminAppointmentFilters';
import { AdminAppointmentCard } from '@/components/shared/admin/AdminAppointmentCard';
import { BookingCalendar } from '@/components/shared/booking/BookingCalendar';
import {
  BookingAlert,
  BookingEmptyState,
  BookingLoadingState,
} from '@/components/shared/booking/BookingStates';
import { Card } from '@/components/shared/ui/Card';
import { useAdminAppointments } from '@/hooks/useAdminAppointments';
import { getTodayJamaicaDateString } from '@/lib/utils/datetime';
import type { AppointmentStatus } from '@/lib/booking/types';

function parseView(value: string | null): AdminAppointmentView {
  const valid: AdminAppointmentView[] = [
    'today',
    'upcoming',
    'pending',
    'confirmed',
    'cancelled',
    'completed',
    'no_show',
    'date',
  ];

  if (value && valid.includes(value as AdminAppointmentView)) {
    return value as AdminAppointmentView;
  }

  return 'today';
}

function DesktopAdminAppointmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView = parseView(searchParams.get('view'));
  const selectedDate = searchParams.get('date') ?? getTodayJamaicaDateString();
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get('q') ?? '',
  );
  const searchQuery = searchParams.get('q') ?? '';

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = searchInput.trim();

      if (trimmed) {
        params.set('q', trimmed);
      } else {
        params.delete('q');
      }

      if (trimmed !== searchQuery) {
        router.replace(`/admin/appointments?${params.toString()}`);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput, searchQuery, router, searchParams]);

  const {
    appointments,
    isLoading,
    isUpdating,
    error,
    updateStatus,
    reschedule,
    loadRescheduleSlots,
  } = useAdminAppointments({
    view: activeView,
    date: activeView === 'date' ? selectedDate : null,
    search: searchQuery,
  });

  function updateQuery(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.replace(`/admin/appointments?${params.toString()}`);
  }

  return (
    <DesktopAdminShell
      title="Appointments"
      subtitle="View bookings, update status, and reschedule"
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card variant="elevated" className="h-fit p-6">
          <h2 className="font-display text-xl font-semibold">Find appointments</h2>
          <div className="mt-4">
            <AdminAppointmentFilters
              activeView={activeView}
              search={searchInput}
              onSearchChange={setSearchInput}
              onViewChange={(view) => {
                if (view === 'date') {
                  updateQuery({ view: 'date', date: selectedDate });
                  return;
                }

                updateQuery({ view, date: null });
              }}
            />
          </div>
          {activeView === 'date' ? (
            <div className="mt-4">
              <BookingCalendar
                selectedDate={selectedDate}
                onSelectDate={(date) => updateQuery({ view: 'date', date })}
                variant="desktop"
              />
            </div>
          ) : null}
        </Card>

        <div>
          {error ? (
            <div className="mb-4">
              <BookingAlert message={error} />
            </div>
          ) : null}

          {isLoading ? (
            <BookingLoadingState message="Loading appointments..." />
          ) : appointments.length === 0 ? (
            <BookingEmptyState
              title="No appointments found"
              description="Try another filter or search term."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {appointments.map((appointment) => (
                <AdminAppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  isUpdating={isUpdating}
                  onUpdateStatus={async (status: AppointmentStatus) => {
                    await updateStatus(appointment.id, status);
                  }}
                  onReschedule={async (startTime, date) => {
                    await reschedule(appointment.id, startTime, date);
                  }}
                  onLoadRescheduleSlots={(date) =>
                    loadRescheduleSlots(appointment.id, date)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DesktopAdminShell>
  );
}

export function DesktopAdminAppointmentsPage() {
  return (
    <Suspense
      fallback={
        <DesktopAdminShell title="Appointments" subtitle="Loading...">
          <BookingLoadingState message="Loading appointments..." />
        </DesktopAdminShell>
      }
    >
      <DesktopAdminAppointmentsContent />
    </Suspense>
  );
}
