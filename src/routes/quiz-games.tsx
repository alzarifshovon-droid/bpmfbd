import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Lock, RotateCcw, XCircle } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/quiz-games")({
  head: () => ({
    meta: [
      { title: "Quiz Games | Pharma Microbiology Challenge — BPMF" },
      {
        name: "description",
        content:
          "Test your pharmaceutical microbiology knowledge with the BPMF quiz game — one wrong answer ends the run until the team resets you.",
      },
      { property: "og:title", content: "BPMF Quiz Games" },
      {
        property: "og:description",
        content: "A sudden-death pharmaceutical microbiology quiz for practitioners and students.",
      },
    ],
  }),
  component: QuizGames,
});

type Question = {
  id: string;
  question: string;
  options: string[];
  answer_index: number;
  explanation: string | null;
};

function QuizGames() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questionsQuery = useQuery({
    queryKey: ["quiz-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("id,question,options,answer_index,explanation")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Question[];
    },
  });

  const lockQuery = useQuery({
    queryKey: ["quiz-lock", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_locks")
        .select("locked_at,wrong_count")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const lockMe = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase.rpc("lock_my_quiz", { _question_id: questionId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz-lock", user?.id] }),
  });

  const questions = questionsQuery.data ?? [];
  const current = questions[index];
  const progress = useMemo(
    () => (questions.length ? (index / questions.length) * 100 : 0),
    [index, questions.length],
  );

  function choose(i: number) {
    if (picked !== null || !current) return;
    setPicked(i);
    if (i === current.answer_index) {
      setScore((s) => s + 1);
    } else {
      lockMe.mutate(current.id);
    }
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

  const locked = !!lockQuery.data;
  const wrongNow = picked !== null && current && picked !== current.answer_index;

  return (
    <>
      <PageHero
        eyebrow="Learn & play"
        title="Quiz Games"
        subtitle="Sudden death: one wrong answer ends your run until a BPMF team member resets it for you."
      />

      <section className="container-page py-14">
        <Card className="mx-auto max-w-2xl shadow-lift">
          <CardContent className="pt-6">
            {loading || questionsQuery.isLoading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Loading quiz…</p>
            ) : !user ? (
              <div className="py-8 text-center">
                <Lock className="mx-auto size-10 text-primary" />
                <h2 className="mt-4 font-display text-xl font-bold">Sign in to play</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  The quiz tracks each player individually, so you need an account. One wrong answer
                  locks your attempt until the BPMF team resets it.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button asChild>
                    <Link to="/auth">Sign in</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/register">Create an account</Link>
                  </Button>
                </div>
              </div>
            ) : locked ? (
              <div className="py-8 text-center">
                <XCircle className="mx-auto size-10 text-destructive" />
                <h2 className="mt-4 font-display text-xl font-bold">Your quiz is locked</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  You answered a question incorrectly, so the run has ended. A BPMF team member has
                  to reset your quiz before you can play again — please contact the foundation.
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Locked on{" "}
                  {new Date(lockQuery.data!.locked_at).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <Button asChild className="mt-6" variant="outline">
                  <Link to="/contact">Contact the team</Link>
                </Button>
              </div>
            ) : questions.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No quiz questions have been published yet.
              </p>
            ) : finished ? (
              <div className="py-8 text-center">
                <h2 className="font-display text-3xl font-bold text-primary">
                  {score} / {questions.length}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  {score === questions.length
                    ? "Flawless — you clearly live in the QC lab."
                    : "Run complete."}
                </p>
                <Button className="mt-6" onClick={restart}>
                  <RotateCcw /> Play again
                </Button>
              </div>
            ) : (
              current && (
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
                      const isAnswer = i === current.answer_index;
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

                  {picked !== null && current.explanation && (
                    <div className="mt-5 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                      {current.explanation}
                    </div>
                  )}

                  {wrongNow ? (
                    <div className="mt-5 rounded-lg bg-destructive/10 p-4 text-center text-sm text-destructive">
                      Wrong answer — your quiz is now locked. Ask a BPMF team member to reset it.
                      <Button
                        className="mt-3 w-full"
                        variant="outline"
                        onClick={() => qc.invalidateQueries({ queryKey: ["quiz-lock", user.id] })}
                      >
                        Refresh status
                      </Button>
                    </div>
                  ) : (
                    <Button className="mt-6 w-full" disabled={picked === null} onClick={next}>
                      {index + 1 === questions.length ? "See my score" : "Next question"}
                    </Button>
                  )}
                </>
              )
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
