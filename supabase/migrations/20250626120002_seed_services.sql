-- Seed lash services for LashedByShan
-- Default buffer_minutes = 15 after each appointment.

INSERT INTO public.services (
  name,
  description,
  price_jmd,
  duration_minutes,
  buffer_minutes,
  active
)
VALUES
  (
    'Classic Set',
    'Natural, one-extension-per-lash look for everyday elegance.',
    5000,
    90,
    15,
    true
  ),
  (
    'Hybrid Set',
    'A soft blend of classic and volume for textured fullness.',
    7000,
    120,
    15,
    true
  ),
  (
    'Volume Set',
    'Lightweight lash fans for a full, fluffy finish.',
    8500,
    150,
    15,
    true
  ),
  (
    'Mega Volume Set',
    'Maximum density and drama for a bold lash statement.',
    9500,
    180,
    15,
    true
  );
