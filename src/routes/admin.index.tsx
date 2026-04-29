import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const TABLES = [
  { table: "menu_items", label: "Menu items" },
  { table: "blog_posts", label: "Blog posts" },
  { table: "testimonials", label: "Testimonials" },
  { table: "contact_submissions", label: "Contact submissions" },
  { table: "franchise_submissions", label: "Franchise leads" },
  { table: "subscribers", label: "Subscribers" },
];

function Dashboard() {
  const { data: counts } = useQuery({
    queryKey: ["admin", "dashboard-counts"],
    queryFn: async () => {
      const out: Record<string, number> = {};
      await Promise.all(
        TABLES.map(async (t) => {
          const { count } = await supabase.from(t.table as any).select("*", { count: "exact", head: true });
          out[t.table] = count ?? 0;
        }),
      );
      return out;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black">Welcome back 🍩</h1>
        <p className="text-sm text-muted-foreground">Manage every part of your Donutoo site from here.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TABLES.map((t) => (
          <div key={t.table} className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{t.label}</div>
            <div className="mt-1 font-display text-3xl font-black text-pink">{counts?.[t.table] ?? "…"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
