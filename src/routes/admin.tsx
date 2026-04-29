import { Link, Outlet, useRouterState, useNavigate, createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Donutoo" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/settings", label: "Site Settings" },
  { to: "/admin/navigation", label: "Navigation" },
  { to: "/admin/slider", label: "Hero Slider" },
  { to: "/admin/pages", label: "Page Content" },
  { to: "/admin/menu-categories", label: "Menu Categories" },
  { to: "/admin/menu-items", label: "Menu Items" },
  { to: "/admin/blog", label: "Blog Posts" },
  { to: "/admin/testimonials", label: "Testimonials" },
  { to: "/admin/contact", label: "Contact Submissions" },
  { to: "/admin/franchise", label: "Franchise Leads" },
  { to: "/admin/subscribers", label: "Subscribers" },
];

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  async function claim() {
    const { data, error } = await supabase.rpc("claim_admin");
    if (error) return toast.error(error.message);
    if (data) {
      toast.success("You are now an admin. Reloading…");
      setTimeout(() => window.location.reload(), 600);
    } else {
      toast.error("Admin already exists. Ask an admin to grant you access.");
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-soft">
          <h1 className="font-display text-2xl font-black">No admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as {user.email}. If you are the site owner, claim admin access (only available before the first admin is set).
          </p>
          <button onClick={claim} className="mt-6 rounded-full gradient-pink px-6 py-3 text-sm font-bold text-white shadow-soft">
            Claim admin access
          </button>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}
            className="mt-3 block w-full text-xs text-muted-foreground hover:text-foreground"
          >Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="w-64 shrink-0 border-r bg-white sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 border-b">
          <Link to="/" className="font-script text-pink text-2xl">Donutoo</Link>
          <div className="text-xs text-muted-foreground">Admin Panel</div>
        </div>
        <nav className="p-3 space-y-1">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-pink text-white shadow-soft" : "text-foreground hover:bg-muted"
                }`}
              >{n.label}</Link>
            );
          })}
        </nav>
        <div className="p-3 mt-4 border-t">
          <div className="text-xs text-muted-foreground mb-2 px-2">{user.email}</div>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}
            className="w-full rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-muted"
          >Sign out</button>
        </div>
      </aside>
      <main className="flex-1 p-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
}
