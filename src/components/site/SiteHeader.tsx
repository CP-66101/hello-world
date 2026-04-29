import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Phone } from "lucide-react";
import { useState } from "react";
import { useNavigation, useSiteSettings } from "@/lib/content";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data: settings } = useSiteSettings();
  const { data: nav = [] } = useNavigation("header");

  const links = nav.length > 0 ? nav : [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Menu", href: "/menu" },
    { label: "Franchise", href: "/franchise" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-12 w-12 place-items-center rounded-full gradient-pink shadow-soft">
            <span className="font-display text-2xl font-black text-white">D</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-2xl font-black tracking-tight text-foreground">
              {settings?.site_name ?? "DONUTOO"}
            </div>
            <div className="font-script text-xs text-pink">freshly baked</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l: any) => {
            const active = path === l.href || (l.href !== "/" && path.startsWith(l.href));
            return (
              <Link
                key={l.href}
                to={l.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active ? "bg-pink text-white" : "text-foreground hover:bg-pink-soft hover:text-pink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {settings?.phone_primary && (
            <a href={`tel:${settings.phone_primary.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-pink">
              <Phone className="h-4 w-4" /> {settings.phone_primary}
            </a>
          )}
          <Link to="/menu" className="rounded-full gradient-pink px-5 py-2.5 text-sm font-bold text-white shadow-soft transition-transform hover:scale-105">
            Order Now
          </Link>
        </div>

        <button
          aria-label="Menu"
          className="grid h-11 w-11 place-items-center rounded-full bg-pink-soft text-pink lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-cream lg:hidden">
          <div className="space-y-1 px-4 py-4">
            {links.map((l: any) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-base font-semibold text-foreground hover:bg-pink-soft hover:text-pink"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/menu"
              onClick={() => setOpen(false)}
              className="mt-3 block rounded-full gradient-pink px-5 py-3 text-center text-base font-bold text-white"
            >
              Order Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
