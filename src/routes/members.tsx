import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Lock, Search } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members Directory | BPMF" },
      {
        name: "description",
        content:
          "Browse the directory of approved BPMF members — pharmaceutical microbiologists across manufacturing sites in Bangladesh.",
      },
      { property: "og:title", content: "BPMF Members Directory" },
      {
        property: "og:description",
        content: "Approved members of the Bangladesh Pharma Microbiologists Foundation.",
      },
    ],
  }),
  component: Members,
});

function Members() {
  const { user, loading } = useAuth();
  const [q, setQ] = useState("");

  const members = useQuery({
    queryKey: ["members-directory"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,full_name,designation,department,organization,location,is_paid")
        .eq("status", "active")
        .order("full_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (members.data ?? []).filter((m) =>
    [m.full_name, m.organization, m.designation, m.department]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHero
        eyebrow="Community"
        title="List of Members"
        subtitle="Approved members of the foundation, working across quality control and quality assurance microbiology."
      />

      <section className="container-page py-14">
        {!user && !loading ? (
          <Card className="mx-auto max-w-xl border-primary/30 shadow-card">
            <CardContent className="pt-8 text-center">
              <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Lock className="size-5" />
              </span>
              <h2 className="mt-4 text-xl font-bold">Sign in to view the directory</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Member contact details are shared only within the foundation. Sign in with your
                member account, or apply for membership to join us.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/register">Apply for membership</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="relative max-w-sm">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, company or role"
                className="pl-9"
              />
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m) => (
                <Card key={m.id} className="shadow-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-bold">{m.full_name || "Member"}</p>
                        <p className="text-sm font-semibold text-primary">{m.designation}</p>
                      </div>
                      {m.is_paid && <Badge variant="secondary">Paid</Badge>}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {[m.department, m.organization, m.location].filter(Boolean).join(" · ")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {members.isSuccess && filtered.length === 0 && (
              <p className="mt-10 text-center text-sm text-muted-foreground">
                No approved members match your search yet.
              </p>
            )}
          </>
        )}
      </section>
    </>
  );
}
