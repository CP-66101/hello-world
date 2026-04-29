import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, SectionTitle } from "@/components/site/SiteLayout";
import { useBlockMap } from "@/lib/content";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Donutoo — Home of the Original Messy Donuts" },
      { name: "description", content: "Freshly baked donuts with 50+ toppings. Sweet, savory & vegan. Now in Egypt." },
      { property: "og:title", content: "Donutoo — Home of the Original Messy Donuts" },
      { property: "og:description", content: "Freshly baked, never fried. Sweet, savory and vegan donuts with 50+ toppings." },
    ],
  }),
});

function useSlider() {
  return useQuery({
    queryKey: ["slider"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slider").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useLatestPosts(limit = 3) {
  return useQuery({
    queryKey: ["blog_posts_latest", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts").select("*").eq("is_published", true).order("published_at", { ascending: false }).limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <Categories />
      <WhoWeAre />
      <Difference />
      <Franchise />
      <Testimonials />
      <LatestBlog />
      <CtaBanner />
    </SiteLayout>
  );
}

function Hero() {
  const { data: slides = [] } = useSlider();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);
  const slide = slides[i];

  return (
    <section className="relative overflow-hidden bg-cream pt-10 pb-20 sm:pt-16">
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-pink-soft opacity-60 blur-3xl" />
      <div className="absolute top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-mint-soft opacity-50 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-pink shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> Now in Egypt
          </div>
          <h1 className="mt-6 font-display text-5xl font-black leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {slide?.title ?? "Home of the Original"}{" "}
            <span className="relative inline-block text-pink">
              {slide?.subtitle ?? "Messy Donuts"}
              <svg className="absolute -bottom-2 left-0 h-3 w-full text-mint" viewBox="0 0 200 10" preserveAspectRatio="none">
                <path d="M0,8 Q50,0 100,5 T200,4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground text-balance">
            {slide?.description ?? "Freshly baked, never fried. 50+ toppings to customize your perfect bite."}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/menu" className="group inline-flex items-center gap-2 rounded-full gradient-pink px-7 py-3.5 text-base font-bold text-white shadow-soft transition-transform hover:scale-105">
              Explore Menu <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/about" className="inline-flex items-center gap-2 rounded-full border-2 border-foreground/20 bg-white px-7 py-3 text-base font-bold text-foreground hover:border-pink hover:text-pink">
              Our Story
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 text-xs">
            {[
              ["50+", "Toppings"],
              ["3", "Categories"],
              ["100%", "Baked"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-3xl font-black text-foreground">{n}</div>
                <div className="font-semibold uppercase tracking-widest text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="relative mx-auto aspect-square max-w-md">
            <div className="absolute inset-0 animate-spin-slow">
              <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full bg-pink" />
              <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-mint" />
              <div className="absolute left-1/2 bottom-0 h-4 w-4 -translate-x-1/2 rounded-full bg-honey" />
              <div className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-grape" />
            </div>
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-pink-soft via-cream to-mint-soft shadow-soft animate-float" />
            <img
              src={slide?.image_url ?? "/uploads/slider/2054190686.webp"}
              alt={slide?.title ?? "Donutoo"}
              className="relative z-10 h-full w-full object-contain p-6"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/site-img/donutsweet.png"; }}
            />
          </div>

          {slides.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`slide ${idx + 1}`}
                  onClick={() => setI(idx)}
                  className={`h-2 rounded-full transition-all ${idx === i ? "w-8 bg-pink" : "w-2 bg-pink/30"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const { map } = useBlockMap("home");
  const intro = map.intro;
  const cards = ["cat_sweet", "cat_savory", "cat_vegan"]
    .map((k) => map[k])
    .filter(Boolean);
  const colors = ["bg-pink", "bg-mint", "bg-honey"];
  const tints = ["bg-pink-soft", "bg-mint-soft", "bg-cream-deep"];

  return (
    <section className="relative bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle kicker="freshly baked" title={intro?.heading ?? "Customize Your Bite"} />
        {intro?.body && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">{intro.body}</p>
        )}

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, idx) => (
            <div key={c.id} className="group relative overflow-hidden rounded-3xl bg-cream p-1 shadow-soft transition-transform hover:-translate-y-2">
              <div className={`relative h-56 overflow-hidden rounded-3xl ${tints[idx]}`}>
                <img
                  src={c.image_url ?? "/site-img/donutsweet.png"}
                  alt={c.heading}
                  className="absolute inset-0 m-auto h-44 w-44 object-contain transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${colors[idx]}`} />
                  <h3 className="font-display text-2xl font-black text-foreground">{c.heading}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
                <Link to="/menu" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-pink hover:gap-2 transition-all">
                  Customize <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhoWeAre() {
  const { map } = useBlockMap("home");
  const b = map.who_we_are;
  if (!b) return null;
  return (
    <section className="relative overflow-hidden bg-cream-deep py-24">
      <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-pink-soft opacity-60 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <div className="relative">
          <div className="absolute -inset-6 rounded-[3rem] bg-mint opacity-30 blur-2xl" />
          <img src={b.image_url} alt="Donutoo team" className="relative w-full rounded-[2.5rem] object-cover shadow-soft" />
          <div className="absolute -bottom-6 -right-6 hidden rounded-2xl bg-pink p-5 text-white shadow-soft sm:block">
            <div className="font-display text-3xl font-black">2021</div>
            <div className="text-xs font-semibold uppercase tracking-widest">Est.</div>
          </div>
        </div>
        <div>
          <p className="font-script text-2xl text-pink">{b.heading}</p>
          <h2 className="mt-1 font-display text-4xl font-black sm:text-5xl">{b.subheading}</h2>
          <div className="mt-6 space-y-4 whitespace-pre-line text-muted-foreground">{b.body}</div>
          <Link to="/about" className="mt-8 inline-flex items-center gap-2 rounded-full gradient-pink px-6 py-3 text-sm font-bold text-white shadow-soft hover:scale-105 transition-transform">
            Read More <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Difference() {
  const { map } = useBlockMap("home");
  const b = map.difference;
  if (!b) return null;
  return (
    <section className="relative overflow-hidden bg-mint py-24">
      <div className="absolute inset-0 sprinkles-bg opacity-30" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <div>
          <p className="font-script text-2xl text-foreground/70">what makes us</p>
          <h2 className="mt-1 font-display text-4xl font-black sm:text-5xl">{b.heading}</h2>
          <div className="mt-6 whitespace-pre-line text-foreground/80">{b.body}</div>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-bold text-cream hover:bg-cocoa transition-colors">
            Inquire More <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative">
          <img src={b.image_url} alt="Different" className="w-full rounded-[2.5rem] object-cover shadow-soft" />
        </div>
      </div>
    </section>
  );
}

function Franchise() {
  const { map } = useBlockMap("home");
  const b = map.franchise;
  if (!b) return null;
  return (
    <section className="relative overflow-hidden bg-grape py-24 text-white">
      <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-pink opacity-40 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <div className="relative order-2 lg:order-1">
          <img src={b.image_url} alt="Franchise" className="w-full rounded-[2.5rem] object-cover shadow-soft" />
        </div>
        <div className="order-1 lg:order-2">
          <p className="font-script text-2xl text-pink-soft">join the family</p>
          <h2 className="mt-1 font-display text-4xl font-black sm:text-5xl">{b.heading}</h2>
          <div className="mt-6 whitespace-pre-line text-white/80">{b.body}</div>
          <Link to="/franchise" className="mt-8 inline-flex items-center gap-2 rounded-full bg-pink px-6 py-3 text-sm font-bold text-white hover:bg-pink/90 transition-colors">
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { data: list = [] } = useTestimonials();
  if (list.length === 0) return null;
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle kicker="happy customers" title="What Our Clients Say" />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 6).map((t: any) => (
            <div key={t.id} className="relative rounded-3xl bg-white p-7 shadow-soft">
              <Quote className="absolute -top-3 left-6 h-8 w-8 rounded-full bg-pink p-1.5 text-white" />
              <div className="mb-4 flex gap-0.5 text-honey">
                {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                {t.image_url ? (
                  <img src={t.image_url} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-pink-soft font-display text-lg font-black text-pink">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-display text-base font-bold">{t.name}</div>
                  {t.role && <div className="text-xs text-muted-foreground">{t.role}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestBlog() {
  const { data: posts = [] } = useLatestPosts(3);
  if (posts.length === 0) return null;
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle kicker="from the blog" title="Latest Stories" />
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {posts.map((p: any) => (
            <article key={p.id} className="group overflow-hidden rounded-3xl bg-cream shadow-soft transition-transform hover:-translate-y-1">
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="block aspect-[4/3] overflow-hidden">
                <img src={p.image_url ?? "/site-img/b1.webp"} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </Link>
              <div className="p-6">
                <time className="text-xs font-semibold uppercase tracking-widest text-pink">
                  {new Date(p.published_at ?? p.created_at ?? Date.now()).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </time>
                <h3 className="mt-2 font-display text-xl font-bold leading-tight">
                  <Link to="/blog/$slug" params={{ slug: p.slug }} className="hover:text-pink">{p.title}</Link>
                </h3>
                {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>}
                <Link to="/blog/$slug" params={{ slug: p.slug }} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-pink hover:gap-2 transition-all">
                  Read More <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="bg-cream pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] gradient-pink p-10 text-center text-white sm:p-16">
          <div className="absolute inset-0 sprinkles-bg opacity-25" />
          <div className="relative">
            <p className="font-script text-3xl">come visit us</p>
            <h2 className="mt-2 font-display text-4xl font-black sm:text-5xl">Crave it? Customize it. Bite it.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">
              50+ toppings, sweet, savory & vegan options — built around your imagination.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to="/menu" className="rounded-full bg-white px-7 py-3.5 text-sm font-bold text-pink hover:scale-105 transition-transform">View Full Menu</Link>
              <Link to="/contact" className="rounded-full border-2 border-white px-7 py-3 text-sm font-bold text-white hover:bg-white hover:text-pink transition-colors">Find Us</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
