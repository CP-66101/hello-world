import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

const SIGNATURE_FLAVOURS = [
  { name: "Coconut Delight", ar: "كوكونت ديليت", img: "https://donutoo.com/images/Upload/category/1735506302.png" },
  { name: "Very Berry Biscuit Cream", ar: "فيري بيري بسكت كريم", img: "https://donutoo.com/images/Upload/category/789675300.png" },
  { name: "Triple Chocolate", ar: "تريبل شوكوليت", img: "https://donutoo.com/images/Upload/category/1380810696.png" },
  { name: "Choconut", ar: "شوكونت", img: "https://donutoo.com/images/Upload/category/1464273811.png" },
  { name: "Espresso Biscuit Cream", ar: "اسبريسو بسكت كريم", img: "https://donutoo.com/images/Upload/category/925884526.png" },
  { name: "Hazel & Nutz", ar: "هيزل و نتس", img: "https://donutoo.com/images/Upload/category/368415500.png" },
];

// Layout order: pairs render side by side (2-col grid). null = full width.
const LAYOUT_ORDER: Array<string | null> = [
  "Cheesy Biggie Donuts", "Sweet Biggie Donuts",
  "Cheesy Mini Donuts",   "Sweet Mini Donuts",
  "__SIGNATURE__",
  "Donut Sandwiches",     "Free Add-ons",
  "Sweet Add-ons",        "Savory Add-ons",
  "Hot Beverages",
  "Cold Beverages",       "Ice Cream",
  "Combo",
];

