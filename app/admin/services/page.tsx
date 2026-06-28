'use client';

import { Suspense } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LoadingScreen } from '@/components/shared/ui/LoadingScreen';
import { MobileAdminServicesPage } from '@/components/mobile/admin/MobileAdminServicesPage';
import { DesktopAdminServicesPage } from '@/components/desktop/admin/DesktopAdminServicesPage';

function AdminServicesContent() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile === null) return <LoadingScreen />;
  if (isMobile) return <MobileAdminServicesPage />;
  return <DesktopAdminServicesPage />;
}

export default function AdminServicesPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminServicesContent />
    </Suspense>
  );
}
