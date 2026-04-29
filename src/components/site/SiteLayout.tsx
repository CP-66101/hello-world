import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ReactNode } from "react";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function SectionTitle({ kicker, title, className = "" }: { kicker?: string; title: string; className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      {kicker && <p className="font-script text-2xl text-pink">{kicker}</p>}
      <h2 className="mt-1 font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">{title}</h2>
      <div className="mx-auto mt-3 flex items-center justify-center gap-2">
        <span className="h-[3px] w-10 rounded-full bg-pink" />
        <span className="h-2 w-2 rounded-full bg-mint" />
        <span className="h-[3px] w-10 rounded-full bg-pink" />
      </div>
    </div>
  );
}

export function Breadcrumb({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden gradient-pink py-20 text-center text-white sm:py-28">
      <div className="absolute inset-0 sprinkles-bg opacity-30" />
      <div className="relative mx-auto max-w-3xl px-6">
        {subtitle && <p className="font-script text-2xl text-white/90">{subtitle}</p>}
        <h1 className="mt-2 font-display text-5xl font-black sm:text-6xl">{title}</h1>
      </div>
      <svg className="absolute -bottom-1 left-0 right-0 w-full text-cream" viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path fill="currentColor" d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,42.7C840,43,960,53,1080,53.3C1200,53,1320,43,1380,37.3L1440,32L1440,80L0,80Z" />
      </svg>
    </section>
  );
}
