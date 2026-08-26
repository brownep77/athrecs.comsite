import { readFile, writeFile } from "node:fs/promises";

const path = "src/routeTree.gen.ts";
let source = await readFile(path, "utf8");

function insertAfter(needle, addition, label) {
  if (source.includes(addition.trim())) return;
  if (!source.includes(needle)) throw new Error(`Could not find ${label}`);
  source = source.replace(needle, `${needle}${addition}`);
}

insertAfter(
  "import { Route as ClaimResultsRouteImport } from './routes/claim-results'\n",
  "import { Route as MyAthleteProfileRouteImport } from './routes/my-athlete-profile'\n",
  "claim-results import",
);

insertAfter(
  `const ClaimResultsRoute = ClaimResultsRouteImport.update({
  id: '/claim-results',
  path: '/claim-results',
  getParentRoute: () => rootRouteImport,
} as any)
`,
  `const MyAthleteProfileRoute = MyAthleteProfileRouteImport.update({
  id: '/my-athlete-profile',
  path: '/my-athlete-profile',
  getParentRoute: () => rootRouteImport,
} as any)
`,
  "claim-results route definition",
);

source = source.replaceAll(
  "  '/claim-results': typeof ClaimResultsRoute\n",
  "  '/claim-results': typeof ClaimResultsRoute\n  '/my-athlete-profile': typeof MyAthleteProfileRoute\n",
);
source = source.replaceAll(
  "    | '/claim-results'\n",
  "    | '/claim-results'\n    | '/my-athlete-profile'\n",
);

insertAfter(
  "  ClaimResultsRoute: typeof ClaimResultsRoute\n",
  "  MyAthleteProfileRoute: typeof MyAthleteProfileRoute\n",
  "root children interface",
);

insertAfter(
  `    '/claim-results': {
      id: '/claim-results'
      path: '/claim-results'
      fullPath: '/claim-results'
      preLoaderRoute: typeof ClaimResultsRouteImport
      parentRoute: typeof rootRouteImport
    }
`,
  `    '/my-athlete-profile': {
      id: '/my-athlete-profile'
      path: '/my-athlete-profile'
      fullPath: '/my-athlete-profile'
      preLoaderRoute: typeof MyAthleteProfileRouteImport
      parentRoute: typeof rootRouteImport
    }
`,
  "claim-results FileRoutesByPath entry",
);

insertAfter(
  "  ClaimResultsRoute: ClaimResultsRoute,\n",
  "  MyAthleteProfileRoute: MyAthleteProfileRoute,\n",
  "root children object",
);

if (!source.includes("'/my-athlete-profile': typeof MyAthleteProfileRoute")) {
  throw new Error("Private profile route types were not added");
}
if (!source.includes("preLoaderRoute: typeof MyAthleteProfileRouteImport")) {
  throw new Error("Private profile FileRoutesByPath entry was not added");
}

await writeFile(path, source);
console.log("Private athlete profile route added to routeTree.gen.ts");
