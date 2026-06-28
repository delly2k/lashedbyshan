'use client';

import { Suspense } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LoadingScreen } from '@/components/shared/ui/LoadingScreen';
import { MobileAdminLoginPage } from '@/components/mobile/admin/MobileAdminLoginPage';
import { DesktopAdminLoginPage } from '@/components/desktop/admin/DesktopAdminLoginPage';

function AdminLoginContent() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile === null) return <LoadingScreen />;
  if (isMobile) return <MobileAdminLoginPage />;
  return <DesktopAdminLoginPage />;
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminLoginContent />
    </Suspense>
  );
}
