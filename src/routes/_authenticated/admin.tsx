import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Trash2, Check } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel | BPMF" },
      { name: "description", content: "BPMF administration: members, fees, training logs, events, gallery and jobs." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="container-page py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <section className="container-page py-20">
        <Card className="mx-auto max-w-xl border-destructive/30 shadow-lift">
          <CardContent className="pt-8 text-center">
            <ShieldCheck className="mx-auto size-12 text-destructive" />
            <h1 className="mt-4 text-xl font-bold">Administrators only</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You do not have permission to view this page.
            </p>
            <Button asChild className="mt-6">
              <Link to="/dashboard">Back to my portal</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <>
      <PageHero eyebrow="Administration" title="Admin Panel" subtitle="Manage members, fees, training logs, events, gallery and job postings." />
      <section className="container-page py-10">
        <Tabs defaultValue="members">
          <TabsList className="flex-wrap">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="training">Training Logs</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>
          <TabsContent value="members">
            <MembersTab />
          </TabsContent>
          <TabsContent value="fees">
            <FeesTab />
          </TabsContent>
          <TabsContent value="training">
            <ContentTab
              table="training_logs"
              label="Training log"
              fields={[
                { name: "title", label: "Title", required: true },
                { name: "trainer", label: "Trainer" },
                { name: "training_date", label: "Date", type: "date", required: true },
                { name: "duration_hours", label: "Duration (hours)", type: "number" },
                { name: "location", label: "Location" },
                { name: "resource_url", label: "Resource URL" },
                { name: "description", label: "Description", textarea: true },
              ]}
            />
          </TabsContent>
          <TabsContent value="events">
            <ContentTab
              table="events"
              label="Event"
              fields={[
                { name: "title", label: "Title", required: true },
                { name: "event_date", label: "Date & time", type: "datetime-local", required: true },
                { name: "venue", label: "Venue" },
                { name: "image_url", label: "Image URL" },
                { name: "registration_url", label: "Registration URL" },
                { name: "description", label: "Description", textarea: true },
              ]}
            />
          </TabsContent>
          <TabsContent value="gallery">
            <ContentTab
              table="gallery"
              label="Gallery photo"
              fields={[
                { name: "title", label: "Title", required: true },
                { name: "image_url", label: "Image URL", required: true },
                { name: "caption", label: "Caption", textarea: true },
              ]}
            />
          </TabsContent>
          <TabsContent value="jobs">
            <ContentTab
              table="jobs"
              label="Job posting"
              fields={[
                { name: "title", label: "Job title", required: true },
                { name: "company", label: "Company" },
                { name: "location", label: "Location" },
                { name: "job_type", label: "Job type" },
                { name: "apply_url", label: "Apply URL" },
                { name: "deadline", label: "Deadline", type: "date" },
                { name: "description", label: "Description", textarea: true },
              ]}
            />
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}

/* ---------------------------------- Members --------------------------------- */

