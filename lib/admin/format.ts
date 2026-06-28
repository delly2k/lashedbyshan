import { formatSlotLabel, fromTimestamptz } from '@/lib/utils/datetime';

export function formatAdminAppointmentDate(startTime: string): string {
  return new Intl.DateTimeFormat('en-JM', {
    timeZone: 'America/Jamaica',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(fromTimestamptz(startTime));
}

export function formatAdminAppointmentTime(startTime: string): string {
  return formatSlotLabel(fromTimestamptz(startTime));
}
