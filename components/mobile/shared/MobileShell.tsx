import Link from 'next/link';
import { BrandFooter } from '@/components/shared/booking/BrandFooter';
import { HeaderSocials } from '@/components/shared/ui/HeaderSocials';
import { Logo } from '@/components/shared/ui/Logo';
import { cn } from '@/lib/utils/cn';

type MobileShellProps = {
  children: React.ReactNode;
  className?: string;
  showFooter?: boolean;
  showHeader?: boolean;
};

export function MobileShell({
  children,
  className,
  showFooter = true,
  showHeader = true,
}: MobileShellProps) {
  return (
    <div className="flex flex-col bg-gradient-to-b from-brand-cream via-white to-brand-pink/20">
      {showHeader ? (
        <header className="border-b border-rose-gold/30 bg-brand-cream px-5 py-1.5">
          <div className="flex items-center justify-between">
            <Link href="/" className="block shrink-0">
              <Logo priority className="h-14" />
            </Link>
            <HeaderSocials />
          </div>
        </header>
      ) : null}
      <main className={cn('flex flex-col pb-8', className)}>
        {children}
      </main>
      {showFooter ? <BrandFooter /> : null}
    </div>
  );
}
