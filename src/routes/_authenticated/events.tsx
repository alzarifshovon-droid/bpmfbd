import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { MemberGate } from "@/components/site/MemberGate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/events")({
  head: () => ({
    meta: [
      { title: "Events | BPMF Members" },
      {
        name: "description",
        content:
          "Members-only calendar of BPMF conferences, workshops and webinars with venue and registration details.",
      },
      { property: "og:title", content: "BPMF Events" },
      { property: "og:description", content: "Members-only event calendar of the foundation." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Members only"
        title="Events"
        subtitle="Conferences, workshops and webinars organised by the foundation."
      />
      <MemberGate>
        <EventsList />
      </MemberGate>
    </>
  );
}

function EventsList() {
  const events = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <section className="container-page py-14">
      <div className="grid gap-5 md:grid-cols-2">
        {(events.data ?? []).map((e) => {
          const date = new Date(e.event_date);
          const upcoming = date.getTime() > Date.now();
          return (
            <Card key={e.id} className="shadow-card">
              {e.image_url && (
                <img
                  src={e.image_url}
                  alt={e.title}
                  loading="lazy"
                  className="h-44 w-full rounded-t-xl object-cover"
                />
              )}
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl font-bold">{e.title}</h2>
                  <Badge variant={upcoming ? "default" : "secondary"}>
                    {upcoming ? "Upcoming" : "Past"}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" />{" "}
                    {date.toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  {e.venue && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" /> {e.venue}
                    </span>
                  )}
                </div>
                {e.description && (
                  <p className="mt-4 text-sm text-muted-foreground">{e.description}</p>
                )}
                {e.registration_url && (
                  <Button asChild size="sm" className="mt-4">
                    <a href={e.registration_url} target="_blank" rel="noreferrer">
                      Register
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
        {events.isSuccess && (events.data ?? []).length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground md:col-span-2">
            No events scheduled yet.
          </p>
        )}
      </div>
    </section>
  );
}
