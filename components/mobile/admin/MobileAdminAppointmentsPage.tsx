'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MobileAdminShell } from '@/components/mobile/shared/MobileAdminShell';
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

function MobileAdminAppointmentsContent() {
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
    <MobileAdminShell
      title="Appointments"
      subtitle="View and manage customer bookings"
    >
      <AdminAppointmentFilters
        compact
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

      {activeView === 'date' ? (
        <div className="mt-4">
          <BookingCalendar
            selectedDate={selectedDate}
            onSelectDate={(date) => updateQuery({ view: 'date', date })}
          />
        </div>
      ) : null}

      {error ? (
        <div className="mt-4">
          <BookingAlert message={error} />
        </div>
      ) : null}

      {isLoading ? (
        <BookingLoadingState message="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <div className="mt-4">
          <BookingEmptyState
            title="No appointments found"
            description="Try another filter or search term."
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {appointments.map((appointment) => (
            <AdminAppointmentCard
              key={appointment.id}
              appointment={appointment}
              compact
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
    </MobileAdminShell>
  );
}

export function MobileAdminAppointmentsPage() {
  return (
    <Suspense
      fallback={
        <MobileAdminShell title="Appointments" subtitle="Loading...">
          <BookingLoadingState message="Loading appointments..." />
        </MobileAdminShell>
      }
    >
      <MobileAdminAppointmentsContent />
    </Suspense>
  );
}
