'use client';

import { MobileAdminShell } from '@/components/mobile/shared/MobileAdminShell';
import { AdminServicesSection } from '@/components/shared/admin/services/AdminServicesSection';
import {
  BookingAlert,
  BookingLoadingState,
} from '@/components/shared/booking/BookingStates';
import { useAdminServices } from '@/hooks/useAdminServices';

export function MobileAdminServicesPage() {
  const { services, isLoading, isSaving, error, saveService, toggleActive } =
    useAdminServices();

  return (
    <MobileAdminShell
      title="Services"
      subtitle="Manage lash services and pricing"
    >
      {error ? (
        <div className="mb-4">
          <BookingAlert message={error} />
        </div>
      ) : null}

      {isLoading ? (
        <BookingLoadingState message="Loading services..." />
      ) : (
        <AdminServicesSection
          compact
          services={services}
          isSaving={isSaving}
          onSave={async (input, id) => {
            await saveService(input, id);
          }}
          onToggleActive={toggleActive}
        />
      )}
    </MobileAdminShell>
  );
}
