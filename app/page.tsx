'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LoadingScreen } from '@/components/shared/ui/LoadingScreen';
import { MobileHomePage } from '@/components/mobile/booking/MobileHomePage';
import { DesktopHomePage } from '@/components/desktop/booking/DesktopHomePage';

export default function HomePage() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile === null) return <LoadingScreen />;
  if (isMobile) return <MobileHomePage />;
  return <DesktopHomePage />;
}
