import { cn } from '@/lib/utils/cn';

type MobileBookingShellProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function MobileBookingShell({
  children,
  footer,
  className,
}: MobileBookingShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-pink/35 via-brand-cream to-white">
      <main className={cn('flex flex-1 flex-col px-5 pb-44 pt-6', className)}>
        {children}
      </main>
      {footer ? (
        <div className="fixed inset-x-0 bottom-0 border-t border-brand-blush/30 bg-white/95 p-4 backdrop-blur-md">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
