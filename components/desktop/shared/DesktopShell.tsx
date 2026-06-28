import Link from 'next/link';
import { BrandFooter } from '@/components/shared/booking/BrandFooter';
import { HeaderSocials } from '@/components/shared/ui/HeaderSocials';
import { Logo } from '@/components/shared/ui/Logo';
import { cn } from '@/lib/utils/cn';

type DesktopShellProps = {
  children: React.ReactNode;
  className?: string;
  showFooter?: boolean;
};

export function DesktopShell({
  children,
  className,
  showFooter = true,
}: DesktopShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-blush/20">
      <header className="border-b border-rose-gold/30 bg-brand-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-2">
          <Link href="/" className="block shrink-0">
            <Logo priority className="h-[4.5rem]" />
          </Link>
          <HeaderSocials />
        </div>
      </header>
      <main className={cn('w-full py-10', className)}>
        {children}
      </main>
      {showFooter ? <BrandFooter /> : null}
    </div>
  );
}
