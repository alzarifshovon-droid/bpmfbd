import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarDays, CheckCircle2, Clock, Receipt, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Portal | BPMF" },
      {
        name: "description",
        content: "Your BPMF member portal — membership status, fees, training logs and events.",
      },
      { property: "og:title", content: "BPMF Member Portal" },
      { property: "og:description", content: "Membership status, fees, training logs and events." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { profile, isAdmin, isPaidMember, user } = useAuth();

  const fees = useQuery({
    queryKey: ["my-fees", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fees")
        .select("id,title,amount,status,due_date")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const outstanding = (fees.data ?? []).filter((f) => f.status !== "paid");

  const details: [string, string | null | undefined][] = [
    ["Employee code", profile?.employee_code],
    ["Email", profile?.email],
    ["Mobile no", profile?.mobile_no],
    ["Blood group", profile?.blood_group],
    ["Organisation", profile?.organization],
    ["Department", profile?.department],
    ["Designation", profile?.designation],
    ["Grade", profile?.grade],
    ["Line of business", profile?.line_of_business],
    ["Location", profile?.location],
    ["Reporting manager code", profile?.reporting_manager_code],
  ];

  return (
    <>
      <PageHero
        eyebrow="Member portal"
        title={`Welcome, ${profile?.full_name || "Member"}`}
        subtitle="Your membership summary, private sections and fee status."
      />

      <section className="container-page grid gap-6 py-12 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold">Membership profile</h2>
              <Badge variant={profile?.status === "active" ? "default" : "secondary"}>
                {profile?.status === "active" ? "Approved" : profile?.status ?? "pending"}
              </Badge>
              <Badge variant={isPaidMember ? "default" : "outline"}>
                {isPaidMember ? (
                  <>
                    <CheckCircle2 className="size-3.5" /> Paid member
                  </>
                ) : (
                  <>
                    <Clock className="size-3.5" /> Fee pending
                  </>
                )}
              </Badge>
              {isAdmin && (
                <Badge variant="secondary">
                  <ShieldCheck className="size-3.5" /> Administrator
                </Badge>
              )}
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {details.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs tracking-wide text-muted-foreground uppercase">{k}</dt>
                  <dd className="text-sm font-medium">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <h2 className="text-lg font-bold">Private sections</h2>
              <div className="mt-4 space-y-2">
                {[
                  { to: "/training-logs" as const, label: "Training logs", icon: BookOpen },
                  { to: "/events" as const, label: "Events", icon: CalendarDays },
                  { to: "/fees" as const, label: "Fees", icon: Receipt },
                ].map((s) => (
                  <Button key={s.to} asChild variant="outline" className="w-full justify-start">
                    <Link to={s.to}>
                      <s.icon /> {s.label}
                    </Link>
                  </Button>
                ))}
                {isAdmin && (
                  <Button asChild className="w-full justify-start">
                    <Link to="/admin">
                      <ShieldCheck /> Admin panel
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/25 shadow-card">
            <CardContent className="pt-6">
              <h2 className="text-lg font-bold">Fee status</h2>
              {outstanding.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No outstanding fees. Thank you for supporting the foundation.
                </p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {outstanding.map((f) => (
                    <li key={f.id} className="flex justify-between gap-3">
                      <span>{f.title}</span>
                      <span className="font-semibold text-primary">BDT {Number(f.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild size="sm" className="mt-4">
                <Link to="/fees">Open fees</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
