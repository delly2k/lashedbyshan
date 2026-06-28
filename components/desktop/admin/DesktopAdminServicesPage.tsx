'use client';

import { DesktopAdminShell } from '@/components/desktop/shared/DesktopAdminShell';
import { AdminServicesSection } from '@/components/shared/admin/services/AdminServicesSection';
import {
  BookingAlert,
  BookingLoadingState,
} from '@/components/shared/booking/BookingStates';

import { useAdminServices } from '@/hooks/useAdminServices';

export function DesktopAdminServicesPage() {
  const { services, isLoading, isSaving, error, saveService, toggleActive } =
    useAdminServices();

  return (
    <DesktopAdminShell
      title="Services"
      subtitle="Manage lash services, pricing, and duration"
    >
      {error ? (
        <div className="mb-4">
          <BookingAlert message={error} />
        </div>
      ) : null}

      {isLoading ? (
        <BookingLoadingState message="Loading services..." />
      ) : (
        <div className="max-w-3xl">
          <AdminServicesSection
            services={services}
            isSaving={isSaving}
            onSave={async (input, id) => {
              await saveService(input, id);
            }}
            onToggleActive={toggleActive}
          />
        </div>
      )}
    </DesktopAdminShell>
  );
}
