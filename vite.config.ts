import path from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

/**
 * Build a specialist RunRecs deployment from the same repository without
 * changing ATHRECS production. A Vercel project named `runrecs` is detected
 * from its system production URL, so the first import works before any custom
 * variables or domains are added. VITE_SITE_BRAND remains an explicit override.
 */
function runRecsVariantPlugin(): Plugin {
  const branch = process.env.VERCEL_GIT_COMMIT_REF?.trim() ?? "";
  const explicitBrand = process.env.VITE_SITE_BRAND?.trim().toLowerCase();
  const projectProductionHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().toLowerCase() ?? "";
  const runRecsProject = projectProductionHost.includes("runrecs");
  const enabled =
    explicitBrand === "runrecs" ||
    runRecsProject ||
    branch === "feat/runrecs-running-site" ||
    branch === "runrecs-production";

  const moduleAliases = new Map<string, string>([
    ["@/lib/athrecs/api", "src/runrecs/api.ts"],
    ["@/lib/athrecs/filters", "src/runrecs/filters.ts"],
    ["@/lib/athrecs/seo", "src/runrecs/seo.ts"],
    ["@/lib/athrecs/official-entry.server", "src/runrecs/official-entry.server.ts"],
    ["@/lib/athrecs/athlete-profile-share-api", "src/runrecs/athlete-profile-share-api.ts"],
  ]);
  const routeAliases = new Map<string, string>([
    ["./routes/__root", "src/runrecs/routes/__root.tsx"],
    ["./routes/index", "src/runrecs/routes/index.tsx"],
  ]);

  return {
    name: "athrecs:runrecs-variant",
    enforce: "pre",
    config() {
      if (!enabled) return undefined;
      return {
        define: {
          "import.meta.env.VITE_SITE_BRAND": JSON.stringify("runrecs"),
        },
      };
    },
    resolveId(source, importer) {
      if (!enabled) return null;

      const moduleReplacement = moduleAliases.get(source);
      if (moduleReplacement) return path.resolve(process.cwd(), moduleReplacement);

      const normalizedImporter = importer?.replaceAll("\\", "/") ?? "";
      if (normalizedImporter.endsWith("/src/routeTree.gen.ts")) {
        const routeReplacement = routeAliases.get(source);
        if (routeReplacement) return path.resolve(process.cwd(), routeReplacement);
      }
      return null;
    },
    configResolved() {
      if (enabled) {
        console.log(
          `[runrecs] specialist running build enabled (branch=${branch || "local"}, project=${projectProductionHost || "unset"})`,
        );
      }
    },
  };
}

/**
 * ATHRECS is the Athletics specialist domain. The database and staff backend
 * remain shared, while every public catalogue read is routed through an exact
 * Athletics-only facade. RunRecs builds retain their separate Running/Parkrun
 * facade and never enable this plugin.
 */
function athleticsVariantPlugin(): Plugin {
  const branch = process.env.VERCEL_GIT_COMMIT_REF?.trim() ?? "";
  const explicitBrand = process.env.VITE_SITE_BRAND?.trim().toLowerCase();
  const projectProductionHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().toLowerCase() ?? "";
  const runRecsEnabled =
    explicitBrand === "runrecs" ||
    projectProductionHost.includes("runrecs") ||
    branch === "feat/runrecs-running-site" ||
    branch === "runrecs-production";
  const enabled = !runRecsEnabled;

  const moduleAliases = new Map<string, string>([
    ["@/lib/athrecs/api", "src/athletics/api.ts"],
    ["@/lib/athrecs/filters", "src/athletics/filters.ts"],
    ["@/lib/athrecs/official-entry.server", "src/athletics/official-entry.server.ts"],
    ["@/lib/athrecs/athlete-profile-share-api", "src/athletics/athlete-profile-share-api.ts"],
  ]);
  const routeAliases = new Map<string, string>([
    ["./routes/index", "src/athletics/routes/index.tsx"],
    ["./routes/calendar", "src/athletics/routes/calendar.tsx"],
    ["./routes/race-series", "src/athletics/routes/race-series.tsx"],
    ["./routes/$language/$country/index", "src/athletics/routes/$language/$country/index.tsx"],
  ]);

  return {
    name: "athrecs:athletics-variant",
    enforce: "pre",
    config() {
      if (!enabled) return undefined;
      return {
        define: {
          "import.meta.env.VITE_SITE_BRAND": JSON.stringify("athrecs"),
        },
      };
    },
    resolveId(source, importer) {
      if (!enabled) return null;

      const moduleReplacement = moduleAliases.get(source);
      if (moduleReplacement) return path.resolve(process.cwd(), moduleReplacement);

      const normalizedImporter = importer?.replaceAll("\\", "/") ?? "";
      if (normalizedImporter.endsWith("/src/routeTree.gen.ts")) {
        const routeReplacement = routeAliases.get(source);
        if (routeReplacement) return path.resolve(process.cwd(), routeReplacement);
      }
      return null;
    },
    configResolved() {
      if (enabled) {
        console.log(
          `[athrecs] athletics-only public build enabled (branch=${branch || "local"}, project=${projectProductionHost || "unset"})`,
        );
      }
    },
  };
}

