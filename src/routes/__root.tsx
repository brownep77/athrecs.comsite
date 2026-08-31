import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { AthleteAuthDialog } from "@/components/auth/AthleteAuthDialog";
import { AppShell } from "@/components/layout/AppShell";
import { isSiteLanguage } from "@/lib/athrecs/country-sites";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  organizationJsonLd,
  siteGraphMeta,
} from "@/lib/athrecs/seo";
import appCss from "@/styles.css?url";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { name: "theme-color", content: "#f4f7f7" },
      {
        name: "keywords",
        content:
          "athletics events, track and field, cross country, road athletics, athletics results, athletes, athletics clubs, ATHRECS",
      },
      ...siteGraphMeta({
        title: `${SITE_NAME} — Athletics events, results and athletes`,
        description: DEFAULT_DESCRIPTION,
        url: SITE_URL,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/athrecs-icon-192.png" },
      { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(organizationJsonLd()),
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const languageSegment = pathname.split("/").filter(Boolean)[0] ?? "en";
  const pageLanguage = isSiteLanguage(languageSegment) ? languageSegment : "en";

  return (
    <html lang={pageLanguage}>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg antialiased">
        <QueryClientProvider client={queryClient}>
          <AppShell>
            <Outlet />
          </AppShell>
          <AthleteAuthDialog />
          <SiteAnalytics />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
