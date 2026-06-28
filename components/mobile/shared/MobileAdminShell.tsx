'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminBottomNav } from '@/components/shared/admin/AdminBottomNav';
import { Button } from '@/components/shared/ui/Button';
import { Logo } from '@/components/shared/ui/Logo';
import { cn } from '@/lib/utils/cn';

type MobileAdminShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
};

export function MobileAdminShell({
  children,
  title,
  subtitle,
  className,
}: MobileAdminShellProps) {
  const { signOut } = useAdminAuth();

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream pb-24">
      <header className="border-b border-brand-blush/20 bg-white px-5 pb-4 pt-6">
        <div className="flex items-center justify-between gap-3">
          <Logo size="sm" />
          <Button variant="ghost" size="sm" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-brand-black">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-brand-black/60">{subtitle}</p>
        ) : null}
      </header>
      <main className={cn('flex-1 px-5 py-6', className)}>{children}</main>
      <AdminBottomNav />
    </div>
  );
}
