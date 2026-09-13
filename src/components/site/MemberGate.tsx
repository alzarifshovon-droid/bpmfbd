import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

/**
 * Renders children only for paid, approved members (admins included).
 * Server-side RLS enforces the same rule — this is the UX layer.
 */
export function MemberGate({ children }: { children: ReactNode }) {
  const { loading, isPaidMember, profile } = useAuth();

  if (loading) {
    return (
      <div className="container-page py-20 text-center text-sm text-muted-foreground">Loading…</div>
    );
  }

  if (isPaidMember) return <>{children}</>;

  const pending = profile?.status === "pending";

  return (
    <section className="container-page py-16">
      <Card className="mx-auto max-w-xl border-primary/30 shadow-lift">
        <CardContent className="pt-8 text-center">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Lock className="size-5" />
          </span>
          <h2 className="mt-4 text-xl font-bold">Members-only section</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {pending
              ? "Your membership is registered but the annual fee is not verified yet. Submit your payment reference in the Fees tab and this section will open as soon as the treasurer confirms it."
              : "This section is reserved for paid members of the foundation."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/fees">Go to fees & payment</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
