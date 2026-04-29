import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Breadcrumb, SectionTitle } from "@/components/site/SiteLayout";
import { useBlockMap } from "@/lib/content";
import { Cookie, Sparkles, Heart, Quote, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Donutoo — The Original Messy Donuts Story" },
      { name: "description", content: "Discover how Donutoo started: freshly baked, healthier donuts crafted with love. Read our story." },
      { property: "og:title", content: "About Donutoo — Our Story" },
      { property: "og:description", content: "From a sweet idea to a beloved brand — the Donutoo journey." },
    ],
  }),
});

function AboutPage() {
  const { map } = useBlockMap("about");
  const intro = map.intro;
  const valueIcons = [Cookie, Sparkles, Heart];
  const valueColors = ["bg-pink", "bg-mint", "bg-honey"];
  const values = ["value_quality", "value_baked", "value_fresh"].map((k) => map[k]).filter(Boolean);

  const { data: testimonials = [] } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await supabase.from("testimonials").select("*").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <Breadcrumb title="About Us" subtitle="our story" />

      {intro && (
        <section className="bg-cream py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[3rem] bg-mint opacity-30 blur-2xl" />
              <img src={intro.image_url} alt={intro.heading} className="relative w-full rounded-[2.5rem] object-cover shadow-soft" />
            </div>
            <div>
              <p className="font-script text-2xl text-pink">{intro.heading}</p>
              <h2 className="mt-1 font-display text-4xl font-black sm:text-5xl">{intro.subheading}</h2>
              <div className="mt-6 whitespace-pre-line text-muted-foreground">{intro.body}</div>
            </div>
          </div>
        </section>
      )}

      {values.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <SectionTitle kicker="our values" title="Why Donutoo" />
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {values.map((v: any, idx) => {
                const Icon = valueIcons[idx % valueIcons.length];
                return (
                  <div key={v.id} className="rounded-3xl bg-cream p-8 text-center shadow-soft">
                    <div className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${valueColors[idx % valueColors.length]} text-white`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-black">{v.heading}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="bg-cream-deep py-20">
          <div className="mx-auto max-w-7xl px-6">
            <SectionTitle kicker="kind words" title="Loved by Customers" />
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t: any) => (
                <div key={t.id} className="relative rounded-3xl bg-white p-7 shadow-soft">
                  <Quote className="absolute -top-3 left-6 h-8 w-8 rounded-full bg-pink p-1.5 text-white" />
                  <div className="mb-3 flex gap-0.5 text-honey">
                    {Array.from({ length: t.rating ?? 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-sm text-foreground/80">"{t.quote}"</p>
                  <div className="mt-4 font-display font-bold">{t.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
