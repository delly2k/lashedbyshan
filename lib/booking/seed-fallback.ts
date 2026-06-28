/** Static preview data matching supabase/migrations/20250626120002_seed_services.sql */
export const PLACEHOLDER_SERVICES = [
  {
    id: 'classic-set',
    name: 'Classic Set',
    durationMinutes: 90,
    priceJmd: 5000,
    description: 'Natural, one-extension-per-lash look for everyday elegance.',
  },
  {
    id: 'hybrid-set',
    name: 'Hybrid Set',
    durationMinutes: 120,
    priceJmd: 7000,
    description: 'A soft blend of classic and volume for textured fullness.',
  },
  {
    id: 'volume-set',
    name: 'Volume Set',
    durationMinutes: 150,
    priceJmd: 8500,
    description: 'Lightweight lash fans for a full, fluffy finish.',
  },
  {
    id: 'mega-volume-set',
    name: 'Mega Volume Set',
    durationMinutes: 180,
    priceJmd: 9500,
    description: 'Maximum density and drama for a bold lash statement.',
  },
] as const;

export type PlaceholderService = (typeof PLACEHOLDER_SERVICES)[number];
