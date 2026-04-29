import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, Breadcrumb } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Blog — Donutoo Stories, News & Flavors" },
      { name: "description", content: "Latest stories from Donutoo: new flavors, branch openings, and donut moments." },
      { property: "og:title", content: "Donutoo Blog" },
      { property: "og:description", content: "News, flavors and stories from Donutoo." },
    ],
  }),
});

function BlogIndex() {
  const { data: posts = [] } = useQuery({
    queryKey: ["blog_posts_all"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("*").eq("is_published", true).order("published_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <Breadcrumb title="Our Blog" subtitle="sweet stories" />
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-6">
          {posts.length === 0 ? (
            <div className="rounded-3xl bg-white p-16 text-center text-muted-foreground">No posts yet.</div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p: any) => (
                <article key={p.id} className="group overflow-hidden rounded-3xl bg-white shadow-soft transition-transform hover:-translate-y-1">
                  <Link to="/blog/$slug" params={{ slug: p.slug }} className="block aspect-[4/3] overflow-hidden">
                    <img src={p.image_url ?? "/site-img/b1.webp"} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </Link>
                  <div className="p-6">
                    <time className="text-xs font-semibold uppercase tracking-widest text-pink">
                      {new Date(p.published_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </time>
                    <h2 className="mt-2 font-display text-xl font-bold leading-tight">
                      <Link to="/blog/$slug" params={{ slug: p.slug }} className="hover:text-pink">{p.title}</Link>
                    </h2>
                    {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                    <Link to="/blog/$slug" params={{ slug: p.slug }} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-pink">
                      Read More <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
