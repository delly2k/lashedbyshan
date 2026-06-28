'use client';

import Link from 'next/link';
import { MobileAdminShell } from '@/components/mobile/shared/MobileAdminShell';
import { AdminAppointmentCard } from '@/components/shared/admin/AdminAppointmentCard';
import { AdminQuickActions } from '@/components/shared/admin/AdminQuickActions';
import {
  BookingAlert,
  BookingEmptyState,
  BookingLoadingState,
} from '@/components/shared/booking/BookingStates';
import { Card } from '@/components/shared/ui/Card';
import { useAdminDashboard, useAdminAppointments } from '@/hooks/useAdminAppointments';

export function MobileAdminDashboardPage() {
  const { data, isLoading, error, reload } = useAdminDashboard();
  const appointmentActions = useAdminAppointments({ view: 'today' });

  if (isLoading) {
    return (
      <MobileAdminShell title="Dashboard" subtitle="Your lash business at a glance">
        <BookingLoadingState message="Loading dashboard..." />
      </MobileAdminShell>
    );
  }

  return (
    <MobileAdminShell title="Dashboard" subtitle="Your lash business at a glance">
      {error ? (
        <div className="mb-4">
          <BookingAlert message={error} />
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Today', value: data.stats.todayCount },
              { label: 'Pending', value: data.stats.pendingCount },
              { label: 'Confirmed', value: data.stats.confirmedCount },
              { label: 'Upcoming', value: data.stats.upcomingCount },
            ].map((stat) => (
              <Card key={stat.label} variant="elevated">
                <p className="text-xs text-brand-black/50">{stat.label}</p>
                <p className="mt-1 font-display text-3xl font-semibold">
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium text-brand-black">Today&apos;s appointments</h2>
              <Link href="/admin/appointments" className="text-sm text-brand-black/50">
                View all
              </Link>
            </div>
            {data.todayAppointments.length === 0 ? (
              <BookingEmptyState
                title="No appointments today"
                description="Enjoy the calm — or share your booking link to fill the day."
              />
            ) : (
              <div className="flex flex-col gap-3">
                {data.todayAppointments.map((appointment) => (
                  <AdminAppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    compact
                    isUpdating={appointmentActions.isUpdating}
                    onUpdateStatus={async (status) => {
                      await appointmentActions.updateStatus(appointment.id, status);
                    }}
                    onReschedule={async (startTime, date) => {
                      await appointmentActions.reschedule(appointment.id, startTime, date);
                    }}
                    onLoadRescheduleSlots={(date) =>
                      appointmentActions.loadRescheduleSlots(appointment.id, date)
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium text-brand-black">Pending bookings</h2>
              <Link
                href="/admin/appointments?status=pending"
                className="text-sm text-brand-black/50"
              >
                Review
              </Link>
            </div>
            {data.pendingAppointments.length === 0 ? (
              <BookingEmptyState
                title="No pending bookings"
                description="New requests will appear here for confirmation."
              />
            ) : (
              <div className="flex flex-col gap-3">
                {data.pendingAppointments.map((appointment) => (
                  <AdminAppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    compact
                    isUpdating={appointmentActions.isUpdating}
                    onUpdateStatus={async (status) => {
                      await appointmentActions.updateStatus(appointment.id, status);
                    }}
                    onReschedule={async (startTime, date) => {
                      await appointmentActions.reschedule(appointment.id, startTime, date);
                    }}
                    onLoadRescheduleSlots={(date) =>
                      appointmentActions.loadRescheduleSlots(appointment.id, date)
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-6">
            <h2 className="mb-3 font-medium text-brand-black">Quick actions</h2>
            <AdminQuickActions />
          </section>
        </>
      ) : null}

      {error ? (
        <button
          type="button"
          className="mt-4 text-sm font-medium text-brand-black underline"
          onClick={() => void reload()}
        >
          Try again
        </button>
      ) : null}
    </MobileAdminShell>
  );
}
