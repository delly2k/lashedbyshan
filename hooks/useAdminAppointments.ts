'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminAppointmentView } from '@/components/shared/admin/AdminAppointmentFilters';
import type { AdminAppointment, AdminDashboardData } from '@/lib/admin/types';
import type { AppointmentStatus } from '@/lib/booking/types';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'Something went wrong.');
  }

  return data as T;
}

function buildAppointmentsUrl(options: {
  view: AdminAppointmentView;
  date?: string | null;
  search?: string | null;
}) {
  const params = new URLSearchParams();
  params.set('view', options.view);

  if (options.view === 'date' && options.date) {
    params.set('date', options.date);
  }

  if (options.search?.trim()) {
    params.set('q', options.search.trim());
  }

  return `/api/admin/appointments?${params.toString()}`;
}

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchJson<AdminDashboardData>('/api/admin/dashboard');
      setData(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load dashboard.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchJson<AdminDashboardData>('/api/admin/dashboard');
        if (active) {
          setData(response);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load dashboard.',
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return { data, isLoading, error, reload: load };
}

export function useAdminAppointments(options: {
  view: AdminAppointmentView;
  date?: string | null;
  search?: string | null;
}) {
  const { view, date, search } = options;
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchJson<{ appointments: AdminAppointment[] }>(
        buildAppointmentsUrl({ view, date, search }),
      );
      setAppointments(response.appointments);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load appointments.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [view, date, search]);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchJson<{ appointments: AdminAppointment[] }>(
          buildAppointmentsUrl({ view, date, search }),
        );
        if (active) {
          setAppointments(response.appointments);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load appointments.',
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [view, date, search]);

  const updateStatus = useCallback(
    async (appointmentId: string, status: AppointmentStatus) => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await fetchJson<{ appointment: AdminAppointment }>(
          `/api/admin/appointments/${appointmentId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          },
        );

        setAppointments((current) =>
          current.map((appointment) =>
            appointment.id === appointmentId
              ? response.appointment
              : appointment,
          ),
        );

        return response.appointment;
      } catch (updateError) {
        const message =
          updateError instanceof Error
            ? updateError.message
            : 'Unable to update appointment.';
        setError(message);
        throw updateError;
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  const reschedule = useCallback(
    async (appointmentId: string, startTime: string, date: string) => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await fetchJson<{ appointment: AdminAppointment }>(
          `/api/admin/appointments/${appointmentId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startTime, date }),
          },
        );

        setAppointments((current) =>
          current.map((appointment) =>
            appointment.id === appointmentId
              ? response.appointment
              : appointment,
          ),
        );

        return response.appointment;
      } catch (updateError) {
        const message =
          updateError instanceof Error
            ? updateError.message
            : 'Unable to reschedule appointment.';
        setError(message);
        throw updateError;
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  const loadRescheduleSlots = useCallback(
    async (appointmentId: string, date: string) => {
      const response = await fetchJson<{
        slots: Array<{ startTime: string; label: string }>;
      }>(`/api/admin/appointments/${appointmentId}?date=${encodeURIComponent(date)}`);
      return response.slots;
    },
    [],
  );

  return {
    appointments,
    isLoading,
    isUpdating,
    error,
    reload: load,
    updateStatus,
    reschedule,
    loadRescheduleSlots,
  };
}
