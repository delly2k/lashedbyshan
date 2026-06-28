'use client';

import { Suspense } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LoadingScreen } from '@/components/shared/ui/LoadingScreen';
import { MobileBookingPage } from '@/components/mobile/booking/MobileBookingPage';
import { DesktopBookingPage } from '@/components/desktop/booking/DesktopBookingPage';

function BookingPageContent() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile === null) return <LoadingScreen />;
  if (isMobile) return <MobileBookingPage />;
  return <DesktopBookingPage />;
}

export default function BookingPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BookingPageContent />
    </Suspense>
  );
}
