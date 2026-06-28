'use client';

import { Suspense } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LoadingScreen } from '@/components/shared/ui/LoadingScreen';
import { MobileAdminDashboardPage } from '@/components/mobile/admin/MobileAdminDashboardPage';
import { DesktopAdminDashboardPage } from '@/components/desktop/admin/DesktopAdminDashboardPage';

function AdminDashboardContent() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile === null) return <LoadingScreen />;
  if (isMobile) return <MobileAdminDashboardPage />;
  return <DesktopAdminDashboardPage />;
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
