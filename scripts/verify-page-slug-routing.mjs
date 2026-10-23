import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
import ts from "typescript";
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  stripSearchParams,
  notFound,
} from "@tanstack/react-router";

const root = process.cwd();
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.startsWith("@/") ||
      (specifier.startsWith(".") &&
        context.parentURL?.startsWith(pathToFileURL(`${root}/src/`).href))
    ) {
      let target = specifier.startsWith("@/")
        ? path.join(root, "src", specifier.slice(2))
        : fileURLToPath(new URL(specifier, context.parentURL));
      if (!path.extname(target))
        target = fs.existsSync(`${target}.ts`) ? `${target}.ts` : path.join(target, "index.ts");
      return nextResolve(pathToFileURL(target).href, context);
    }
    return nextResolve(specifier, context);
  },
});

// Execute the real exported handlers and route configuration; uncalled UI imports
// are inert. No production database, authentication or athlete evidence is used.
function load(file, dependencies) {
  const module = { exports: {} };
  const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    fileName: file,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  new Function("require", "module", "exports", compiled.outputText)(
    (name) => dependencies[name] ?? {},
    module,
    module.exports,
  );
  return module.exports;
}
let reads = 0;
const redirects = load("src/lib/athrecs/slug-redirects.ts", {
  "@tanstack/react-start": {
    createServerFn: () => ({
      validator: (validate) => ({
        handler:
          (handler) =>
          ({ data }) =>
            handler({ data: validate(data) }),
      }),
    }),
  },
  "@/lib/db": {
    getSql: async () => async () => {
      reads++;
      return [{ current_slug: "current-race" }];
    },
  },
  "./seed.server": { ensureAthrecsSeeded: async () => {} },
});
for (const entityType of ["event", "club", "athlete"]) {
  for (const slug of ["", "not a slug", "bad_slug", "path/segment", "<script>", null, {}, 123]) {
    assert.equal(await redirects.resolveSlugRedirect({ data: { entityType, slug } }), null);
  }
}
assert.equal(
  reads,
  0,
  "Invalid public addresses must return no alias without querying the database",
);
for (const slug of ["old-race", "legacy--race-", " OLD-RACE "]) {
  assert.equal(
    await redirects.resolveSlugRedirect({ data: { entityType: "event", slug } }),
    "current-race",
  );
}
assert.throws(() =>
  redirects.resolveSlugRedirect({ data: { entityType: "unknown", slug: "old-race" } }),
);
const { canonicalEventSlug, eventSlugAliases } = await import("../src/data/entry-options.ts");
for (const slug of [
  "constructor",
  "__proto__",
  "toString",
  "hasOwnProperty",
  "unregistered-race",
]) {
  assert.equal(
    canonicalEventSlug(slug),
    slug,
    "Only explicitly registered aliases may change a race address",
  );
}
for (const [oldSlug, currentSlug] of Object.entries(eventSlugAliases))
  assert.equal(canonicalEventSlug(oldSlug), currentSlug);

const seo = await import("../src/lib/athrecs/seo.ts");
const runrecsSeo = await import("../src/runrecs/seo.ts");
const berlin = await import("../src/lib/athrecs/berlin-results.ts");
const raceCollections = await import("../src/data/race-collections.ts");
const superhalfs = await import("../src/data/superhalfs.ts");
const route = (file, extra = {}) =>
  load(file, {
    "@tanstack/react-router": { createFileRoute: () => (options) => options, stripSearchParams },
    "@/lib/athrecs/seo": seo,
    "@/lib/site-scope": { IS_RUNRECS_SITE: false },
    "@/lib/athrecs/berlin-results": berlin,
    "@/data/race-collections": raceCollections,
    "@/data/superhalfs": superhalfs,
    "@/data/berlin-marathon-2026.json": {
      default: JSON.parse(fs.readFileSync("src/data/berlin-marathon-2026.json", "utf8")),
    },
    ...extra,
  }).Route;
