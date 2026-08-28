
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin','member');
CREATE TYPE public.membership_status AS ENUM ('pending','active','rejected');
CREATE TYPE public.fee_status AS ENUM ('unpaid','pending_verification','paid');

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  employee_code text,
  mobile_no text,
  blood_group text,
  organization text,
  department text,
  designation text,
  grade text,
  line_of_business text,
  location text,
  reporting_manager_code text,
  photo_url text,
  status public.membership_status NOT NULL DEFAULT 'pending',
  is_paid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_paid_member(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND status = 'active' AND is_paid = true
  ) OR public.has_role(_user_id, 'admin');
$$;

-- profile policies
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "members read approved directory" ON public.profiles FOR SELECT TO authenticated USING (status = 'active');
CREATE POLICY "admin read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "admin update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- prevent members escalating their own status/paid flag
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    NEW.status := OLD.status;
    NEW.is_paid := OLD.is_paid;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_profiles BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE first_user boolean;
BEGIN
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO first_user;

  INSERT INTO public.profiles (
    id, full_name, email, employee_code, mobile_no, blood_group, organization,
    department, designation, grade, line_of_business, location, reporting_manager_code, status, is_paid
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    COALESCE(NEW.email,''),
    NEW.raw_user_meta_data->>'employee_code',
    NEW.raw_user_meta_data->>'mobile_no',
    NEW.raw_user_meta_data->>'blood_group',
    NEW.raw_user_meta_data->>'organization',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'designation',
    NEW.raw_user_meta_data->>'grade',
    NEW.raw_user_meta_data->>'line_of_business',
    NEW.raw_user_meta_data->>'location',
    NEW.raw_user_meta_data->>'reporting_manager_code',
    CASE WHEN first_user THEN 'active'::public.membership_status ELSE 'pending'::public.membership_status END,
    first_user
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN first_user THEN 'admin'::public.app_role ELSE 'member'::public.app_role END)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TRAINING LOGS
CREATE TABLE public.training_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  trainer text,
  training_date date NOT NULL DEFAULT current_date,
  duration_hours numeric,
  location text,
  resource_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_logs TO authenticated;
GRANT ALL ON public.training_logs TO service_role;
ALTER TABLE public.training_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "paid members read training" ON public.training_logs FOR SELECT TO authenticated USING (public.is_paid_member(auth.uid()));
CREATE POLICY "admin manage training" ON public.training_logs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- EVENTS
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL DEFAULT now(),
  venue text,
  image_url text,
  registration_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "paid members read events" ON public.events FOR SELECT TO authenticated USING (public.is_paid_member(auth.uid()));
CREATE POLICY "admin manage events" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- FEES
CREATE TABLE public.fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Annual membership fee',
  amount numeric NOT NULL DEFAULT 0,
  due_date date,
  status public.fee_status NOT NULL DEFAULT 'unpaid',
  transaction_ref text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fees TO authenticated;
GRANT ALL ON public.fees TO service_role;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fees read" ON public.fees FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage fees" ON public.fees FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.submit_fee_payment(_fee_id uuid, _ref text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.fees
  SET transaction_ref = _ref, status = 'pending_verification'
  WHERE id = _fee_id AND user_id = auth.uid() AND status <> 'paid';
  IF NOT FOUND THEN RAISE EXCEPTION 'Fee record not found'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_fee_payment(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_fee_payment(uuid, text) TO authenticated;

-- GALLERY (public)
CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  caption text,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery TO authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage gallery" ON public.gallery FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- JOBS (public)
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text,
  location text,
  job_type text,
  description text,
  apply_url text,
  deadline date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs public read" ON public.jobs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage jobs" ON public.jobs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- SEED public content
INSERT INTO public.jobs (title, company, location, job_type, description, apply_url, deadline) VALUES
('Executive, Microbiology (QC)', 'Beacon Pharmaceuticals PLC', 'Gazipur, Bangladesh', 'Full time', 'B.Sc/M.Sc in Microbiology. 1-3 years experience in sterility testing, bioburden, environmental monitoring and water analysis in a cGMP plant.', 'mailto:career@example.com', current_date + 30),
('Senior Officer, Microbiology', 'Square Pharmaceuticals PLC', 'Pabna, Bangladesh', 'Full time', 'Responsible for method validation, media growth promotion tests and microbial limit testing as per USP/BP.', 'mailto:career@example.com', current_date + 21),
('Assistant Manager, Sterility Assurance', 'Incepta Pharmaceuticals Ltd.', 'Savar, Dhaka', 'Full time', 'Lead aseptic process simulation, media fill, cleanroom qualification and contamination control strategy.', 'mailto:career@example.com', current_date + 45);

INSERT INTO public.gallery (title, caption, image_url) VALUES
('Iftar Mahfil 2026', 'Members gathered in Dhaka to celebrate the spirit of Ramadan.', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=70'),
('Annual Scientific Seminar', 'Panel discussion on contamination control strategy.', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=70'),
('Hands-on Workshop', 'Aseptic technique and media fill workshop for young microbiologists.', 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1200&q=70'),
('Laboratory Excellence Visit', 'Members touring a state-of-the-art QC microbiology laboratory.', 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=70'),
('Members Meet-up, Chattogram', 'Regional chapter networking session.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=70'),
('Certificate Distribution', 'Participants receiving training completion certificates.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=70');

INSERT INTO public.events (title, description, event_date, venue, registration_url) VALUES
('Annual Scientific Conference 2026', 'Full-day conference on data integrity in the microbiology laboratory, rapid microbiological methods and regulatory expectations.', now() + interval '40 days', 'Hotel Sarina, Banani, Dhaka', ''),
('Workshop: Environmental Monitoring Programme Design', 'Hands-on workshop covering risk-based sampling site selection, alert/action limits and trending.', now() + interval '12 days', 'BPMF Training Centre, Mirpur, Dhaka', ''),
('Webinar: Endotoxin Testing Beyond LAL', 'Recombinant Factor C, method transfer and compendial acceptance.', now() + interval '5 days', 'Online (Zoom)', '');

INSERT INTO public.training_logs (title, description, trainer, training_date, duration_hours, location) VALUES
('Sterility Testing as per USP <71>', 'Membrane filtration vs direct inoculation, positive control handling, invalid test investigation.', 'Dr. Md. Nazmul Hasan', current_date - 10, 4, 'BPMF Training Centre, Dhaka'),
('Cleanroom Behaviour & Gowning Qualification', 'Practical gowning qualification, personnel monitoring and cleanroom discipline.', 'Ms. Farhana Islam', current_date - 25, 3, 'Incepta Plant, Savar'),
('Microbial Identification Techniques', 'Biochemical, MALDI-TOF and 16S rRNA sequencing based identification workflows.', 'Mr. Al Shahreer', current_date - 45, 6, 'Online'),
('Water System Microbiology & Trending', 'PW/WFI sampling plans, biofilm control, sanitisation and data trending.', 'Engr. Tanvir Ahmed', current_date - 60, 5, 'Square Plant, Pabna');
