import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <div className="font-script text-3xl text-pink">Oh sprinkles!</div>
        <h1 className="mt-2 font-display text-7xl font-black text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full gradient-pink px-6 py-3 text-sm font-bold text-white shadow-soft"
          >
            Back to Donutoo
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Donutoo — Home of the Original Messy Donuts" },
      { name: "description", content: "Freshly baked, never fried. Sweet, savory and vegan donuts with 50+ toppings. Now in Egypt." },
      { property: "og:title", content: "Donutoo — Home of the Original Messy Donuts" },
      { property: "og:description", content: "Freshly baked, never fried. Sweet, savory and vegan donuts with 50+ toppings. Now in Egypt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Donutoo — Home of the Original Messy Donuts" },
      { name: "twitter:description", content: "Freshly baked, never fried. Sweet, savory and vegan donuts with 50+ toppings. Now in Egypt." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b1810635-52f1-4c9f-8090-4728ea204e34/id-preview-a239791a--73498b54-d1ad-4c56-853b-973baa70ecd0.lovable.app-1777555834339.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b1810635-52f1-4c9f-8090-4728ea204e34/id-preview-a239791a--73498b54-d1ad-4c56-853b-973baa70ecd0.lovable.app-1777555834339.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800;9..144,900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Caveat:wght@500;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
  }));
  return (
    <QueryClientProvider client={client}>
      <Outlet />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
