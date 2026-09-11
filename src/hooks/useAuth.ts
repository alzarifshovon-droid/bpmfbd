import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  employee_code: string | null;
  mobile_no: string | null;
  blood_group: string | null;
  organization: string | null;
  department: string | null;
  designation: string | null;
  grade: string | null;
  line_of_business: string | null;
  location: string | null;
  reporting_manager_code: string | null;
  photo_url: string | null;
  date_of_birth: string | null;
  certificate_no: string | null;
  certificate_issued_at: string | null;
  status: "pending" | "active" | "rejected";
  is_paid: boolean;
  created_at: string;
};

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (mounted) setSession(next);
    });
    supabase.auth.getSession().then(({ data: { session: current } }) => {
      if (!mounted) return;
      setSession(current);
      setLoading(false);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function useAuth() {
  const { session, user, loading } = useSession();
  const userId = user?.id;

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const rolesQuery = useQuery({
    queryKey: ["roles", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as string);
    },
  });

  const profile = profileQuery.data ?? null;
  const isAdmin = (rolesQuery.data ?? []).includes("admin");
  const isPaidMember = isAdmin || (profile?.status === "active" && profile.is_paid);

  return {
    session,
    user,
    loading: loading || (!!userId && (profileQuery.isLoading || rolesQuery.isLoading)),
    profile,
    isAdmin,
    isPaidMember,
    isApproved: isAdmin || profile?.status === "active",
    refetchProfile: profileQuery.refetch,
  };
}
