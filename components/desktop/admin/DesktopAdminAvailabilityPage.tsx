'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DesktopAdminShell } from '@/components/desktop/shared/DesktopAdminShell';
import { AdminSpecialAvailabilitySection } from '@/components/shared/admin/availability/AdminSpecialAvailabilitySection';
import { AdminUnavailableBlocksSection } from '@/components/shared/admin/availability/AdminUnavailableBlocksSection';
import { AdminWeeklyRulesSection } from '@/components/shared/admin/availability/AdminWeeklyRulesSection';
import {
  BookingAlert,
  BookingLoadingState,
} from '@/components/shared/booking/BookingStates';
import { useAdminAvailability } from '@/hooks/useAdminAvailability';

function DesktopAdminAvailabilityContent() {
  const searchParams = useSearchParams();

  const {
    rules,
    blocks,
    overrides,
    isLoading,
    isSaving,
    error,
    saveRule,
    deleteRule,
    saveBlock,
    deleteBlock,
    saveOverride,
    deleteOverride,
  } = useAdminAvailability();

  return (
    <DesktopAdminShell
      title="Availability"
      subtitle="Manage weekly hours, blocked time, and special booking windows"
    >
      {error ? (
        <div className="mb-4">
          <BookingAlert message={error} />
        </div>
      ) : null}

      {isLoading ? (
        <BookingLoadingState message="Loading availability..." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <AdminWeeklyRulesSection
            rules={rules}
            isSaving={isSaving}
            onSave={async (input, id) => {
              await saveRule(input, id);
            }}
            onDelete={deleteRule}
          />

          <AdminUnavailableBlocksSection
            blocks={blocks}
            isSaving={isSaving}
            startOpen={searchParams.get('action') === 'block'}
            onSave={async (input, id) => {
              await saveBlock(input, id);
            }}
            onDelete={deleteBlock}
          />

          <AdminSpecialAvailabilitySection
            overrides={overrides}
            isSaving={isSaving}
            onSave={async (input, id) => {
              await saveOverride(input, id);
            }}
            onDelete={deleteOverride}
          />
        </div>
      )}
    </DesktopAdminShell>
  );
}

export function DesktopAdminAvailabilityPage() {
  return (
    <Suspense
      fallback={
        <DesktopAdminShell title="Availability" subtitle="Loading...">
          <BookingLoadingState message="Loading availability..." />
        </DesktopAdminShell>
      }
    >
      <DesktopAdminAvailabilityContent />
    </Suspense>
  );
}
