import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Breadcrumb } from "@/components/site/SiteLayout";
import { useSiteSettings } from "@/lib/content";
import { Mail, MapPin, Phone, Send, Clock } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Donutoo — Get in Touch" },
      { name: "description", content: "Visit us in Heliopolis, Cairo or send us a message. We'd love to hear from you." },
      { property: "og:title", content: "Contact Donutoo" },
      { property: "og:description", content: "Find our branch, hours, and contact our team." },
    ],
  }),
});

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5, "Tell us a little more").max(2000),
});

function ContactPage() {
  const { data: settings } = useSiteSettings();
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) { toast.error(r.error.issues[0].message); return; }
    setPending(true);
    const { error } = await supabase.from("contact_submissions").insert(r.data);
    setPending(false);
    if (error) { toast.error("Could not send. Try again."); return; }
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    toast.success("Thanks! We'll get back to you soon. 🍩");
  }

  return (
    <SiteLayout>
      <Breadcrumb title="Contact Us" subtitle="say hello" />
      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-5">
          <aside className="lg:col-span-2">
            <div className="rounded-3xl bg-white p-8 shadow-soft">
              <h2 className="font-display text-2xl font-black">{settings?.contact_info_heading ?? "CONTACT INFO"}</h2>
              <ul className="mt-6 space-y-5 text-sm">
                {settings?.address_main && (
                  <li className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pink-soft text-pink"><MapPin className="h-4 w-4" /></span>
                    <div>
                      <div className="font-bold">Address</div>
                      <p className="text-muted-foreground">{settings.address_main}</p>
                    </div>
                  </li>
                )}
                {settings?.phone_primary && (
                  <li className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint-soft text-mint"><Phone className="h-4 w-4" /></span>
                    <div>
                      <div className="font-bold">Phone</div>
                      <a href={`tel:${settings.phone_primary.replace(/\s/g, "")}`} className="text-muted-foreground hover:text-pink">{settings.phone_primary}</a>
                    </div>
                  </li>
                )}
                {settings?.email && (
                  <li className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream-deep text-honey"><Mail className="h-4 w-4" /></span>
                    <div>
                      <div className="font-bold">Email</div>
                      <a href={`mailto:${settings.email}`} className="text-muted-foreground hover:text-pink">{settings.email}</a>
                    </div>
                  </li>
                )}
                {settings?.hours && (
                  <li className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pink-soft text-pink"><Clock className="h-4 w-4" /></span>
                    <div>
                      <div className="font-bold">Hours</div>
                      <p className="text-muted-foreground">{settings.hours}</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="rounded-3xl bg-white p-8 shadow-soft">
              <h2 className="font-display text-2xl font-black">{settings?.get_in_touch_heading ?? "GET IN TOUCH"}</h2>
              <p className="mt-2 text-sm text-muted-foreground">Have a question or feedback? Send us a note.</p>
              <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
                <Input label="Name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Input label="Email" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Input label="Subject" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} />
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required maxLength={2000} rows={5}
                    className="mt-1 w-full rounded-2xl border border-input bg-cream px-4 py-3 text-sm outline-none focus:border-pink focus:ring-2 focus:ring-pink/30"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button disabled={pending} className="inline-flex items-center gap-2 rounded-full gradient-pink px-7 py-3 text-sm font-bold text-white shadow-soft disabled:opacity-50">
                    <Send className="h-4 w-4" /> {pending ? "Sending…" : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {settings?.google_maps_embed && (
        <section className="bg-cream pb-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="overflow-hidden rounded-3xl shadow-soft" dangerouslySetInnerHTML={{ __html: settings.google_maps_embed }} />
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

function Input({ label, type = "text", required, value, onChange }: { label: string; type?: string; required?: boolean; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}{required && " *"}</label>
      <input
        type={type} required={required} value={value} maxLength={255}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-2xl border border-input bg-cream px-4 py-3 text-sm outline-none focus:border-pink focus:ring-2 focus:ring-pink/30"
      />
    </div>
  );
}
