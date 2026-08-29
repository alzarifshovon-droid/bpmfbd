import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contacts | BPMF" },
      {
        name: "description",
        content:
          "Get in touch with the Bangladesh Pharma Microbiologists Foundation — office address, phone, email and enquiry form.",
      },
      { property: "og:title", content: "Contact BPMF" },
      {
        property: "og:description",
        content: "Office address, phone, email and enquiry form for the foundation.",
      },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  subject: z.string().trim().min(3, "Add a short subject").max(150),
  message: z.string().trim().min(10, "Tell us a little more").max(1500),
});

function Contact() {
  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    const { name, email, subject, message } = parsed.data;
    window.location.href = `mailto:info@bpmf.org.bd?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(`${message}\n\n— ${name} (${email})`)}`;
    toast.success("Opening your email client…");
  }

  return (
    <>
      <PageHero
        eyebrow="Say hello"
        title="Contacts"
        subtitle="Questions about membership, training or partnership? We would love to hear from you."
      />
      <section className="container-page grid gap-8 py-14 lg:grid-cols-3">
        <div className="space-y-4">
          {[
            { icon: MapPin, t: "Office", d: "House 12, Road 7, Mirpur DOHS, Dhaka 1216" },
            { icon: Phone, t: "Phone", d: "+880 1713 656580" },
            { icon: Mail, t: "Email", d: "info@bpmf.org.bd" },
          ].map((c) => (
            <Card key={c.t} className="shadow-card">
              <CardContent className="flex gap-4 pt-6">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <c.icon className="size-5" />
                </span>
                <div>
                  <p className="font-bold">{c.t}</p>
                  <p className="text-sm text-muted-foreground">{c.d}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card lg:col-span-2">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold">Send an enquiry</h2>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  maxLength={100}
                  value={values.name}
                  onChange={(e) => setValues({ ...values, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  maxLength={255}
                  value={values.email}
                  onChange={(e) => setValues({ ...values, email: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  maxLength={150}
                  value={values.subject}
                  onChange={(e) => setValues({ ...values, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={5}
                  maxLength={1500}
                  value={values.message}
                  onChange={(e) => setValues({ ...values, message: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Send message</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
