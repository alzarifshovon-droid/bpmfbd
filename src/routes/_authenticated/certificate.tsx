import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Clock, Printer } from "lucide-react";
import logoAsset from "@/assets/bpmf-logo-new.png.asset.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/certificate")({
  head: () => ({
    meta: [
      { title: "Membership Certificate | BPMF" },
      {
        name: "description",
        content: "Your BPMF membership certificate, issued once your application is approved.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CertificatePage,
});

function CertificatePage() {
  const { profile, isApproved, loading } = useAuth();

  if (loading) {
    return (
      <div className="container-page py-20 text-center text-sm text-muted-foreground">Loading…</div>
    );
  }

  if (!isApproved || !profile?.certificate_no) {
    return (
      <section className="container-page py-20">
        <Card className="mx-auto max-w-xl shadow-lift">
          <CardContent className="pt-8 text-center">
            <Clock className="mx-auto size-12 text-primary" />
            <h1 className="mt-4 font-display text-xl font-bold">Certificate not issued yet</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your membership certificate is created automatically the moment the team approves your
              application. Please check back shortly.
            </p>
            <Button asChild className="mt-6" variant="outline">
              <Link to="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const issued = profile.certificate_issued_at
    ? new Date(profile.certificate_issued_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <section className="container-page py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <h1 className="font-display text-2xl font-bold">Your membership certificate</h1>
            <p className="text-sm text-muted-foreground">
              Certificate no. {profile.certificate_no} · issued {issued}
            </p>
          </div>
          <Button onClick={() => window.print()}>
            <Printer /> Print / save as PDF
          </Button>
        </div>

        <article className="mt-8 rounded-2xl border-4 border-primary/70 bg-card p-8 text-center shadow-lift sm:p-14">
          <img
            src={logoAsset.url}
            alt="BPMF emblem"
            width={96}
            height={96}
            className="mx-auto h-20 w-20"
          />
          <p className="mt-5 text-xs font-bold tracking-[0.3em] text-primary uppercase">
            Bangladesh Pharma Microbiologists Foundation
          </p>
          <h2 className="mt-6 font-display text-3xl font-extrabold sm:text-4xl">
            Certificate of Membership
          </h2>
          <p className="mt-6 text-sm text-muted-foreground">This certifies that</p>
          <p className="mt-2 font-display text-2xl font-bold text-primary sm:text-3xl">
            {profile.full_name}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            {[profile.designation, profile.organization].filter(Boolean).join(", ") ||
              "Pharmaceutical microbiology professional"}{" "}
            is an approved member of the Bangladesh Pharma Microbiologists Foundation, and is
            entitled to all member privileges including training programmes, scientific events and
            the professional directory.
          </p>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-6 text-left text-xs">
            <div>
              <p className="border-t pt-2 font-semibold">Certificate no.</p>
              <p className="text-muted-foreground">{profile.certificate_no}</p>
            </div>
            <Award className="size-10 text-primary" />
            <div>
              <p className="border-t pt-2 font-semibold">Date of issue</p>
              <p className="text-muted-foreground">{issued}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
