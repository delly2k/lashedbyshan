'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminSidebarNav } from '@/components/shared/admin/AdminSidebarNav';
import { Button } from '@/components/shared/ui/Button';
import { Logo } from '@/components/shared/ui/Logo';
import { cn } from '@/lib/utils/cn';

type DesktopAdminShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
};

export function DesktopAdminShell({
  children,
  title,
  subtitle,
  className,
}: DesktopAdminShellProps) {
  const { signOut } = useAdminAuth();

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="flex w-72 shrink-0 flex-col border-r border-brand-blush/30 bg-white px-6 py-8">
          <Logo size="md" className="h-12" />
          <p className="mt-3 text-sm text-brand-black/50">Admin dashboard</p>
          <div className="mt-8 flex-1">
            <AdminSidebarNav />
          </div>
          <Button variant="secondary" onClick={() => void signOut()}>
            Sign out
          </Button>
        </aside>
        <div className="flex flex-1 flex-col">
          <header className="border-b border-brand-blush/20 bg-white/80 px-8 py-6 backdrop-blur-md">
            <h1 className="font-display text-3xl font-semibold text-brand-black">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 text-brand-black/60">{subtitle}</p>
            ) : null}
          </header>
          <main className={cn('flex-1 px-8 py-8', className)}>{children}</main>
        </div>
      </div>
    </div>
  );
}
