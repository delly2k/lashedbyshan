'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV_ITEMS } from '@/components/shared/admin/adminNavItems';
import { cn } from '@/lib/utils/cn';

export function AdminTabNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-brand-black text-white'
                : 'bg-white text-brand-black/70 shadow-soft',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
