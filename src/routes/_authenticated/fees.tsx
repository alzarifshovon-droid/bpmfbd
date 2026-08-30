import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHero } from "@/components/site/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/fees")({
  head: () => ({
    meta: [
      { title: "Membership Fees | BPMF Members" },
      {
        name: "description",
        content:
          "View your BPMF membership fee ledger and submit your bKash or bank transaction reference for verification.",
      },
      { property: "og:title", content: "BPMF Membership Fees" },
      { property: "og:description", content: "Your fee ledger and payment submission." },
    ],
  }),
  component: FeesPage,
});

const refSchema = z
  .string()
  .trim()
  .min(4, "Enter the transaction reference")
  .max(60, "Reference is too long");

const statusLabel: Record<string, string> = {
  unpaid: "Unpaid",
  pending_verification: "Awaiting verification",
  paid: "Paid",
};

function FeesPage() {
  const qc = useQueryClient();
  const [refs, setRefs] = useState<Record<string, string>>({});

  const fees = useQuery({
    queryKey: ["my-fees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fees")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async ({ id, ref }: { id: string; ref: string }) => {
      const { error } = await supabase.rpc("submit_fee_payment", { _fee_id: id, _ref: ref });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment reference submitted for verification");
      qc.invalidateQueries({ queryKey: ["my-fees"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHero
        eyebrow="Members only"
        title="Membership Fees"
        subtitle="Pay your annual fee and submit the transaction reference for verification."
      />
      <section className="container-page grid gap-8 py-14 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {(fees.data ?? []).map((f) => (
            <Card key={f.id} className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold">{f.title}</h2>
                    <p className="text-xs text-muted-foreground">
                      {f.due_date ? `Due ${f.due_date}` : "No due date"}
                      {f.transaction_ref ? ` · Ref: ${f.transaction_ref}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xl font-bold text-primary">
                      BDT {Number(f.amount)}
                    </span>
                    <Badge
                      variant={
                        f.status === "paid"
                          ? "default"
                          : f.status === "pending_verification"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {statusLabel[f.status] ?? f.status}
                    </Badge>
                  </div>
                </div>

                {f.status !== "paid" && (
                  <form
                    className="mt-5 flex flex-wrap items-end gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const parsed = refSchema.safeParse(refs[f.id] ?? "");
                      if (!parsed.success) {
                        toast.error(parsed.error.issues[0]?.message ?? "Invalid reference");
                        return;
                      }
                      submit.mutate({ id: f.id, ref: parsed.data });
                    }}
                  >
                    <div className="min-w-56 flex-1 space-y-2">
                      <Label htmlFor={`ref-${f.id}`}>bKash / bank transaction reference</Label>
                      <Input
                        id={`ref-${f.id}`}
                        value={refs[f.id] ?? ""}
                        placeholder="e.g. TRX8J2K9QP"
                        onChange={(e) => setRefs((r) => ({ ...r, [f.id]: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" disabled={submit.isPending}>
                      Submit reference
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          ))}
          {fees.isSuccess && (fees.data ?? []).length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No fee records yet. The treasurer will raise your annual fee shortly.
            </p>
          )}
        </div>

        <Card className="h-fit border-primary/25 shadow-card">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold">Payment details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">bKash (Merchant)</dt>
                <dd className="font-semibold">01711 000 214</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Bank account</dt>
                <dd className="font-semibold">
                  Bangladesh Pharma Microbiologists Foundation
                  <br />
                  A/C 1501 2020 3040 500
                  <br />
                  BRAC Bank, Gulshan Branch, Dhaka
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Annual fee</dt>
                <dd className="font-semibold">BDT 2,000</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              After paying, submit the transaction reference here. The treasurer verifies payments
              within two working days, after which Training Logs and Events unlock.
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
