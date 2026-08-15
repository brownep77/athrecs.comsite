import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { isSiteLanguage } from "@/lib/athrecs/country-sites";
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
      { title: "ATHRECS.com — Find races, results and athletes" },
      {
        name: "description",
        content:
          "Find running, triathlon and cycling events — from parkruns and 5Ks to half marathons and marathons — with athletes, clubs and results on ATHRECS.com.",
      },
      { name: "theme-color", content: "#f4f7f7" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/athrecs-icon-192.png" },
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
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
