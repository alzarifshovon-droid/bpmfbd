import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CalendarDays,
  FlaskConical,
  Lock,
  Microscope,
  Users,
} from "lucide-react";
import heroLab from "@/assets/hero-lab.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bangladesh Pharma Microbiologists Foundation | BPMF" },
      {
        name: "description",
        content:
          "BPMF unites pharmaceutical microbiologists of Bangladesh through training logs, scientific events, a job corner and a members-only portal.",
      },
      { property: "og:title", content: "Bangladesh Pharma Microbiologists Foundation" },
      {
        property: "og:description",
        content:
          "Training, events, job corner and membership for pharmaceutical microbiologists of Bangladesh.",
      },
    ],
  }),
  component: Home,
});

const focusAreas = [
  {
    icon: FlaskConical,
    title: "Sterility assurance",
    body: "Aseptic process simulation, media fill design and contamination control strategy aligned to Annex 1.",
  },
  {
    icon: Microscope,
    title: "Rapid methods",
    body: "Adoption of rapid microbiological methods, recombinant Factor C and modern identification workflows.",
  },
  {
    icon: BookOpen,
    title: "Continuous training",
    body: "Structured training logs so every member can track competency development over the year.",
  },
  {
    icon: Briefcase,
    title: "Career growth",
    body: "Curated job corner with openings from leading pharmaceutical manufacturers of Bangladesh.",
  },
];

function Home() {
  const { isPaidMember } = useAuth();

  const settings = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key,value");
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const row of data ?? []) map[row.key] = row.value;
      return map;
    },
  });

  const heroImage = settings.data?.["hero_image_url"]?.trim() || heroLab;
  const heroTitle =
    settings.data?.["hero_title"]?.trim() || "Advancing pharmaceutical microbiology across Bangladesh";
  const heroSubtitle =
    settings.data?.["hero_subtitle"]?.trim() ||
    "BPMF is a professional foundation of quality-control and quality-assurance microbiologists. We share knowledge, run structured training programmes and open career doors for the next generation of sterility assurance professionals.";

  const gallery = useQuery({
    queryKey: ["gallery", "home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("id,title,image_url")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });

  const jobs = useQuery({
    queryKey: ["jobs", "home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id,title,company,location")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink">
        <img
          src={heroLab}
          alt="Microbiologists inspecting culture plates in a pharmaceutical QC laboratory"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="relative container-page py-20 sm:py-28">
          <p className="text-xs font-bold tracking-[0.25em] text-primary uppercase">
            Established 2024 · Dhaka, Bangladesh
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-extrabold text-ink-foreground sm:text-5xl">
            Advancing pharmaceutical microbiology across Bangladesh
          </h1>
          <p className="mt-5 max-w-2xl text-base text-ink-foreground/85">
            BPMF is a professional foundation of quality-control and quality-assurance
            microbiologists. We share knowledge, run structured training programmes and open career
            doors for the next generation of sterility assurance professionals.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/register">
                Apply for membership <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-ink-foreground/40 bg-transparent text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
            >
              <Link to="/about">Who we are</Link>
            </Button>
          </div>
          <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-6">
            {[
              { k: "480+", v: "Registered members" },
              { k: "36", v: "Training sessions" },
              { k: "22", v: "Partner companies" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-3xl font-bold text-primary">{s.k}</dt>
                <dd className="text-xs tracking-wide text-ink-foreground/75 uppercase">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="section-title">
          What we <span className="text-primary">focus on</span>
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {focusAreas.map((f) => (
            <Card key={f.title} className="shadow-card transition-shadow hover:shadow-lift">
              <CardContent className="pt-6">
                <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-primary-soft/60 py-16">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="section-title">
              The members-only <span className="text-primary">portal</span>
            </h2>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Paid members unlock private sections of the site: the full training log archive with
              downloadable resources, upcoming event registration and their personal fee ledger.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                { icon: BookOpen, t: "Training Logs", d: "Every session, trainer and resource." },
                { icon: CalendarDays, t: "Events", d: "Conferences, workshops and webinars." },
                { icon: Users, t: "Members directory", d: "Connect with peers across the industry." },
              ].map((i) => (
                <li key={i.t} className="flex gap-3">
                  <i.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span>
                    <strong>{i.t}</strong>{" "}
                    <span className="text-muted-foreground">— {i.d}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              {isPaidMember ? (
                <Button asChild size="lg">
                  <Link to="/training-logs">
                    Open training logs <ArrowRight />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link to="/register">Become a member</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/auth">I already have an account</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          <Card className="border-primary/25 shadow-lift">
            <CardContent className="space-y-4 pt-6">
              {["Training Logs", "Events", "Fees"].map((t) => (
                <div
                  key={t}
                  className="flex items-center justify-between rounded-lg border border-dashed border-primary/40 bg-background px-4 py-4"
                >
                  <span className="font-semibold">{t}</span>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-primary uppercase">
                    {isPaidMember ? "Unlocked" : "Members only"}{" "}
                    {!isPaidMember && <Lock className="size-4" />}
                  </span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Membership fee: BDT 2,000 per year. Access is enabled as soon as your payment is
                verified.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="section-title">
            Latest <span className="text-primary">job openings</span>
          </h2>
          <Button asChild variant="ghost">
            <Link to="/jobs">
              View job corner <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {(jobs.data ?? []).map((j) => (
            <Card key={j.id} className="shadow-card">
              <CardContent className="pt-6">
                <h3 className="font-bold">{j.title}</h3>
                <p className="mt-1 text-sm text-primary">{j.company}</p>
                <p className="mt-1 text-xs text-muted-foreground">{j.location}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="section-title">
            From our <span className="text-primary">gallery</span>
          </h2>
          <Button asChild variant="ghost">
            <Link to="/gallery">
              See all photos <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(gallery.data ?? []).map((g) => (
            <figure key={g.id} className="overflow-hidden rounded-xl shadow-card">
              <img
                src={g.image_url}
                alt={g.title}
                loading="lazy"
                className="h-56 w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <figcaption className="bg-card px-4 py-3 text-sm font-semibold">{g.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
