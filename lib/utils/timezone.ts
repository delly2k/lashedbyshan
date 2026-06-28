export const APP_TIMEZONE = 'America/Jamaica';

export function formatInAppTimezone(
  date: Date,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat('en-JM', {
    timeZone: APP_TIMEZONE,
    ...options,
  }).format(date);
}