const athleteInput = await import("../src/lib/athrecs/public-athlete-result-pages.ts");
const athleteRoute = route("src/routes/athletes/$slug.tsx", {
  "@tanstack/react-router": { createFileRoute: () => (options) => options, notFound },
  "@/lib/athrecs/public-athlete-result-pages": athleteInput,
});
// Exercise the actual router lifecycle: invalid URLs must produce a 404 before
// the preview API (whose validator deliberately rejects these inputs) is called.
for (const slug of [" ", "\t", "a".repeat(301), "a".repeat(1800)]) {
  let loads = 0;
  const root = createRootRoute();
  const profile = createRoute({
    getParentRoute: () => root,
    path: "/athletes/$slug",
    beforeLoad: athleteRoute.beforeLoad,
    loader: () => { loads++; },
  });
  const router = createRouter({
    routeTree: root.addChildren([profile]),
    history: createMemoryHistory({ initialEntries: [`/athletes/${encodeURIComponent(slug)}`] }),
  });
  await router.load();
  assert.equal(loads, 0, "Invalid athlete URLs must not call a profile loader");
  assert.equal(router.state.matches.at(-1).status, "notFound");
  assert.throws(() => athleteInput.parsePublicAthletePreviewInput({ slug }));
}
for (const slug of ["example-athlete", "legacy--athlete-", "ATH-000123", "ath-000123", "a".repeat(300)]) {
  assert.doesNotThrow(() => athleteRoute.beforeLoad({ params: { slug } }));
  assert.equal(athleteInput.parsePublicAthletePreviewInput({ slug }).slug, slug);
}
const directory = route("src/athletics/routes/athletes/index.tsx");
for (const search of [{}, { letter: "B", page: 2 }, { q: "Example" }]) {
  const head = directory.head({ loaderData: { indexable: !search.q }, matches: [{ search }] });
  const canonical = head.links.find((link) => link.rel === "canonical").href;
  assert.equal(head.meta.find((meta) => meta.property === "og:url").content, canonical);
  assert.equal(
    head.meta.findLast((meta) => meta.name === "robots").content,
    search.q ? "noindex, follow" : "index, follow",
  );
  if (search.page) assert.equal(canonical, `${seo.SITE_URL}/athletes?letter=B&page=2`);
}
for (const [file, slug] of [
  ["src/routes/running/race-series.tsx", "/running/race-series"],
  ["src/routes/sponsorship.tsx", "/sponsorship"],
]) {
  for (const isRunrecs of [false, true]) {
    const selectedSeo = isRunrecs ? runrecsSeo : seo;
    const head = route(file, {
      "@/lib/athrecs/seo": selectedSeo,
      "@/lib/site-scope": { IS_RUNRECS_SITE: isRunrecs },
    }).head();
    const canonical = head.links.find((link) => link.rel === "canonical").href;
    assert.equal(canonical, `${selectedSeo.SITE_URL}${slug}`);
    assert.equal(head.meta.find((meta) => meta.property === "og:url").content, canonical);
    if (slug === "/running/race-series") {
      const graph = JSON.parse(head.scripts.find((script) => script.type === "application/ld+json").children)["@graph"];
      const items = graph.find((item) => item["@type"] === "CollectionPage").mainEntity.itemListElement;
      assert.equal(items.length, raceCollections.raceGroupDefinitions.length + 1);
      assert.equal(items[0].url, `${selectedSeo.SITE_URL}${superhalfs.SUPERHALFS_PATH}`);
      assert(items.every((item) => item.url.startsWith(selectedSeo.SITE_URL) && !item.url.includes("undefined")));
    }
  }
}
const berlinRoute = route("src/routes/results/berlin-marathon-2026.tsx");
const rootRoute = createRootRoute();
const resultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: berlin.BERLIN_PATH,
  validateSearch: berlinRoute.validateSearch,
  search: berlinRoute.search,
});
const router = createRouter({
  routeTree: rootRoute.addChildren([resultRoute]),
  history: createMemoryHistory({ initialEntries: [berlin.BERLIN_PATH] }),
});
const build = (search) => router.buildLocation({ to: berlin.BERLIN_PATH, search }).href;
assert.equal(
  build(berlin.berlinSearch({})),
  berlin.BERLIN_PATH,
  "The default results view must keep its clean sitemap address",
);
assert.equal(build(berlin.berlinSearch({ view: "women" })), `${berlin.BERLIN_PATH}?view=women`);
const filtered = new URL(
  build(
    berlin.berlinSearch({
      view: "age",
      ageGender: "women",
      category: "W45",
      q: "Example",
      page: 2,
    }),
  ),
  seo.SITE_URL,
);
for (const [key, value] of Object.entries({
  view: "age",
  ageGender: "women",
  category: "W45",
  q: "Example",
  page: "2",
}))
  assert.equal(filtered.searchParams.get(key), value);
console.log(
  `PASS: malformed slug handling, ${Object.keys(eventSlugAliases).length} explicit aliases, page-specific sharing URLs and clean Berlin results navigation.`,
);
