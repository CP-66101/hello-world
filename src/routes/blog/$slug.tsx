import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogDetail,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Donutoo Blog` },
    ],
  }),
});

function BlogDetail() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ["blog_post", slug],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
      return data;
    },
  });

  return (
    <SiteLayout>
      <article className="bg-cream py-16">
        <div className="mx-auto max-w-3xl px-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-pink hover:gap-3 transition-all">
            <ArrowLeft className="h-4 w-4" /> Back to all posts
          </Link>

          {isLoading ? (
            <div className="mt-12 rounded-3xl bg-white p-12 text-center text-muted-foreground">Loading…</div>
          ) : !post ? (
            <div className="mt-12 rounded-3xl bg-white p-12 text-center">
              <h1 className="font-display text-3xl font-black">Post not found</h1>
              <p className="mt-2 text-muted-foreground">It may have been removed or the link is wrong.</p>
            </div>
          ) : (
            <>
              <header className="mt-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-pink-soft px-3 py-1 text-xs font-bold text-pink">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.published_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                <h1 className="mt-4 font-display text-4xl font-black leading-tight sm:text-5xl">{post.title}</h1>
              </header>
              {post.image_url && (
                <img src={post.image_url} alt={post.title} className="mt-8 aspect-[16/10] w-full rounded-3xl object-cover shadow-soft" />
              )}
              <div className="prose prose-lg mt-10 max-w-none whitespace-pre-line text-foreground/85">
                {post.content ?? post.excerpt}
              </div>
            </>
          )}
        </div>
      </article>
    </SiteLayout>
  );
}
