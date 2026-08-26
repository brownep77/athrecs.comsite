import { readFile, writeFile } from "node:fs/promises";

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first === -1) throw new Error(`Could not find ${label}`);
  if (source.indexOf(before, first + before.length) !== -1) {
    throw new Error(`Found more than one ${label}`);
  }
  return `${source.slice(0, first)}${after}${source.slice(first + before.length)}`;
}

const claimPath = "src/routes/claim-results.tsx";
let claimRoute = await readFile(claimPath, "utf8");

claimRoute = replaceOnce(
  claimRoute,
  '  needs_info: "More information needed",',
  '  needs_info: "Conflict clarification",',
  "needs-info status label",
);

claimRoute = replaceOnce(
  claimRoute,
  `              onSubmit={(event) => {
                event.preventDefault();
                setMessage(null);
                submitClaim.mutate();
              }}`,
  `              onSubmit={(event) => {
                event.preventDefault();
                setMessage(null);
                if (!declaration) {
                  setMessage("Tick the confirmation box to confirm this is your result.");
                  return;
                }
                submitClaim.mutate();
              }}`,
  "claim form submit handler",
);

claimRoute = replaceOnce(
  claimRoute,
  '                  note={currentClaim.staffNote || "ATHRECS staff need another verification detail."}',
  '                  note={currentClaim.staffNote || "ATHRECS staff have requested clarification because this athlete profile has a competing claim."}',
  "legacy verification-detail message",
);

claimRoute = replaceOnce(
  claimRoute,
  "                disabled={submitClaim.isPending || !declaration}",
  "                disabled={submitClaim.isPending}",
  "claim button disabled condition",
);

await writeFile(claimPath, claimRoute);

const vercelPath = "vercel.json";
const vercelConfig = JSON.parse(await readFile(vercelPath, "utf8"));
vercelConfig.headers ??= [];
const privateNoStoreHeaders = [
  {
    key: "Cache-Control",
    value: "private, no-store, no-cache, max-age=0, must-revalidate",
  },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
];
for (const source of ["/claim-results", "/athlete-account"]) {
  const existing = vercelConfig.headers.find((entry) => entry.source === source);
  if (existing) existing.headers = privateNoStoreHeaders;
  else vercelConfig.headers.push({ source, headers: privateNoStoreHeaders });
}
await writeFile(vercelPath, `${JSON.stringify(vercelConfig, null, 2)}\n`);

const verifyPath = "scripts/verify-result-claims.mjs";
let verification = await readFile(verifyPath, "utf8");
verification = replaceOnce(
  verification,
  'const claimRoute = await readFile(resolve(root, "src/routes/claim-results.tsx"), "utf8");\nconst adminClaimRoute = await readFile(',
  'const claimRoute = await readFile(resolve(root, "src/routes/claim-results.tsx"), "utf8");\nconst vercelConfig = JSON.parse(await readFile(resolve(root, "vercel.json"), "utf8"));\nconst adminClaimRoute = await readFile(',
  "Vercel verification fixture",
);
verification = replaceOnce(
  verification,
  "assert.match(claimRoute, /disabled=\\{submitClaim\\.isPending \\|\\| !declaration\\}/);",
  `assert.match(claimRoute, /Tick the confirmation box to confirm this is your result/);
assert.match(claimRoute, /disabled=\\{submitClaim\\.isPending\\}/);
assert.doesNotMatch(claimRoute, /disabled=\\{submitClaim\\.isPending \\|\\| !declaration\\}/);
assert.doesNotMatch(claimRoute, /verification detail/i);
assert.doesNotMatch(claimRoute, /Resubmit claim/i);
assert.doesNotMatch(claimRoute, /<textarea/);
for (const source of ["/claim-results", "/athlete-account"]) {
  const rule = vercelConfig.headers.find((entry) => entry.source === source);
  assert.ok(rule, "Missing no-store header rule for " + source);
  const cacheControl = rule.headers.find(
    (header) => header.key.toLowerCase() === "cache-control",
  );
  assert.match(cacheControl?.value ?? "", /no-store/);
}`,
  "claim button verification",
);
await writeFile(verifyPath, verification);
