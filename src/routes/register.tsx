import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Apply for Membership | BPMF" },
      {
        name: "description",
        content:
          "Register as a member of the Bangladesh Pharma Microbiologists Foundation — submit your employee, department and designation details to join.",
      },
      { property: "og:title", content: "Apply for BPMF Membership" },
      {
        property: "og:description",
        content: "Submit your professional details and join the foundation.",
      },
    ],
  }),
  component: Register,
});

const schema = z.object({
  full_name: z.string().trim().min(3, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  employee_code: z.string().trim().max(50).optional(),
  mobile_no: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{6,20}$/, "Enter a valid mobile number"),
  blood_group: z.string().trim().max(10).optional(),
  date_of_birth: z.string().trim().min(1, "Enter your date of birth"),
  organization: z.string().trim().min(2, "Enter your company name").max(150),
  department: z.string().trim().max(100).optional(),
  designation: z.string().trim().max(100).optional(),
  grade: z.string().trim().max(30).optional(),
  line_of_business: z.string().trim().max(100).optional(),
  location: z.string().trim().max(120).optional(),
  reporting_manager_code: z.string().trim().max(50).optional(),
});

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const emptyForm = {
  full_name: "",
  email: "",
  password: "",
  employee_code: "",
  mobile_no: "",
  blood_group: "",
  date_of_birth: "",
  organization: "",
  department: "",
  designation: "",
  grade: "",
  line_of_business: "",
  location: "",
  reporting_manager_code: "",
};

function Register() {
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  function set<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please review the form");
      return;
    }
    const { email, password, ...meta } = parsed.data;
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/`, data: meta },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      toast.success("Application submitted");
      navigate({ to: "/" });
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <>
        <PageHero eyebrow="Membership" title="Application received" />
        <section className="container-page flex justify-center py-16">
          <Card className="w-full max-w-xl shadow-lift">
            <CardContent className="pt-8 text-center">
              <CheckCircle2 className="mx-auto size-12 text-success" />
              <h2 className="mt-4 text-xl font-bold">Confirm your email to finish</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{form.email}</strong>. Click it, then sign in
                to your portal. Your membership stays <strong>pending</strong> until the annual fee
                of BDT 2,000 is paid and verified by the foundation — after that, Training Logs,
                Events and Fees unlock automatically.
              </p>
              <Button asChild className="mt-6">
                <Link to="/auth">Go to sign in</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Membership"
        title="Apply for Registered Membership"
        subtitle="Fill in your professional details exactly as they appear in your company HR portal."
      />
      <section className="container-page grid gap-8 py-14 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardContent className="pt-6">
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
              <Field label="Full name" required>
                <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
              </Field>
              <Field label="Employee code">
                <Input
                  value={form.employee_code}
                  placeholder="e.g. 15103910"
                  onChange={(e) => set("employee_code", e.target.value)}
                />
              </Field>
              <Field label="Email" required>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <Field label="Password" required>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                />
              </Field>
              <Field label="Mobile no" required>
                <Input
                  value={form.mobile_no}
                  placeholder="01XXXXXXXXX"
                  onChange={(e) => set("mobile_no", e.target.value)}
                />
              </Field>
              <Field label="Blood group">
                <Select
                  value={form.blood_group}
                  onValueChange={(v) => set("blood_group", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Date of birth" required>
                <Input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => set("date_of_birth", e.target.value)}
                />
              </Field>
              <Field label="Company / organisation" required>
                <Input
                  value={form.organization}
                  onChange={(e) => set("organization", e.target.value)}
                />
              </Field>
              <Field label="Department">
                <Input
                  value={form.department}
                  placeholder="Quality Operations"
                  onChange={(e) => set("department", e.target.value)}
                />
              </Field>
              <Field label="Designation">
                <Input
                  value={form.designation}
                  placeholder="Deputy Manager"
                  onChange={(e) => set("designation", e.target.value)}
                />
              </Field>
              <Field label="Grade">
                <Input
                  value={form.grade}
                  placeholder="M5"
                  onChange={(e) => set("grade", e.target.value)}
                />
              </Field>
              <Field label="Line of business">
                <Input
                  value={form.line_of_business}
                  placeholder="Pharma"
                  onChange={(e) => set("line_of_business", e.target.value)}
                />
              </Field>
              <Field label="Location">
                <Input
                  value={form.location}
                  placeholder="Pharma Plant"
                  onChange={(e) => set("location", e.target.value)}
                />
              </Field>
              <Field label="Reporting manager code">
                <Input
                  value={form.reporting_manager_code}
                  placeholder="e.g. 15109741"
                  onChange={(e) => set("reporting_manager_code", e.target.value)}
                />
              </Field>
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" disabled={busy}>
                  {busy ? "Submitting…" : "Submit application"}
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Already registered?{" "}
                  <Link to="/auth" className="font-semibold text-primary hover:underline">
                    Sign in here
                  </Link>
                  .
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit border-primary/25 shadow-card">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold">How membership works</h2>
            <ol className="mt-4 space-y-4 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">1. Register</strong> — submit this form and
                confirm your email address.
              </li>
              <li>
                <strong className="text-foreground">2. Pay the fee</strong> — BDT 2,000 per year. Your
                fee record appears in the Fees tab of your portal with our payment details; submit
                your bKash / bank transaction reference there.
              </li>
              <li>
                <strong className="text-foreground">3. Get unlocked</strong> — once the treasurer
                verifies your payment, the Training Logs, Events and Fees tabs open for you.
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-primary"> *</span>}
      </Label>
      {children}
    </div>
  );
}
