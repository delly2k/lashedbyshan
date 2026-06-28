'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MobileAdminShell } from '@/components/mobile/shared/MobileAdminShell';
import { AdminSpecialAvailabilitySection } from '@/components/shared/admin/availability/AdminSpecialAvailabilitySection';
import { AdminUnavailableBlocksSection } from '@/components/shared/admin/availability/AdminUnavailableBlocksSection';
import { AdminWeeklyRulesSection } from '@/components/shared/admin/availability/AdminWeeklyRulesSection';
import {
  BookingAlert,
  BookingLoadingState,
} from '@/components/shared/booking/BookingStates';
import { useAdminAvailability } from '@/hooks/useAdminAvailability';
import { cn } from '@/lib/utils/cn';

type AvailabilityTab = 'weekly' | 'blocks' | 'special';

const TABS: Array<{ id: AvailabilityTab; label: string }> = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'blocks', label: 'Blocked' },
  { id: 'special', label: 'Extra hours' },
];

function MobileAdminAvailabilityContent() {
  const searchParams = useSearchParams();
  const initialTab: AvailabilityTab =
    searchParams.get('action') === 'block' ? 'blocks' : 'weekly';
  const [activeTab, setActiveTab] = useState<AvailabilityTab>(initialTab);

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
    <MobileAdminShell
      title="Availability"
      subtitle="Weekly hours and blocked time"
    >
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
                isActive
                  ? 'bg-brand-black text-white'
                  : 'bg-white text-brand-black/60 shadow-soft',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="mt-4">
          <BookingAlert message={error} />
        </div>
      ) : null}

      {isLoading ? (
        <BookingLoadingState message="Loading availability..." />
      ) : (
        <div className="mt-4">
          {activeTab === 'weekly' ? (
            <AdminWeeklyRulesSection
              compact
              rules={rules}
              isSaving={isSaving}
              onSave={async (input, id) => {
                await saveRule(input, id);
              }}
              onDelete={deleteRule}
            />
          ) : null}

          {activeTab === 'blocks' ? (
            <AdminUnavailableBlocksSection
              compact
              blocks={blocks}
              isSaving={isSaving}
              startOpen={searchParams.get('action') === 'block'}
              onSave={async (input, id) => {
                await saveBlock(input, id);
              }}
              onDelete={deleteBlock}
            />
          ) : null}

          {activeTab === 'special' ? (
            <AdminSpecialAvailabilitySection
              compact
              overrides={overrides}
              isSaving={isSaving}
              onSave={async (input, id) => {
                await saveOverride(input, id);
              }}
              onDelete={deleteOverride}
            />
          ) : null}
        </div>
      )}
    </MobileAdminShell>
  );
}

export function MobileAdminAvailabilityPage() {
  return (
    <Suspense
      fallback={
        <MobileAdminShell title="Availability" subtitle="Loading...">
          <BookingLoadingState message="Loading availability..." />
        </MobileAdminShell>
      }
    >
      <MobileAdminAvailabilityContent />
    </Suspense>
  );
}
