import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/content";
import { toast } from "sonner";

export function SiteFooter() {
  const { data: settings } = useSiteSettings();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    const r = z.string().email().max(255).safeParse(email);
    if (!r.success) { toast.error("Please enter a valid email"); return; }
    setPending(true);
    const { error } = await supabase.from("subscribers").insert({ email: r.data });
    setPending(false);
    if (error) {
      if (error.code === "23505") toast.success("You're already subscribed!");
      else toast.error("Could not subscribe. Try again.");
      return;
    }
    setEmail("");
    toast.success("Welcome to the Donutoo family! 🍩");
  }

  return (
    <footer className="relative mt-24 overflow-hidden bg-cocoa text-cream">
      <div className="absolute inset-x-0 top-0 h-3 gradient-pink" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-12 w-12 place-items-center rounded-full gradient-pink">
              <span className="font-display text-2xl font-black text-white">D</span>
            </div>
            <div>
              <div className="font-display text-2xl font-black">{settings?.site_name ?? "DONUTOO"}</div>
              <div className="font-script text-sm text-pink-soft">{settings?.tagline ?? "freshly baked"}</div>
            </div>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-cream/70">
            Home of the original messy donuts. Baked, never fried — over 50 toppings to make it your own.
          </p>
          <div className="mt-6 flex gap-3">
            {settings?.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-pink hover:text-white">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {settings?.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-pink hover:text-white">
                <Instagram className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            {[
              ["Home", "/"], ["About Us", "/about"], ["Menu", "/menu"],
              ["Franchise", "/franchise"], ["Blog", "/blog"], ["Contact", "/contact"],
            ].map(([label, href]) => (
              <li key={href}><Link to={href} className="hover:text-pink-soft">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold">Get in Touch</h4>
          <ul className="mt-4 space-y-3 text-sm text-cream/80">
            {settings?.address_main && (
              <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink-soft" /> {settings.address_main}</li>
            )}
            {settings?.phone_primary && (
              <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-pink-soft" /> {settings.phone_primary}</li>
            )}
            {settings?.email && (
              <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-pink-soft" /> {settings.email}</li>
            )}
            {settings?.hours && (
              <li className="text-cream/70 italic">{settings.hours}</li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold">Sweet Updates</h4>
          <p className="mt-4 text-sm text-cream/80">Subscribe for new flavors, branches, and special offers.</p>
          <form onSubmit={subscribe} className="mt-4 flex gap-2">
            <input
              type="email"
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-2.5 text-sm placeholder:text-cream/40 outline-none ring-pink focus:ring-2"
            />
            <button disabled={pending} className="grid h-11 w-11 shrink-0 place-items-center rounded-full gradient-pink text-white disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {settings?.site_name ?? "Donutoo"}. All rights reserved.
        <span className="mx-2">·</span>
        <Link to="/admin/login" className="hover:text-pink-soft">Admin</Link>
      </div>
    </footer>
  );
}
