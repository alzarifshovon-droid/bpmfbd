import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/quiz-games")({
  head: () => ({
    meta: [
      { title: "Quiz Games | Pharma Microbiology Challenge — BPMF" },
      {
        name: "description",
        content:
          "Test your pharmaceutical microbiology knowledge with the BPMF quiz game — sterility testing, endotoxin limits, environmental monitoring and more.",
      },
      { property: "og:title", content: "BPMF Quiz Games" },
      {
        property: "og:description",
        content: "A quick pharmaceutical microbiology quiz for practitioners and students.",
      },
    ],
  }),
  component: QuizGames,
});

type Question = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const questions: Question[] = [
  {
    question: "Which incubation condition is used for the Total Aerobic Microbial Count (TAMC) per USP <61>?",
    options: ["20–25 °C for 5–7 days", "30–35 °C for 3–5 days", "42–45 °C for 24 hours", "55 °C for 48 hours"],
    answer: 1,
    explanation:
      "TAMC uses Soybean-Casein Digest Agar incubated at 30–35 °C for 3 to 5 days; TYMC uses Sabouraud Dextrose Agar at 20–25 °C for 5 to 7 days.",
  },
  {
    question: "What is the endotoxin limit formula for a parenteral drug (non-intrathecal)?",
    options: ["K/M where K = 5 EU/kg/hr", "K/M where K = 0.2 EU/kg", "M/K where K = 350 EU", "K × M where K = 1 EU/mL"],
    answer: 0,
    explanation:
      "Endotoxin limit = K/M, with K = 5.0 EU/kg per hour for parenteral routes and M the maximum human dose per kilogram per hour.",
  },
  {
    question: "In EU GMP Annex 1, what is the maximum permitted viable settle-plate count for Grade A in four hours?",
    options: ["10 CFU", "5 CFU", "1 CFU", "No detectable growth (< 1 CFU)"],
    answer: 3,
    explanation:
      "Grade A requires no growth to be detected; any recovery is treated as an excursion requiring investigation.",
  },
  {
    question: "Which organism is the compendial challenge for the antimicrobial effectiveness of an aqueous multi-dose product?",
    options: ["Bacillus subtilis", "Pseudomonas aeruginosa", "Clostridium sporogenes", "Geobacillus stearothermophilus"],
    answer: 1,
    explanation:
      "USP <51> uses P. aeruginosa, S. aureus, E. coli, C. albicans and A. brasiliensis as the standard preservative challenge panel.",
  },
  {
    question: "Which biological indicator is used to validate moist-heat (steam) sterilisation?",
    options: [
      "Bacillus atrophaeus",
      "Geobacillus stearothermophilus",
      "Aspergillus brasiliensis",
      "Candida albicans",
    ],
    answer: 1,
    explanation:
      "G. stearothermophilus spores are the standard BI for steam at 121 °C; B. atrophaeus is used for dry heat and ethylene oxide.",
  },
  {
    question: "What is the standard F0 value targeted for terminal moist-heat sterilisation?",
    options: ["1 minute", "4 minutes", "8 minutes", "15 minutes"],
    answer: 3,
    explanation:
      "An F0 of at least 15 minutes at a reference temperature of 121 °C with z = 10 °C is the conventional target for terminal sterilisation.",
  },
  {
    question: "In water system monitoring, what is the action limit for Purified Water total viable count?",
    options: ["10 CFU/mL", "100 CFU/mL", "500 CFU/mL", "1000 CFU/mL"],
    answer: 1,
    explanation:
      "Purified Water carries an action level of 100 CFU/mL; Water for Injection is far tighter at 10 CFU/100 mL.",
  },
  {
    question: "Which method is preferred for sterility testing of a filterable antibiotic solution?",
    options: ["Direct inoculation", "Membrane filtration", "Spread plate", "Most probable number"],
    answer: 1,
    explanation:
      "Membrane filtration is preferred because rinsing removes the inhibitory antimicrobial before the membrane is incubated in media.",
  },
];

function QuizGames() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index]!;
  const progress = useMemo(() => (index / questions.length) * 100, [index]);

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === current.answer) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  }

  return (
    <>
      <PageHero
        eyebrow="Learn & play"
        title="Quiz Games"
        subtitle="A rapid-fire pharmaceutical microbiology challenge — sterility, endotoxin, cleanroom and water systems."
      />

      <section className="container-page py-14">
        <Card className="mx-auto max-w-2xl shadow-lift">
          <CardContent className="pt-6">
            {finished ? (
              <div className="py-8 text-center">
                <h2 className="font-display text-3xl font-bold text-primary">
                  {score} / {questions.length}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  {score === questions.length
                    ? "Flawless — you clearly live in the QC lab."
                    : score >= questions.length / 2
                      ? "Solid work. Review the explanations and go again."
                      : "Worth a revisit of USP <61>, <71> and Annex 1."}
                </p>
                <Button className="mt-6" onClick={restart}>
                  <RotateCcw /> Play again
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <span>
                    Question {index + 1} of {questions.length}
                  </span>
                  <Badge variant="secondary">Score {score}</Badge>
                </div>
                <Progress value={progress} className="mt-3" />

                <h2 className="mt-6 font-display text-xl font-bold">{current.question}</h2>

                <div className="mt-5 space-y-3">
                  {current.options.map((opt, i) => {
                    const isAnswer = i === current.answer;
                    const state =
                      picked === null
                        ? "idle"
                        : isAnswer
                          ? "correct"
                          : picked === i
                            ? "wrong"
                            : "idle";
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => choose(i)}
                        className={[
                          "flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left text-sm transition-colors",
                          state === "correct"
                            ? "border-success bg-success/10"
                            : state === "wrong"
                              ? "border-destructive bg-destructive/10"
                              : "hover:border-primary hover:bg-primary-soft",
                        ].join(" ")}
                      >
                        <span>{opt}</span>
                        {state === "correct" && <CheckCircle2 className="size-4 text-success" />}
                        {state === "wrong" && <XCircle className="size-4 text-destructive" />}
                      </button>
                    );
                  })}
                </div>

                {picked !== null && (
                  <div className="mt-5 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                    {current.explanation}
                  </div>
                )}

                <Button className="mt-6 w-full" disabled={picked === null} onClick={next}>
                  {index + 1 === questions.length ? "See my score" : "Next question"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