function MenuPage() {
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

  const catByName = (n: string) => cats.find((c: any) => c.name === n);
  const itemsFor = (catId: string) => items.filter((i: any) => i.category_id === catId);

  return (
    <SiteLayout>
      {/* Hero banner — flat teal with wave, like the original */}
      <section className="relative">
        <div className="bg-mint py-20 text-center sm:py-28">
          <h1 className="font-display text-5xl font-black uppercase tracking-widest text-white sm:text-6xl">Menu</h1>
        </div>
        <svg className="-mt-1 block w-full text-cream" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,40 C180,10 360,60 540,40 C720,20 900,60 1080,40 C1260,20 1380,50 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </section>

      {/* Donut strip background image — decorative */}
      <div
        className="h-40 w-full bg-cover bg-center sm:h-56"
        style={{ backgroundImage: "url(https://donutoo.com/img/menu-bg2.webp)" }}
        aria-hidden
      />

      <section className="bg-cream pb-24 pt-16">
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6">
          {LAYOUT_ORDER.reduce<JSX.Element[]>((rows, key, idx, arr) => {
            if (key === "__SIGNATURE__") {
              rows.push(<SignatureFlavours key="sig" />);
              return rows;
            }
            // pair logic — only render once per pair
            if (idx > 0 && arr[idx - 1] && arr[idx - 1] !== "__SIGNATURE__" && idx % 2 === 1) {
              return rows; // already rendered as second of previous pair
            }
            const left = catByName(key as string);
            const rightKey = arr[idx + 1];
            const right = rightKey && rightKey !== "__SIGNATURE__" ? catByName(rightKey) : null;

            // Special full-width: Hot Beverages & Combo
            const fullWidth = key === "Hot Beverages" || key === "Combo" || key === "Cold Beverages" || key === "Ice Cream";

            if (fullWidth) {
              rows.push(
                <div key={key} className="grid gap-10 md:grid-cols-2">
                  {left && (key === "Hot Beverages"
                    ? <HotBeverageBlock cat={left} items={itemsFor(left.id)} />
                    : <CategoryBlock cat={left} items={itemsFor(left.id)} />)}
                  {right && (
                    <CategoryBlock cat={right} items={itemsFor(right.id)} />
                  )}
                </div>
              );
              return rows;
            }

            rows.push(
              <div key={key} className="grid gap-10 md:grid-cols-2">
                {left && <CategoryBlock cat={left} items={itemsFor(left.id)} />}
                {right && <CategoryBlock cat={right} items={itemsFor(right.id)} />}
              </div>
            );
            return rows;
          }, [])}

          <p className="pt-8 text-center text-sm text-muted-foreground">
            All prices are inclusive of 14% VAT
            <br />
            <span dir="rtl">جميع الأسعار تشمل ضريبة القيمة المضافة بنسبة 14٪</span>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

/* -------------------- Category banner header (purple slanted ribbon) -------------------- */
function CategoryHeader({ cat, color = "purple" }: { cat: any; color?: "purple" | "pink" }) {
  const bg = color === "purple" ? "bg-[#8b3a8a]" : "bg-pink";
  return (
    <div className="relative mx-auto mb-8 max-w-md">
      <div
        className={`${bg} px-8 py-4 text-center text-white shadow-soft`}
        style={{ clipPath: "polygon(4% 0, 100% 8%, 96% 100%, 0 92%)" }}
      >
        {cat.name_ar && (
          <div className="font-display text-base font-bold leading-tight" dir="rtl">
            {cat.name_ar}
          </div>
        )}
        <div className="font-display text-xl font-black leading-tight sm:text-2xl">{cat.name}</div>
      </div>
    </div>
  );
}

/* -------------------- Standard list block -------------------- */
function CategoryBlock({ cat, items }: { cat: any; items: any[] }) {
  return (
    <div>
      <CategoryHeader cat={cat} />
      <ul className="space-y-4">
        {items.map((it) => (
          <li key={it.id} className="border-b border-dashed border-pink/40 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-display text-base font-bold text-foreground">{it.name}</div>
                {it.name_ar && (
                  <div className="mt-0.5 text-sm text-muted-foreground" dir="rtl">{it.name_ar}</div>
                )}
              </div>
              <div className="shrink-0 text-right">
                {it.price == null ? (
                  <span className="font-display text-sm font-black uppercase tracking-wider text-mint">Included</span>
                ) : (
                  <span className="font-display text-lg font-black text-pink">
                    {Number(it.price).toFixed(0)} <span className="text-xs font-bold">{it.currency ?? "EGP"}</span>
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Signature note under Sweet Mini Donuts */}
      {cat.name === "Sweet Mini Donuts" && (
        <div className="mt-6 space-y-2 rounded-2xl bg-pink-soft/40 p-4 text-center">
          <p className="font-display text-sm font-black text-pink">Vegan Sweet Donuts Available</p>
          <p className="text-xs text-muted-foreground" dir="rtl">متوفر دوناتس حلو صيامي</p>
        </div>
      )}
    </div>
  );
}

/* -------------------- Hot Beverages: two price columns -------------------- */
function HotBeverageBlock({ cat, items }: { cat: any; items: any[] }) {
  // Group consecutive items by their (size_label, size_label_secondary) pair
  const groups: { headers: [string, string]; rows: any[] }[] = [];
  items.forEach((it) => {
    const headers: [string, string] = [it.size_label ?? "Single", it.size_label_secondary ?? "Double"];
    const last = groups[groups.length - 1];
    if (last && last.headers[0] === headers[0] && last.headers[1] === headers[1]) {
      last.rows.push(it);
    } else {
      groups.push({ headers, rows: [it] });
    }
  });

  return (
    <div>
      <CategoryHeader cat={cat} />
      <div className="space-y-8">
        {groups.map((g, gi) => (
          <div key={gi}>
            <div className="mb-3 grid grid-cols-[1fr_70px_70px] items-baseline gap-3 border-b-2 border-pink/30 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Drink</span>
              <span className="text-center font-display text-sm font-black text-pink">{g.headers[0]}</span>
              <span className="text-center font-display text-sm font-black text-pink">{g.headers[1]}</span>
            </div>
            <ul className="space-y-3">
              {g.rows.map((it) => (
                <li key={it.id} className="grid grid-cols-[1fr_70px_70px] items-center gap-3 border-b border-dashed border-pink/30 pb-3">
                  <div className="min-w-0">
                    <div className="font-display text-base font-bold text-foreground">{it.name}</div>
                    {it.name_ar && (
                      <div className="mt-0.5 text-sm text-muted-foreground" dir="rtl">{it.name_ar}</div>
                    )}
                  </div>
                  <div className="text-center font-display text-base font-black text-pink">
                    {it.price != null ? `${Number(it.price).toFixed(0)}` : "—"}
                  </div>
                  <div className="text-center font-display text-base font-black text-pink">
                    {it.price_secondary != null ? `${Number(it.price_secondary).toFixed(0)}` : "—"}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------- Signature Flavours grid -------------------- */
function SignatureFlavours() {
  return (
    <section className="rounded-3xl bg-white py-12 shadow-soft">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="font-script text-2xl text-pink">Add 5 EGP each</p>
        <h2 className="font-display text-3xl font-black sm:text-4xl">Signature Flavours</h2>
        <p className="mt-1 text-sm text-muted-foreground" dir="rtl">أضف خمس جنيهات للنكهات الخاصة</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {SIGNATURE_FLAVOURS.map((f) => (
            <div key={f.name} className="rounded-3xl bg-cream p-4 transition-transform hover:-translate-y-1">
              <div className="mx-auto aspect-square w-full overflow-hidden rounded-2xl bg-white">
                <img src={f.img} alt={f.name} loading="lazy" className="h-full w-full object-contain p-2" />
              </div>
              <div className="mt-3 font-display text-sm font-black leading-tight">{f.name}</div>
              <div className="text-xs text-muted-foreground" dir="rtl">{f.ar}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
