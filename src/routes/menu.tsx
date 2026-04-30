import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Breadcrumb } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/menu")({
  component: MenuPage,
  head: () => ({
    meta: [
      { title: "Menu — Donutoo Sweet, Savory & Vegan Donuts" },
      { name: "description", content: "Explore the full Donutoo menu: sweet, savory and vegan baked donuts, signature drinks, ice cream and combos." },
      { property: "og:title", content: "Donutoo Menu — Sweet, Savory & Vegan" },
      { property: "og:description", content: "Browse 50+ toppings across sweet, savory, vegan, beverages, ice cream and combos." },
    ],
  }),
});

function MenuPage() {
  const [active, setActive] = useState<string | "all">("all");

  const { data: cats = [] } = useQuery({
    queryKey: ["menu_categories_active"],
    queryFn: async () => {
      const { data } = await supabase.from("menu_categories").select("*").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });
  const { data: items = [] } = useQuery({
    queryKey: ["menu_items_active"],
    queryFn: async () => {
      const { data } = await supabase.from("menu_items").select("*").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  const visibleCats = active === "all" ? cats : cats.filter((c: any) => c.id === active);

  return (
    <SiteLayout>
      <Breadcrumb title="Our Menu" subtitle="customize your bite" />

      <section className="bg-cream py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActive("all")}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                active === "all" ? "gradient-pink text-white shadow-soft" : "bg-white text-foreground hover:bg-pink-soft hover:text-pink"
              }`}
            >
              All Categories
            </button>
            {cats.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                  active === c.id ? "gradient-pink text-white shadow-soft" : "bg-white text-foreground hover:bg-pink-soft hover:text-pink"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <SignatureFlavours />

      <section className="bg-cream pb-24">
        <div className="mx-auto max-w-7xl space-y-20 px-6">
          {visibleCats.map((cat: any, idx: number) => {
            const catItems = items.filter((i: any) => i.category_id === cat.id);
            if (catItems.length === 0) return null;
            const odd = idx % 2 === 1;
            return (
              <div key={cat.id} className="scroll-mt-24" id={`cat-${cat.id}`}>
                <div className={`flex items-end justify-between gap-6 ${odd ? "flex-row-reverse" : ""}`}>
                  <div>
                    <p className="font-script text-2xl text-pink">category</p>
                    <h2 className="font-display text-4xl font-black sm:text-5xl">{cat.name}</h2>
                    {cat.description && <p className="mt-2 max-w-xl text-muted-foreground">{cat.description}</p>}
                  </div>
                  <div className="hidden h-1 flex-1 rounded-full bg-pink-soft sm:block" />
                </div>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {catItems.map((it: any) => (
                    <article key={it.id} className="group overflow-hidden rounded-3xl bg-white shadow-soft transition-transform hover:-translate-y-2">
                      <div className="relative aspect-square overflow-hidden bg-cream-deep">
                        {it.badge && (
                          <span className="absolute left-4 top-4 z-10 rounded-full bg-mint px-3 py-1 text-[10px] font-black uppercase tracking-widest text-foreground">
                            {it.badge}
                          </span>
                        )}
                        <img
                          src={it.image_url ?? "/site-img/donutsweet.png"}
                          alt={it.name}
                          className="absolute inset-0 m-auto h-3/4 w-3/4 object-contain transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-display text-lg font-bold leading-tight">{it.name}</h3>
                        {it.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{it.description}</p>}
                        {it.price != null && (
                          <div className="mt-3 flex items-baseline gap-1">
                            <span className="font-display text-2xl font-black text-pink">{Number(it.price).toFixed(0)}</span>
                            <span className="text-xs font-semibold text-muted-foreground">{it.currency ?? "EGP"}</span>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="rounded-3xl bg-white p-16 text-center text-muted-foreground">
              No menu items yet. Check back soon!
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
