-- Row Level Security for LashedByShan
-- Customers are anonymous: read active services, create pending appointments only.
-- Admin manages everything via authenticated session with profiles.role = admin.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unavailable_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins manage profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- services
CREATE POLICY "Public can read active services"
  ON public.services
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admins manage services"
  ON public.services
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- availability_rules
CREATE POLICY "Admins manage availability rules"
  ON public.availability_rules
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- availability_overrides
CREATE POLICY "Admins manage availability overrides"
  ON public.availability_overrides
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- unavailable_blocks (reason is never exposed via public API; table is admin-only)
CREATE POLICY "Admins manage unavailable blocks"
  ON public.unavailable_blocks
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- appointments
CREATE POLICY "Public can create pending appointment requests"
  ON public.appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND EXISTS (
      SELECT 1
      FROM public.services
      WHERE services.id = appointments.service_id
        AND services.active = true
    )
  );

CREATE POLICY "Admins manage appointments"
  ON public.appointments
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins update appointments"
  ON public.appointments
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete appointments"
  ON public.appointments
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
