import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/medicine-information")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Medicine Information | BPMF" },
      {
        name: "description",
        content:
          "Drug information reference for pharmacists and microbiologists — class, indications, adult dose, key cautions and storage for common medicines.",
      },
      { property: "og:title", content: "Medicine Information" },
      {
        property: "og:description",
        content: "Class, indications, dosing, cautions and storage for commonly dispensed medicines.",
      },
    ],
  }),
  component: MedicineInformation,
});

type Medicine = {
  name: string;
  brands: string;
  group: "Antibiotic" | "Antifungal" | "Antiviral" | "Analgesic" | "Cardiovascular" | "Gastro";
  className: string;
  indications: string;
  dose: string;
  cautions: string;
  storage: string;
};

const medicines: Medicine[] = [
  {
    name: "Amoxicillin + Clavulanic acid",
    brands: "Moxaclav, Fimoxyclav",
    group: "Antibiotic",
    className: "Beta-lactam + beta-lactamase inhibitor",
    indications: "Respiratory tract, ENT, urinary and skin infections caused by susceptible organisms.",
    dose: "625 mg orally every 8 hours, or 1 g every 12 hours for 5–7 days.",
    cautions: "Penicillin hypersensitivity, cholestatic jaundice, diarrhoea including C. difficile colitis.",
    storage: "Below 30 °C, dry place. Reconstituted suspension: refrigerate, discard after 7 days.",
  },
  {
    name: "Azithromycin",
    brands: "Azithrocin, Zimax",
    group: "Antibiotic",
    className: "Macrolide",
    indications: "Atypical pneumonia, pharyngitis, chlamydial and some enteric infections.",
    dose: "500 mg once daily for 3 days, or 500 mg day 1 then 250 mg days 2–5.",
    cautions: "QT prolongation, hepatic impairment, interaction with statins and warfarin.",
    storage: "Below 30 °C, protect from light and moisture.",
  },
  {
    name: "Ciprofloxacin",
    brands: "Ciprocin, Neofloxin",
    group: "Antibiotic",
    className: "Fluoroquinolone",
    indications: "Complicated urinary tract infection, typhoid fever, bone and joint infection.",
    dose: "500 mg orally every 12 hours for 7–14 days depending on the site.",
    cautions: "Tendinitis and tendon rupture, avoid in children and pregnancy, chelated by antacids and dairy.",
    storage: "Below 30 °C. Infusion: do not refrigerate.",
  },
  {
    name: "Meropenem",
    brands: "Meronem, Meropen",
    group: "Antibiotic",
    className: "Carbapenem",
    indications: "Severe nosocomial infection, febrile neutropenia, bacterial meningitis.",
    dose: "1 g IV every 8 hours; 2 g every 8 hours for meningitis.",
    cautions: "Reserve for resistant organisms per stewardship policy; reduces valproate levels; seizure risk.",
    storage: "Dry powder below 25 °C; use reconstituted solution within 3 hours at room temperature.",
  },
  {
    name: "Fluconazole",
    brands: "Flugal, Omastin",
    group: "Antifungal",
    className: "Triazole antifungal",
    indications: "Candidiasis (oral, oesophageal, vaginal) and cryptococcal meningitis.",
    dose: "150 mg single dose for vaginal candidiasis; 200–400 mg daily for systemic infection.",
    cautions: "Hepatotoxicity, QT prolongation, teratogenic in high doses, many CYP interactions.",
    storage: "Below 30 °C, protect from light.",
  },
  {
    name: "Acyclovir",
    brands: "Xovir, Virux",
    group: "Antiviral",
    className: "Nucleoside analogue",
    indications: "Herpes simplex, varicella zoster and herpes zoster infections.",
    dose: "400 mg five times daily for 5 days (HSV); 800 mg five times daily for zoster.",
    cautions: "Maintain hydration to avoid crystal nephropathy; dose reduce in renal impairment.",
    storage: "Below 30 °C, dry place.",
  },
  {
    name: "Paracetamol",
    brands: "Napa, Ace",
    group: "Analgesic",
    className: "Analgesic / antipyretic",
    indications: "Mild to moderate pain and fever.",
    dose: "500 mg–1 g every 4–6 hours; maximum 4 g in 24 hours for adults.",
    cautions: "Hepatotoxic in overdose; lower ceiling in chronic alcohol use and low body weight.",
    storage: "Below 30 °C, protect from moisture.",
  },
  {
    name: "Omeprazole",
    brands: "Seclo, Losectil",
    group: "Gastro",
    className: "Proton pump inhibitor",
    indications: "Peptic ulcer, GERD, H. pylori eradication regimens, NSAID ulcer prophylaxis.",
    dose: "20–40 mg once daily before breakfast for 4–8 weeks.",
    cautions: "Long-term use: hypomagnesaemia, B12 deficiency, fracture risk; reduces clopidogrel effect.",
    storage: "Below 30 °C, keep the blister sealed until use.",
  },
  {
    name: "Metformin",
    brands: "Comet, Bigmet",
    group: "Cardiovascular",
    className: "Biguanide antihyperglycaemic",
    indications: "First-line therapy for type 2 diabetes mellitus.",
    dose: "500 mg twice daily with meals, titrated to a maximum of 2 g daily.",
    cautions: "Lactic acidosis in renal impairment; withhold before contrast imaging; GI upset common.",
    storage: "Below 30 °C, dry place.",
  },
  {
    name: "Atorvastatin",
    brands: "Atova, Lipitor",
    group: "Cardiovascular",
    className: "HMG-CoA reductase inhibitor",
    indications: "Hyperlipidaemia and cardiovascular risk reduction.",
    dose: "10–80 mg once daily, taken in the evening.",
    cautions: "Myopathy and rhabdomyolysis, raised transaminases, avoid in pregnancy and grapefruit juice.",
    storage: "Below 30 °C, protect from light.",
  },
];

const groups = ["All", "Antibiotic", "Antifungal", "Antiviral", "Analgesic", "Cardiovascular", "Gastro"] as const;

function MedicineInformation() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<(typeof groups)[number]>("All");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return medicines.filter((m) => {
      if (group !== "All" && m.group !== group) return false;
      if (!needle) return true;
      return [m.name, m.brands, m.className, m.indications].join(" ").toLowerCase().includes(needle);
    });
  }, [q, group]);

  return (
    <>
      <PageHero
        eyebrow="Reference"
        title="Medicine Information"
        subtitle="Class, indications, adult dosing, key cautions and storage conditions for commonly dispensed medicines."
      />

      <section className="container-page py-14">
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search a generic name, brand or indication…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search medicines"
          />
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {groups.map((g) => (
            <Button
              key={g}
              size="sm"
              variant={group === g ? "default" : "outline"}
              onClick={() => setGroup(g)}
            >
              {g}
            </Button>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {filtered.map((m) => (
            <Card key={m.name} className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold">{m.name}</h2>
                    <p className="text-xs text-muted-foreground">Brands: {m.brands}</p>
                  </div>
                  <Badge variant="secondary">{m.group}</Badge>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <Row label="Class" value={m.className} />
                  <Row label="Indications" value={m.indications} />
                  <Row label="Adult dose" value={m.dose} />
                  <Row label="Cautions" value={m.cautions} />
                  <Row label="Storage" value={m.storage} />
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-14 text-center text-sm text-muted-foreground">No medicine matched your search.</p>
        )}

        <p className="mx-auto mt-12 max-w-3xl text-center text-xs text-muted-foreground">
          Educational reference for healthcare professionals. Doses shown are usual adult doses — always
          confirm against the current product insert and prescribe according to national guidelines.
        </p>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-2">
      <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
