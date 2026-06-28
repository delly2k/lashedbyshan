'use client';

import { Suspense } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LoadingScreen } from '@/components/shared/ui/LoadingScreen';
import { MobileAdminAppointmentsPage } from '@/components/mobile/admin/MobileAdminAppointmentsPage';
import { DesktopAdminAppointmentsPage } from '@/components/desktop/admin/DesktopAdminAppointmentsPage';

function AdminAppointmentsContent() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile === null) return <LoadingScreen />;
  if (isMobile) return <MobileAdminAppointmentsPage />;
  return <DesktopAdminAppointmentsPage />;
}

export default function AdminAppointmentsPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminAppointmentsContent />
    </Suspense>
  );
}
