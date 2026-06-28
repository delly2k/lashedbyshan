'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV_ITEMS } from '@/components/shared/admin/adminNavItems';
import { cn } from '@/lib/utils/cn';

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-2xl px-4 py-3 transition',
              isActive
                ? 'bg-brand-black text-white'
                : 'text-brand-black/70 hover:bg-brand-cream',
            )}
          >
            <span className="block font-medium">{item.label}</span>
            <span
              className={cn(
                'mt-0.5 block text-xs',
                isActive ? 'text-white/70' : 'text-brand-black/50',
              )}
            >
              {item.description}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
