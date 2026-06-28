'use client';

import Link from 'next/link';
import { ADMIN_QUICK_ACTIONS } from '@/components/shared/admin/adminNavItems';
import { Card } from '@/components/shared/ui/Card';

export function AdminQuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ADMIN_QUICK_ACTIONS.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card
            variant="elevated"
            className="h-full p-4 transition hover:bg-brand-cream/40"
          >
            <p className="font-medium text-brand-black">{action.label}</p>
            <p className="mt-1 text-sm text-brand-black/60">
              {action.description}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
