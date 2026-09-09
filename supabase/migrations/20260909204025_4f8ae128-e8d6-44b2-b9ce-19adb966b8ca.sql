CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE first_user boolean;
BEGIN
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO first_user;

  INSERT INTO public.profiles (
    id, full_name, email, employee_code, mobile_no, blood_group, organization,
    department, designation, grade, line_of_business, location, reporting_manager_code,
    date_of_birth, status, is_paid
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
    NULLIF(NEW.raw_user_meta_data->>'date_of_birth','')::date,
    CASE WHEN first_user THEN 'active'::public.membership_status ELSE 'pending'::public.membership_status END,
    first_user
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN first_user THEN 'admin'::public.app_role ELSE 'member'::public.app_role END)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;