function MembersTab() {
  const qc = useQueryClient();
  const members = useQuery({
    queryKey: ["admin-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: { status?: "pending" | "active" | "rejected"; is_paid?: boolean };
    }) => {
      const { error } = await supabase.from("profiles").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Member updated");
      qc.invalidateQueries({ queryKey: ["admin-members"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className="shadow-card">
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Employee code</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(members.data ?? []).map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="font-medium">{m.full_name}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </TableCell>
                  <TableCell>{m.employee_code ?? "—"}</TableCell>
                  <TableCell className="max-w-48 truncate">{m.organization ?? "—"}</TableCell>
                  <TableCell>
                    <Select
                      value={m.status}
                      onValueChange={(v: "pending" | "active" | "rejected") =>
                        update.mutate({ id: m.id, patch: { status: v } })
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.is_paid ? "default" : "outline"}>
                      {m.is_paid ? "Paid" : "Unpaid"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={m.is_paid ? "outline" : "default"}
                      onClick={() => update.mutate({ id: m.id, patch: { is_paid: !m.is_paid } })}
                    >
                      {m.is_paid ? "Mark unpaid" : "Mark paid"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ----------------------------------- Fees ----------------------------------- */

function FeesTab() {
  const qc = useQueryClient();
  const [newUserId, setNewUserId] = useState("");
  const [newAmount, setNewAmount] = useState("2000");
  const [newTitle, setNewTitle] = useState("Annual membership fee 2026");

  const fees = useQuery({
    queryKey: ["admin-fees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fees")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const members = useQuery({
    queryKey: ["admin-members-lite"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,full_name,email")
        .order("full_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const verify = useMutation({
    mutationFn: async (fee: { id: string; user_id: string }) => {
      const { error: e1 } = await supabase
        .from("fees")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", fee.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase
        .from("profiles")
        .update({ is_paid: true, status: "active" })
        .eq("id", fee.user_id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      toast.success("Payment verified and member activated");
      qc.invalidateQueries({ queryKey: ["admin-fees"] });
      qc.invalidateQueries({ queryKey: ["admin-members"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createFee = useMutation({
    mutationFn: async () => {
      if (!newUserId) throw new Error("Pick a member");
      const amount = Number(newAmount);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");
      const { error } = await supabase
        .from("fees")
        .insert({ user_id: newUserId, title: newTitle.trim() || "Annual membership fee", amount });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Fee record created");
      qc.invalidateQueries({ queryKey: ["admin-fees"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="shadow-card lg:col-span-2">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(fees.data ?? []).map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.title}</TableCell>
                    <TableCell>BDT {Number(f.amount)}</TableCell>
                    <TableCell>{f.transaction_ref ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          f.status === "paid"
                            ? "default"
                            : f.status === "pending_verification"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {f.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {f.status !== "paid" && (
                        <Button
                          size="sm"
                          disabled={f.status !== "pending_verification"}
                          onClick={() => verify.mutate({ id: f.id, user_id: f.user_id })}
                        >
                          <Check /> Verify payment
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit shadow-card">
        <CardContent className="pt-6">
          <h2 className="text-lg font-bold">Raise a fee</h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              createFee.mutate();
            }}
          >
            <div className="space-y-2">
              <Label>Member</Label>
              <Select value={newUserId} onValueChange={setNewUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {(members.data ?? []).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name || m.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Amount (BDT)</Label>
              <Input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={createFee.isPending}>
              Create fee record
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------------------- Generic content tab --------------------------- */

type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "date" | "number" | "datetime-local";
  required?: boolean;
  textarea?: boolean;
};

function ContentTab({
  table,
  label,
  fields,
}: {
  table: "training_logs" | "events" | "gallery" | "jobs";
  label: string;
  fields: FieldDef[];
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  const rows = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Record<string, unknown>[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const record: Record<string, unknown> = {};
      for (const f of fields) {
        const raw = (form[f.name] ?? "").trim();
        if (f.required && !raw) throw new Error(`${f.label} is required`);
        if (!raw) continue;
        record[f.name] = f.type === "number" ? Number(raw) : raw;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from(table).insert(record as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${label} added`);
      setForm({});
      qc.invalidateQueries({ queryKey: ["admin", table] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${label} removed`);
      qc.invalidateQueries({ queryKey: ["admin", table] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="shadow-card lg:col-span-2">
        <CardContent className="pt-6">
          <h2 className="text-lg font-bold">Existing {label.toLowerCase()}s</h2>
          <ul className="mt-4 space-y-3">
            {(rows.data ?? []).map((r) => (
              <li
                key={String(r["id"])}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{String(r["title"] ?? "")}</p>
                  <p className="text-xs text-muted-foreground">
                    {String(r["created_at"] ?? "").slice(0, 10)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => remove.mutate(String(r["id"]))}
                  disabled={remove.isPending}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
            {rows.isSuccess && (rows.data ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Nothing here yet.</p>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card className="h-fit shadow-card">
        <CardContent className="pt-6">
          <h2 className="text-lg font-bold">Add {label.toLowerCase()}</h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            {fields.map((f) => (
              <div key={f.name} className="space-y-2">
                <Label>
                  {f.label}
                  {f.required && <span className="text-primary"> *</span>}
                </Label>
                {f.textarea ? (
                  <Textarea
                    value={form[f.name] ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  />
                ) : (
                  <Input
                    type={f.type ?? "text"}
                    value={form[f.name] ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  />
                )}
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={create.isPending}>
              Add {label.toLowerCase()}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
