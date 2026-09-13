import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Briefcase, CalendarClock, MapPin, Search } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type JobRow = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  job_type: string | null;
  description: string | null;
  deadline: string | null;
  apply_url: string | null;
  created_at: string;
};

export const Route = createFileRoute("/jobs")({
  loader: async () => {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    return { jobs: (data ?? []) as JobRow[] };
  },
  head: ({ loaderData }) => ({
    scripts: (loaderData?.jobs ?? []).slice(0, 20).map((j) => ({
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: j.title,
        description: j.description ?? j.title,
        datePosted: j.created_at,
        ...(j.deadline ? { validThrough: j.deadline } : {}),
        ...(j.job_type ? { employmentType: j.job_type } : {}),
        hiringOrganization: {
          "@type": "Organization",
          name: j.company ?? "Bangladesh Pharma Microbiologists Foundation",
        },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: j.location ?? "Dhaka",
            addressCountry: "BD",
          },
        },
        ...(j.apply_url ? { url: j.apply_url } : {}),
      }),
    })),
    meta: [
      { title: "Job Corner | BPMF" },
      {
        name: "description",
        content:
          "Microbiology jobs in the Bangladeshi pharmaceutical industry — QC, QA and sterility assurance openings shared by partner companies.",
      },
      { property: "og:title", content: "BPMF Job Corner" },
      {
        property: "og:description",
        content: "Latest pharmaceutical microbiology openings across Bangladesh.",
      },
    ],
  }),
  component: Jobs,
});

function Jobs() {
  const [q, setQ] = useState("");
  const jobs = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (jobs.data ?? []).filter((j) =>
    [j.title, j.company, j.location, j.job_type]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Job Corner"
        subtitle="Openings shared with the foundation by pharmaceutical manufacturers across Bangladesh."
      />
      <section className="container-page py-14">
        <div className="relative max-w-sm">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search openings"
            aria-label="Search job openings"
            className="pl-9"
          />
        </div>

        <div className="mt-8 space-y-5">
          {filtered.map((j) => (
            <Card key={j.id} className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-bold">{j.title}</h2>
                    <p className="mt-1 text-sm font-semibold text-primary">{j.company}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {j.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" /> {j.location}
                        </span>
                      )}
                      {j.job_type && (
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="size-3.5" /> {j.job_type}
                        </span>
                      )}
                      {j.deadline && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="size-3.5" /> Apply by {j.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                  {j.apply_url && (
                    <Button asChild>
                      <a href={j.apply_url} target="_blank" rel="noreferrer">
                        Apply now
                      </a>
                    </Button>
                  )}
                </div>
                {j.description && (
                  <p className="mt-4 text-sm text-muted-foreground">{j.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
          {jobs.isSuccess && filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No openings match your search right now.
            </p>
          )}
          {jobs.isSuccess && (jobs.data ?? []).length > 0 && (
            <Badge variant="secondary">{filtered.length} opening(s)</Badge>
          )}
        </div>
      </section>
    </>
  );
}
