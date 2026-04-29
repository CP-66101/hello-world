import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Breadcrumb, SectionTitle } from "@/components/site/SiteLayout";
import { useBlockMap } from "@/lib/content";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, Send, TrendingUp, Award, Users, Globe } from "lucide-react";

export const Route = createFileRoute("/franchise")({
  component: FranchisePage,
  head: () => ({
    meta: [
      { title: "Franchise Donutoo — Own a Donut Shop" },
      { name: "description", content: "Become a Donutoo franchise partner. Apply today and join a fast-growing baked-donut brand." },
      { property: "og:title", content: "Franchise with Donutoo" },
      { property: "og:description", content: "Apply to become a Donutoo franchisee. Proven model, full support." },
    ],
  }),
});

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(5).max(40),
  country: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  investment_capacity: z.string().trim().max(80).optional(),
  message: z.string().trim().max(2000).optional(),
});

const benefits = [
  { icon: Award, title: "Proven Model", body: "A successful, well-tested business model with strong brand recognition." },
  { icon: Users, title: "Full Support", body: "Comprehensive training, operations, and marketing assistance." },
  { icon: TrendingUp, title: "Growing Brand", body: "Be part of one of the fastest-growing baked-donut brands." },
  { icon: Globe, title: "Global Vision", body: "Egypt, the Middle East, and beyond — limitless opportunity." },
];

function FranchisePage() {
  const { map } = useBlockMap("franchise");
  const intro = map.intro;
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", city: "", investment_capacity: "", message: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) { toast.error(r.error.issues[0].message); return; }
    setPending(true);
    const { error } = await supabase.from("franchise_submissions").insert(r.data);
    setPending(false);
    if (error) { toast.error("Could not send your application. Try again."); return; }
    setForm({ name: "", email: "", phone: "", country: "", city: "", investment_capacity: "", message: "" });
    toast.success("Application sent! We'll be in touch soon. 🎉");
  }

  return (
    <SiteLayout>
      <Breadcrumb title="Franchise" subtitle="join the family" />

      {intro && (
        <section className="bg-cream py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
            <div className="relative">
              <div className="absolute -inset-6 rounded-[3rem] bg-pink opacity-20 blur-3xl" />
              <img src={intro.image_url} alt={intro.heading} className="relative w-full rounded-[2.5rem] object-cover shadow-soft" />
            </div>
            <div>
              <p className="font-script text-2xl text-pink">{intro.heading}</p>
              <h2 className="mt-1 font-display text-4xl font-black sm:text-5xl">{intro.subheading}</h2>
              <div className="mt-6 whitespace-pre-line text-muted-foreground">{intro.body}</div>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {["Brand recognition", "Training & support", "Marketing assistance", "Operations playbook"].map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-5 w-5 text-mint" /> {p}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle kicker="why partner" title="What You Get" />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-3xl bg-cream p-7 shadow-soft">
                <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-pink text-white">
                  <b.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 font-display text-xl font-black">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream-deep py-20">
        <div className="mx-auto max-w-3xl px-6">
          <SectionTitle kicker="apply now" title="Franchisee Evaluation Form" />
          <form onSubmit={submit} className="mt-10 grid gap-4 rounded-3xl bg-white p-8 shadow-soft sm:grid-cols-2">
            <Field label="Full Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Field label="Phone *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
            <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
            <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="Investment Capacity" value={form.investment_capacity} onChange={(v) => setForm({ ...form, investment_capacity: v })} />
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tell us about yourself</label>
              <textarea
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5} maxLength={2000}
                className="mt-1 w-full rounded-2xl border border-input bg-cream px-4 py-3 text-sm outline-none focus:border-pink focus:ring-2 focus:ring-pink/30"
              />
            </div>
            <div className="sm:col-span-2">
              <button disabled={pending} className="inline-flex items-center gap-2 rounded-full gradient-pink px-7 py-3 text-sm font-bold text-white shadow-soft disabled:opacity-50">
                <Send className="h-4 w-4" /> {pending ? "Submitting…" : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type} required={required} value={value} maxLength={255}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-2xl border border-input bg-cream px-4 py-3 text-sm outline-none focus:border-pink focus:ring-2 focus:ring-pink/30"
      />
    </div>
  );
}