/**
 * Finish PGLite bootstrap during dev-server setup (before traffic). Vite awaits
 * async `configureServer` hooks. Production: `src/lib/db` kicks `ensureDbReady`
 * on import.
 */
function pgliteBootstrapPlugin(): Plugin {
  return {
    name: "app-builder:pglite-bootstrap",
    apply: "serve",
    async configureServer(server) {
      try {
        const mod = (await server.ssrLoadModule("/src/lib/db.ts")) as {
          ensureDbReady?: () => Promise<void>;
        };
        if (typeof mod.ensureDbReady === "function") {
          await mod.ensureDbReady();
        }
      } catch (err) {
        console.error("[app-builder] DB bootstrap failed:", err);
        throw err;
      }
    },
  };
}

/**
 * Live-preview OAuth popup — handled HERE so the agent never has to create a
 * `/auth/popup` route (and cannot break it by scaffolding a React page that
 * paints the full app shell in the popup).
 *
 * `signIn` (client.ts) opens `/auth/popup?providerId=…` in a top-level window.
 * This middleware runs before TanStack Start, calls `handleAuthPopupRequest`,
 * and returns the 302 / completion HTML. Deployed apps do not use the popup
 * (full-page OAuth redirect), so `apply: "serve"` is enough.
 */
function authPopupPlugin(): Plugin {
  return {
    name: "app-builder:auth-popup",
    apply: "serve",
    configureServer(server) {
      // Register immediately (not in a returned post-hook) so we run BEFORE
      // TanStack Start / the SPA HTML fallback. A model-authored
      // `src/routes/auth/popup.tsx` React page must never win this path.
      server.middlewares.use(async (req, res, next) => {
        try {
          const rawUrl = req.url ?? "";
          const pathOnly = rawUrl.split("?", 1)[0] ?? "";
          if (pathOnly !== "/auth/popup") {
            next();
            return;
          }
          if ((req.method ?? "GET").toUpperCase() !== "GET") {
            res.statusCode = 405;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("Method Not Allowed");
            return;
          }

          const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost:8080");
          const proto = String(
            req.headers["x-forwarded-proto"] ??
              ((req.socket as { encrypted?: boolean } | undefined)?.encrypted ? "https" : "http"),
          );
          const requestHeaders = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value === undefined) continue;
            if (Array.isArray(value)) {
              for (const v of value) requestHeaders.append(key, v);
            } else {
              requestHeaders.set(key, value);
            }
          }
          // Ensure Host is the public preview host so Better Auth's dynamic
          // baseURL / redirect_uri match the popup origin.
          if (!requestHeaders.has("host")) requestHeaders.set("host", host);

          const request = new Request(`${proto}://${host}${rawUrl}`, {
            method: "GET",
            headers: requestHeaders,
          });

          const mod = (await server.ssrLoadModule("/src/lib/auth/popup.server.ts")) as {
            handleAuthPopupRequest: (req: Request) => Promise<Response>;
          };
          const response = await mod.handleAuthPopupRequest(request);

          res.statusCode = response.status;
          // Preserve multiple Set-Cookie headers (OAuth state + session).
          const setCookies =
            typeof response.headers.getSetCookie === "function"
              ? response.headers.getSetCookie()
              : [];
          response.headers.forEach((value, key) => {
            if (key.toLowerCase() === "set-cookie") return;
            res.setHeader(key, value);
          });
          for (const cookie of setCookies) {
            res.appendHeader("set-cookie", cookie);
          }
          const body = Buffer.from(await response.arrayBuffer());
          res.end(body);
        } catch (err) {
          console.error("[app-builder] /auth/popup handler failed:", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("auth popup failed");
          }
        }
      });
    },
  };
}

// `0.0.0.0:8080` is the live-preview contract — don't change host/port.
// Keep `nitro` gated to `build` (the Vercel deploy target): enabled in dev it
// opens a second dev-server port, which breaks the single-port preview.
// The dev server starts once `src/router.tsx` and `src/routes/` exist — see
// AGENTS.md § "First scaffold".
export default defineConfig(({ command }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    runRecsVariantPlugin(),
    athleticsVariantPlugin(),
    pgliteBootstrapPlugin(),
    // Before tanstackStart so /auth/popup never falls through to the SPA.
    authPopupPlugin(),
    tailwindcss(),
    tanstackStart(),
    ...(command === "build" ? [nitro({ preset: "vercel" })] : []),
    viteReact(),
  ],
}));
