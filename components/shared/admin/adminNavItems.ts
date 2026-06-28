export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
  icon: string;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    description: 'Overview and quick stats',
    icon: '⌂',
  },
  {
    href: '/admin/appointments',
    label: 'Appointments',
    description: 'View and manage bookings',
    icon: '📅',
  },
  {
    href: '/admin/availability',
    label: 'Availability',
    description: 'Set working hours and blocks',
    icon: '🕒',
  },
  {
    href: '/admin/services',
    label: 'Services',
    description: 'Manage lash services and pricing',
    icon: '✦',
  },
];

export const ADMIN_QUICK_ACTIONS = [
  {
    href: '/admin/availability',
    label: 'Manage availability',
    description: 'Update weekly hours and special dates',
  },
  {
    href: '/admin/availability?action=block',
    label: 'Block unavailable time',
    description: 'Mark time away for your other job',
  },
  {
    href: '/admin/services',
    label: 'Manage services',
    description: 'Edit lash services and pricing',
  },
  {
    href: '/admin/appointments?view=pending',
    label: 'Review pending bookings',
    description: 'Confirm new appointment requests',
  },
] as const;
