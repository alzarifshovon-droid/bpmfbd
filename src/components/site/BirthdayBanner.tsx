import { useQuery } from "@tanstack/react-query";
import { Cake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Birthday = { full_name: string; organization: string | null; designation: string | null };

export function BirthdayBanner() {
  const { data } = useQuery({
    queryKey: ["todays-birthdays"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("todays_birthdays");
      if (error) throw error;
      return (data ?? []) as Birthday[];
    },
  });

  if (!data || data.length === 0) return null;

  return (
    <aside className="gradient-brand text-primary-foreground">
      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-1 py-3 text-sm">
        <Cake className="size-5 shrink-0" />
        <strong className="font-display">Happy birthday today!</strong>
        <span className="text-primary-foreground/90">
          {data
            .map((b) =>
              [b.full_name, b.designation, b.organization].filter(Boolean).join(", "),
            )
            .join(" · ")}
        </span>
      </div>
    </aside>
  );
}
