'use client';

import { Suspense } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LoadingScreen } from '@/components/shared/ui/LoadingScreen';
import { MobileAdminAvailabilityPage } from '@/components/mobile/admin/MobileAdminAvailabilityPage';
import { DesktopAdminAvailabilityPage } from '@/components/desktop/admin/DesktopAdminAvailabilityPage';

function AdminAvailabilityContent() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile === null) return <LoadingScreen />;
  if (isMobile) return <MobileAdminAvailabilityPage />;
  return <DesktopAdminAvailabilityPage />;
}

export default function AdminAvailabilityPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminAvailabilityContent />
    </Suspense>
  );
}
