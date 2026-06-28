'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminAvailabilityData } from '@/lib/admin/availability';
import type {
  AvailabilityOverride,
  AvailabilityRule,
  UnavailableBlock,
} from '@/lib/supabase/database.types';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'Something went wrong.');
  }

  return data as T;
}

export function useAdminAvailability() {
  const [data, setData] = useState<AdminAvailabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchJson<AdminAvailabilityData>(
        '/api/admin/availability',
      );
      setData(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load availability.',
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
        const response = await fetchJson<AdminAvailabilityData>(
          '/api/admin/availability',
        );
        if (active) {
          setData(response);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load availability.',
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
            : 'Unable to save changes.';
        setError(message);
        throw mutationError;
      } finally {
        setIsSaving(false);
      }
    },
    [load],
  );

  const saveRule = useCallback(
    async (
      input: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        active?: boolean;
      },
      id?: string,
    ) => {
      return runMutation(async () => {
        if (id) {
          const response = await fetchJson<{ rule: AvailabilityRule }>(
            `/api/admin/availability/rules/${id}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(input),
            },
          );
          return response.rule;
        }

        const response = await fetchJson<{ rule: AvailabilityRule }>(
          '/api/admin/availability/rules',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          },
        );
        return response.rule;
      });
    },
    [runMutation],
  );

  const deleteRule = useCallback(
    async (id: string) => {
      await runMutation(async () => {
        await fetchJson(`/api/admin/availability/rules/${id}`, {
          method: 'DELETE',
        });
      });
    },
    [runMutation],
  );

  const saveOverride = useCallback(
    async (
      input: {
        date: string;
        startTime: string;
        endTime: string;
        type: AvailabilityOverride['type'];
        note?: string | null;
      },
      id?: string,
    ) => {
      return runMutation(async () => {
        if (id) {
          const response = await fetchJson<{ override: AvailabilityOverride }>(
            `/api/admin/availability/overrides/${id}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(input),
            },
          );
          return response.override;
        }

        const response = await fetchJson<{ override: AvailabilityOverride }>(
          '/api/admin/availability/overrides',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          },
        );
        return response.override;
      });
    },
    [runMutation],
  );

  const deleteOverride = useCallback(
    async (id: string) => {
      await runMutation(async () => {
        await fetchJson(`/api/admin/availability/overrides/${id}`, {
          method: 'DELETE',
        });
      });
    },
    [runMutation],
  );

  const saveBlock = useCallback(
    async (
      input: {
        date?: string;
        startTime: string;
        endTime: string;
        reason?: string | null;
        isRecurring: boolean;
        fullDay: boolean;
        daysOfWeek?: number[];
      },
      id?: string,
    ) => {
      return runMutation(async () => {
        if (id) {
          const response = await fetchJson<{ block: UnavailableBlock }>(
            `/api/admin/availability/blocks/${id}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(input),
            },
          );
          return response.block;
        }

        const response = await fetchJson<{ block: UnavailableBlock }>(
          '/api/admin/availability/blocks',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          },
        );
        return response.block;
      });
    },
    [runMutation],
  );

  const deleteBlock = useCallback(
    async (id: string) => {
      await runMutation(async () => {
        await fetchJson(`/api/admin/availability/blocks/${id}`, {
          method: 'DELETE',
        });
      });
    },
    [runMutation],
  );

  return {
    rules: data?.rules ?? [],
    overrides: data?.overrides ?? [],
    blocks: data?.blocks ?? [],
    isLoading,
    isSaving,
    error,
    reload: load,
    saveRule,
    deleteRule,
    saveOverride,
    deleteOverride,
    saveBlock,
    deleteBlock,
  };
}
