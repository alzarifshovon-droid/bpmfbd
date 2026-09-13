import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "About Us | Bangladesh Pharma Microbiologists Foundation" },
      {
        name: "description",
        content:
          "Our mission, vision, executive committee and history — the professional foundation of pharmaceutical microbiologists in Bangladesh, established 2024.",
      },
      { property: "og:title", content: "About BPMF" },
      {
        property: "og:description",
        content: "Mission, vision and leadership of the Bangladesh Pharma Microbiologists Foundation.",
      },
    ],
  }),
  component: About,
});

const committee = [
  { name: "Dr. Md. Nazmul Hasan", role: "President", org: "Square Pharmaceuticals PLC" },
  { name: "Mr. Al Shahreer", role: "General Secretary", org: "DBL Pharmaceuticals Ltd." },
  { name: "Ms. Farhana Islam", role: "Treasurer", org: "Incepta Pharmaceuticals Ltd." },
  { name: "Mr. Tanvir Ahmed", role: "Training Secretary", org: "Beacon Pharmaceuticals PLC" },
  { name: "Ms. Rubaiya Karim", role: "Organising Secretary", org: "Renata PLC" },
  { name: "Mr. Sabbir Rahman", role: "Publication Secretary", org: "ACI Pharmaceuticals" },
];

const milestones = [
  { year: "2024", text: "Foundation formed in Dhaka by 42 practising QC microbiologists." },
  { year: "2025", text: "First annual scientific conference and launch of structured training logs." },
  { year: "2026", text: "Crossed 480 registered members with regional chapters in Chattogram and Khulna." },
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="Who we are"
        title="About the Foundation"
        subtitle="A non-profit professional body dedicated to raising the standard of pharmaceutical microbiology practice in Bangladesh."
      />

      <section className="container-page grid gap-8 py-16 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-primary">Our mission</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              To build a knowledge-sharing community where every pharmaceutical microbiologist has
              access to current compendial practice, practical training and peer support — so that
              medicines manufactured in Bangladesh meet the highest microbiological quality
              standards.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-primary">Our vision</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              A nationally recognised centre of excellence for sterility assurance and contamination
              control, contributing to global regulatory confidence in Bangladeshi pharmaceutical
              exports.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-primary">What we do</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>· Monthly technical sessions and hands-on workshops</li>
              <li>· Annual scientific conference and poster presentations</li>
              <li>· Curated job corner for members and partner companies</li>
              <li>· Mentorship for young microbiologists entering the industry</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="bg-primary-soft/60 py-16">
        <div className="container-page">
          <h2 className="section-title">
            Executive <span className="text-primary">committee</span>
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {committee.map((m) => (
              <Card key={m.name} className="shadow-card">
                <CardContent className="pt-6">
                  <p className="font-display text-lg font-bold">{m.name}</p>
                  <p className="text-sm font-semibold text-primary">{m.role}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{m.org}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="section-title">
          Our <span className="text-primary">journey</span>
        </h2>
        <ol className="mt-8 space-y-6 border-l-2 border-primary/30 pl-6">
          {milestones.map((m) => (
            <li key={m.year} className="relative">
              <span className="absolute -left-[1.95rem] mt-1 size-4 rounded-full bg-primary" />
              <p className="font-display text-lg font-bold">{m.year}</p>
              <p className="text-sm text-muted-foreground">{m.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
