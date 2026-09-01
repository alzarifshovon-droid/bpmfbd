import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/pathological-tests")({
  head: () => ({
    meta: [
      { title: "Pathological Test Information | BPMF" },
      {
        name: "description",
        content:
          "Reference guide to common pathological and microbiological laboratory tests — purpose, specimen, turnaround time and normal ranges.",
      },
      { property: "og:title", content: "Pathological Test Information" },
      {
        property: "og:description",
        content: "Purpose, specimen, turnaround and reference ranges for common lab tests.",
      },
    ],
  }),
  component: PathologicalTests,
});

type Test = {
  name: string;
  category: string;
  specimen: string;
  turnaround: string;
  purpose: string;
  reference: string;
  prep: string;
};

const tests: Test[] = [
  {
    name: "Complete Blood Count (CBC)",
    category: "Haematology",
    specimen: "3 mL whole blood (EDTA)",
    turnaround: "Same day, 2–4 hours",
    purpose: "Screens for anaemia, infection, inflammation and clotting disorders.",
    reference: "Hb 13–17 g/dL (M), 12–15 g/dL (F); WBC 4.0–11.0 ×10⁹/L; Platelets 150–450 ×10⁹/L",
    prep: "No fasting required.",
  },
  {
    name: "Blood Culture & Sensitivity",
    category: "Microbiology",
    specimen: "2 sets (aerobic + anaerobic bottles), 8–10 mL per bottle",
    turnaround: "Preliminary 24–48 hours, final 5 days",
    purpose: "Detects bacteraemia or septicaemia and guides targeted antibiotic therapy.",
    reference: "No growth after 5 days of incubation",
    prep: "Collect before the first antibiotic dose; strict aseptic skin antisepsis.",
  },
  {
    name: "Urine Routine & Culture",
    category: "Microbiology",
    specimen: "Midstream clean-catch urine, 10 mL sterile container",
    turnaround: "Routine 4 hours, culture 48 hours",
    purpose: "Diagnoses urinary tract infection and screens for renal disease.",
    reference: "Significant bacteriuria ≥ 10⁵ CFU/mL of a single uropathogen",
    prep: "First morning sample preferred; clean the genital area before collection.",
  },
  {
    name: "Fasting Blood Glucose",
    category: "Biochemistry",
    specimen: "2 mL plasma (sodium fluoride)",
    turnaround: "Same day, 2 hours",
    purpose: "Screens for and monitors diabetes mellitus.",
    reference: "Normal 3.9–5.5 mmol/L; Diabetes ≥ 7.0 mmol/L",
    prep: "8–12 hours fasting; water permitted.",
  },
  {
    name: "HbA1c (Glycated Haemoglobin)",
    category: "Biochemistry",
    specimen: "3 mL whole blood (EDTA)",
    turnaround: "Same day",
    purpose: "Reflects average glycaemic control over the previous 8–12 weeks.",
    reference: "Normal < 5.7 %; Prediabetes 5.7–6.4 %; Diabetes ≥ 6.5 %",
    prep: "No fasting required.",
  },
  {
    name: "Liver Function Test (LFT)",
    category: "Biochemistry",
    specimen: "4 mL serum (clot activator)",
    turnaround: "Same day",
    purpose: "Assesses hepatocellular injury, cholestasis and synthetic liver function.",
    reference: "ALT 7–56 U/L; AST 10–40 U/L; Total bilirubin 0.2–1.2 mg/dL; Albumin 3.5–5.0 g/dL",
    prep: "8 hours fasting preferred.",
  },
  {
    name: "Renal Function Test (RFT)",
    category: "Biochemistry",
    specimen: "4 mL serum",
    turnaround: "Same day",
    purpose: "Evaluates kidney filtration and electrolyte balance.",
    reference: "Creatinine 0.7–1.3 mg/dL (M), 0.6–1.1 mg/dL (F); Urea 15–40 mg/dL",
    prep: "No specific preparation; avoid heavy protein meals the previous night.",
  },
  {
    name: "Lipid Profile",
    category: "Biochemistry",
    specimen: "4 mL serum",
    turnaround: "Same day",
    purpose: "Assesses cardiovascular risk and monitors lipid-lowering therapy.",
    reference: "Total cholesterol < 200 mg/dL; LDL < 100 mg/dL; HDL > 40 mg/dL; TG < 150 mg/dL",
    prep: "9–12 hours fasting.",
  },
  {
    name: "Sputum for AFB / GeneXpert MTB-RIF",
    category: "Microbiology",
    specimen: "Early-morning sputum, 3–5 mL sterile container",
    turnaround: "AFB same day; GeneXpert 2–4 hours",
    purpose: "Detects Mycobacterium tuberculosis and rifampicin resistance.",
    reference: "No acid-fast bacilli seen / MTB not detected",
    prep: "Deep cough sample, not saliva; rinse mouth with water first.",
  },
  {
    name: "Stool Routine & Culture",
    category: "Microbiology",
    specimen: "Fresh stool, walnut-sized, sterile container",
    turnaround: "Routine 4 hours, culture 72 hours",
    purpose: "Identifies enteric pathogens, ova and parasites in diarrhoeal illness.",
    reference: "No enteric pathogen isolated; no ova or cyst seen",
    prep: "Collect before starting antibiotics; deliver within 2 hours.",
  },
  {
    name: "C-Reactive Protein (CRP)",
    category: "Immunology",
    specimen: "3 mL serum",
    turnaround: "Same day, 3 hours",
    purpose: "Marker of acute inflammation and response to antimicrobial therapy.",
    reference: "< 6 mg/L (normal); > 100 mg/L suggests bacterial infection",
    prep: "No preparation required.",
  },
  {
    name: "Thyroid Profile (TSH, FT3, FT4)",
    category: "Hormone",
    specimen: "4 mL serum",
    turnaround: "24 hours",
    purpose: "Diagnoses hypo- and hyperthyroidism and monitors replacement therapy.",
    reference: "TSH 0.4–4.0 mIU/L; FT4 0.8–1.8 ng/dL; FT3 2.3–4.2 pg/mL",
    prep: "Morning sample preferred; take thyroxine after the draw.",
  },
];

function PathologicalTests() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return tests;
    return tests.filter((t) =>
      [t.name, t.category, t.purpose, t.specimen].join(" ").toLowerCase().includes(needle),
    );
  }, [q]);

  return (
    <>
      <PageHero
        eyebrow="Reference"
        title="Pathological Test Information"
        subtitle="Purpose, specimen requirements, turnaround time and reference ranges for commonly ordered laboratory tests."
      />

      <section className="container-page py-14">
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search a test, specimen or category…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search pathological tests"
          />
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {filtered.map((t) => (
            <Card key={t.name} className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-bold">{t.name}</h2>
                  <Badge variant="secondary">{t.category}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{t.purpose}</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <Row label="Specimen" value={t.specimen} />
                  <Row label="Turnaround" value={t.turnaround} />
                  <Row label="Reference range" value={t.reference} />
                  <Row label="Preparation" value={t.prep} />
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-14 text-center text-sm text-muted-foreground">
            No test matched “{q}”.
          </p>
        )}

        <p className="mx-auto mt-12 max-w-3xl text-center text-xs text-muted-foreground">
          This information is provided for professional education only. Reference ranges vary between
          laboratories and analysers — always follow your own laboratory's validated ranges and a
          registered clinician's interpretation.
        </p>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2">
      <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
