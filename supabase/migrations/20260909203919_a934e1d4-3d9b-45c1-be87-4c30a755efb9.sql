-- 1. Profiles: birthday + certificate
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS certificate_no text,
  ADD COLUMN IF NOT EXISTS certificate_issued_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_certificate_no_key ON public.profiles (certificate_no);
CREATE SEQUENCE IF NOT EXISTS public.certificate_seq START 1001;

CREATE OR REPLACE FUNCTION public.issue_membership_certificate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.certificate_no IS NULL THEN
    NEW.certificate_no := 'BPMF-' || to_char(now(), 'YYYY') || '-' || nextval('public.certificate_seq');
    NEW.certificate_issued_at := now();
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.issue_membership_certificate() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS issue_certificate_on_approval ON public.profiles;
CREATE TRIGGER issue_certificate_on_approval
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.issue_membership_certificate();

-- 2. Site settings (hero image, headline, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site settings public read" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "team manage site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (key, value) VALUES
  ('hero_image_url', ''),
  ('hero_title', 'Bangladesh Pharma Microbiologists Foundation'),
  ('hero_subtitle', 'Advancing pharmaceutical microbiology practice across Bangladesh through training, collaboration and professional excellence.')
ON CONFLICT (key) DO NOTHING;

-- 3. Quiz questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options text[] NOT NULL,
  answer_index integer NOT NULL DEFAULT 0,
  explanation text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quiz_questions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_questions TO authenticated;
GRANT ALL ON public.quiz_questions TO service_role;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz questions public read" ON public.quiz_questions
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "team manage quiz questions" ON public.quiz_questions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER update_quiz_questions_updated_at
BEFORE UPDATE ON public.quiz_questions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.quiz_questions (question, options, answer_index, explanation, sort_order) VALUES
 ('Which incubation condition is used for the Total Aerobic Microbial Count (TAMC) per USP <61>?',
  ARRAY['20-25 C for 5-7 days','30-35 C for 3-5 days','42-45 C for 24 hours','55 C for 48 hours'], 1,
  'TAMC uses Soybean-Casein Digest Agar at 30-35 C for 3 to 5 days; TYMC uses Sabouraud Dextrose Agar at 20-25 C for 5 to 7 days.', 1),
 ('What is the endotoxin limit formula for a parenteral drug (non-intrathecal)?',
  ARRAY['K/M where K = 5 EU/kg/hr','K/M where K = 0.2 EU/kg','M/K where K = 350 EU','K x M where K = 1 EU/mL'], 0,
  'Endotoxin limit = K/M, with K = 5.0 EU/kg per hour for parenteral routes.', 2),
 ('In EU GMP Annex 1, what is the maximum permitted viable settle-plate count for Grade A in four hours?',
  ARRAY['10 CFU','5 CFU','1 CFU','No detectable growth (< 1 CFU)'], 3,
  'Grade A requires no growth to be detected; any recovery is an excursion requiring investigation.', 3),
 ('Which organism is the compendial challenge for antimicrobial effectiveness of an aqueous multi-dose product?',
  ARRAY['Bacillus subtilis','Pseudomonas aeruginosa','Clostridium sporogenes','Geobacillus stearothermophilus'], 1,
  'USP <51> uses P. aeruginosa, S. aureus, E. coli, C. albicans and A. brasiliensis.', 4),
 ('Which biological indicator validates moist-heat (steam) sterilisation?',
  ARRAY['Bacillus atrophaeus','Geobacillus stearothermophilus','Aspergillus brasiliensis','Candida albicans'], 1,
  'G. stearothermophilus spores are the standard BI for steam at 121 C.', 5),
 ('What is the standard F0 value targeted for terminal moist-heat sterilisation?',
  ARRAY['1 minute','4 minutes','8 minutes','15 minutes'], 3,
  'An F0 of at least 15 minutes at 121 C with z = 10 C is the conventional target.', 6),
 ('In water system monitoring, what is the action limit for Purified Water total viable count?',
  ARRAY['10 CFU/mL','100 CFU/mL','500 CFU/mL','1000 CFU/mL'], 1,
  'Purified Water action level is 100 CFU/mL; Water for Injection is 10 CFU/100 mL.', 7),
 ('Which method is preferred for sterility testing of a filterable antibiotic solution?',
  ARRAY['Direct inoculation','Membrane filtration','Spread plate','Most probable number'], 1,
  'Membrane filtration lets the inhibitory antimicrobial be rinsed away before incubation.', 8)
ON CONFLICT DO NOTHING;

-- 4. Quiz locks
CREATE TABLE IF NOT EXISTS public.quiz_locks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.quiz_questions(id) ON DELETE SET NULL,
  wrong_count integer NOT NULL DEFAULT 1,
  locked_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quiz_locks TO authenticated;
GRANT ALL ON public.quiz_locks TO service_role;
ALTER TABLE public.quiz_locks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own quiz lock read" ON public.quiz_locks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.lock_my_quiz(_question_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
  INSERT INTO public.quiz_locks (user_id, question_id)
  VALUES (auth.uid(), _question_id)
  ON CONFLICT (user_id) DO UPDATE
    SET wrong_count = public.quiz_locks.wrong_count + 1,
        question_id = EXCLUDED.question_id,
        locked_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_quiz_lock(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Team members only'; END IF;
  DELETE FROM public.quiz_locks WHERE user_id = _user_id;
END;
$$;

-- 5. Today's birthdays (public, minimal fields)
CREATE OR REPLACE FUNCTION public.todays_birthdays()
RETURNS TABLE (full_name text, organization text, designation text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.full_name, p.organization, p.designation
  FROM public.profiles p
  WHERE p.status = 'active'
    AND p.date_of_birth IS NOT NULL
    AND to_char(p.date_of_birth, 'MM-DD') = to_char((now() AT TIME ZONE 'Asia/Dhaka')::date, 'MM-DD')
  ORDER BY p.full_name;
$$;

GRANT EXECUTE ON FUNCTION public.todays_birthdays() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lock_my_quiz(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_quiz_lock(uuid) TO authenticated;