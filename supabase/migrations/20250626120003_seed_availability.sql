-- Default weekly lash availability for LashedByShan
-- Customers can only book on days with active rules.
-- Shan can change these anytime from Admin → Availability.

INSERT INTO public.availability_rules (day_of_week, start_time, end_time, active)
SELECT 6, '10:00:00', '18:00:00', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.availability_rules WHERE day_of_week = 6 AND active = true
);
