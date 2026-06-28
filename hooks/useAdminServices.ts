'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Service } from '@/lib/supabase/database.types';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'Something went wrong.');
  }

  return data as T;
}

export function useAdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchJson<{ services: Service[] }>(
        '/api/admin/services',
      );
      setServices(response.services);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load services.',
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
        const response = await fetchJson<{ services: Service[] }>(
          '/api/admin/services',
        );
        if (active) {
          setServices(response.services);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load services.',
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

  const runMutation = useCallback(
    async <T>(mutation: () => Promise<T>): Promise<T> => {
      setIsSaving(true);
      setError(null);

      try {
        const result = await mutation();
        await load();
        return result;
      } catch (mutationError) {
        const message =
          mutationError instanceof Error
            ? mutationError.message
            : 'Unable to save service.';
        setError(message);
        throw mutationError;
      } finally {
        setIsSaving(false);
      }
    },
    [load],
  );

  const saveService = useCallback(
    async (
      input: {
        name: string;
        description?: string;
        priceJmd: number;
        durationMinutes: number;
        bufferMinutes?: number;
        active?: boolean;
      },
      id?: string,
    ) => {
      return runMutation(async () => {
        if (id) {
          const response = await fetchJson<{ service: Service }>(
            `/api/admin/services/${id}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(input),
            },
          );
          return response.service;
        }

        const response = await fetchJson<{ service: Service }>(
          '/api/admin/services',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          },
        );
        return response.service;
      });
    },
    [runMutation],
  );

  const toggleActive = useCallback(
    async (id: string, active: boolean) => {
      await runMutation(async () => {
        const response = await fetchJson<{ service: Service }>(
          `/api/admin/services/${id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active }),
          },
        );
        return response.service;
      });
    },
    [runMutation],
  );

  return {
    services,
    isLoading,
    isSaving,
    error,
    reload: load,
    saveService,
    toggleActive,
  };
}
