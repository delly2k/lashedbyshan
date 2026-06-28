'use client';

import Link from 'next/link';
import { DesktopAdminShell } from '@/components/desktop/shared/DesktopAdminShell';
import { AdminAppointmentCard } from '@/components/shared/admin/AdminAppointmentCard';
import { AdminQuickActions } from '@/components/shared/admin/AdminQuickActions';
import {
  BookingAlert,
  BookingEmptyState,
  BookingLoadingState,
} from '@/components/shared/booking/BookingStates';
import { Card } from '@/components/shared/ui/Card';
import { useAdminDashboard, useAdminAppointments } from '@/hooks/useAdminAppointments';

export function DesktopAdminDashboardPage() {
  const { data, isLoading, error, reload } = useAdminDashboard();
  const appointmentActions = useAdminAppointments({ view: 'today' });

  if (isLoading) {
    return (
      <DesktopAdminShell
        title="Dashboard"
        subtitle="Overview of appointments and bookings"
      >
        <BookingLoadingState message="Loading dashboard..." />
      </DesktopAdminShell>
    );
  }

  return (
    <DesktopAdminShell
      title="Dashboard"
      subtitle="Overview of appointments and bookings"
    >
      {error ? (
        <div className="mb-6">
          <BookingAlert message={error} />
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Today', value: data.stats.todayCount, hint: 'Appointments today' },
              { label: 'Pending', value: data.stats.pendingCount, hint: 'Awaiting confirmation' },
              { label: 'Confirmed', value: data.stats.confirmedCount, hint: 'Upcoming confirmed' },
              { label: 'Upcoming', value: data.stats.upcomingCount, hint: 'Next scheduled' },
            ].map((stat) => (
              <Card key={stat.label} variant="elevated" className="p-6">
                <p className="text-sm text-brand-black/50">{stat.label}</p>
                <p className="mt-2 font-display text-4xl font-semibold">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-brand-black/50">{stat.hint}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card variant="elevated" className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">
                  Today&apos;s appointments
                </h2>
                <Link href="/admin/appointments" className="text-sm text-brand-black/50">
                  View all
                </Link>
              </div>
              {data.todayAppointments.length === 0 ? (
                <BookingEmptyState
                  title="No appointments today"
                  description="Your schedule is clear for today."
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {data.todayAppointments.map((appointment) => (
                    <AdminAppointmentCard
                      key={appointment.id}
                      appointment={appointment}
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
            </Card>

            <div className="flex flex-col gap-6">
              <Card variant="elevated" className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold">
                    Upcoming appointments
                  </h2>
                </div>
                {data.upcomingAppointments.length === 0 ? (
                  <BookingEmptyState
                    title="Nothing upcoming"
                    description="Confirmed and pending bookings will show here."
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {data.upcomingAppointments.map((appointment) => (
                      <AdminAppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        compact
                        isUpdating={appointmentActions.isUpdating}
                        onUpdateStatus={async (status) => {
                          await appointmentActions.updateStatus(appointment.id, status);
                        }}
                        onReschedule={async (startTime, date) => {
                          await appointmentActions.reschedule(
                            appointment.id,
                            startTime,
                            date,
                          );
                        }}
                        onLoadRescheduleSlots={(date) =>
                          appointmentActions.loadRescheduleSlots(appointment.id, date)
                        }
                      />
                    ))}
                  </div>
                )}
              </Card>

              <Card variant="elevated" className="p-6">
                <h2 className="font-display text-xl font-semibold">Quick actions</h2>
                <div className="mt-4">
                  <AdminQuickActions />
                </div>
              </Card>
            </div>
          </div>
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
    </DesktopAdminShell>
  );
}
