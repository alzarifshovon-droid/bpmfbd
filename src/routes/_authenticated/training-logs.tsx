import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, ExternalLink, MapPin, User } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { MemberGate } from "@/components/site/MemberGate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/training-logs")({
  head: () => ({
    meta: [
      { title: "Training Logs | BPMF Members" },
      {
        name: "description",
        content:
          "Members-only archive of BPMF training sessions with trainers, duration and downloadable resources.",
      },
      { property: "og:title", content: "BPMF Training Logs" },
      { property: "og:description", content: "Members-only training session archive." },
    ],
  }),
  component: TrainingLogsPage,
});

function TrainingLogsPage() {
  return (
    <>
      <PageHero
        eyebrow="Members only"
        title="Training Logs"
        subtitle="Every session run by the foundation, with trainer, duration and resources."
      />
      <MemberGate>
        <TrainingLogsList />
      </MemberGate>
    </>
  );
}

function TrainingLogsList() {
  const logs = useQuery({
    queryKey: ["training-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_logs")
        .select("*")
        .order("training_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <section className="container-page py-14">
      <div className="space-y-5">
        {(logs.data ?? []).map((l) => (
          <Card key={l.id} className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-wide text-primary uppercase">
                    {l.training_date}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold">{l.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {l.trainer && (
                      <span className="inline-flex items-center gap-1">
                        <User className="size-3.5" /> {l.trainer}
                      </span>
                    )}
                    {l.duration_hours && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" /> {Number(l.duration_hours)} hours
                      </span>
                    )}
                    {l.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" /> {l.location}
                      </span>
                    )}
                  </div>
                </div>
                {l.resource_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={l.resource_url} target="_blank" rel="noreferrer">
                      Resource <ExternalLink />
                    </a>
                  </Button>
                )}
              </div>
              {l.description && (
                <p className="mt-4 text-sm text-muted-foreground">{l.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
        {logs.isSuccess && (logs.data ?? []).length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No training logs published yet.
          </p>
        )}
      </div>
    </section>
  );
}
