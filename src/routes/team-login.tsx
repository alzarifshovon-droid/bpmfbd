import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/team-login")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Team Login | BPMF Management Console" },
      {
        name: "description",
        content:
          "Sign in as a BPMF team member to manage the hero image, gallery, quiz questions, members and events.",
      },
      { property: "og:title", content: "BPMF Team Login" },
      { property: "og:description", content: "Management console sign-in for the BPMF team." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeamLogin,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function TeamLogin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/team", replace: true });
  }, [loading, user, isAdmin, navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/team" });
  }

  return (
    <section className="container-page flex justify-center py-16">
      <Card className="w-full max-w-md shadow-lift">
        <CardContent className="pt-8">
          <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Team login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            For BPMF team members only. Manage the home page image, gallery, quiz questions,
            memberships, events and fees.
          </p>

          <form className="mt-6 space-y-4" onSubmit={signIn}>
            <div className="space-y-2">
              <Label htmlFor="team-email">Email</Label>
              <Input
                id="team-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-password">Password</Label>
              <Input
                id="team-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in to team console"}
            </Button>
          </form>

          {user && !isAdmin && !loading && (
            <p className="mt-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              This account is not a team account.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
