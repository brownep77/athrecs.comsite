#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const repositoryRoot = resolve(process.argv[2] ?? ".");
const apiPath = resolve(repositoryRoot, "src/lib/athrecs/api.ts");
let source;
try {
  source = await readFile(apiPath, "utf8");
} catch (error) {
  console.error(`Cannot read ${apiPath}:`, error instanceof Error ? error.message : error);
  process.exit(1);
}

const original = source;
const authImport = 'import { authMiddleware } from "@/lib/auth/middleware";';
const roleImport = 'import { requirePlatformRole } from "./access.server";';

if (!source.includes(authImport)) {
  const anchor = 'import { getSql, dbSource } from "@/lib/db";';
  if (!source.includes(anchor)) {
    throw new Error("Could not find the expected database import in src/lib/athrecs/api.ts");
  }
  source = source.replace(anchor, `${anchor}\n${authImport}\n${roleImport}`);
} else if (!source.includes(roleImport)) {
  source = source.replace(authImport, `${authImport}\n${roleImport}`);
}

const protectedExports = ["importFromCsv", "importFromJson", "importResults"];
for (const exportName of protectedExports) {
  const start = source.indexOf(`export const ${exportName} = createServerFn`);
  if (start < 0) {
    throw new Error(`Could not find ${exportName} in src/lib/athrecs/api.ts`);
  }
  const next = source.indexOf("\nexport const ", start + 1);
  const end = next < 0 ? source.length : next;
  let block = source.slice(start, end);

  if (!block.includes(".middleware([authMiddleware])")) {
    const firstLineEnd = block.indexOf("\n");
    if (firstLineEnd < 0) throw new Error(`Could not parse ${exportName}`);
    block = `${block.slice(0, firstLineEnd + 1)}  .middleware([authMiddleware])\n${block.slice(firstLineEnd + 1)}`;
  }

  if (!block.includes("requirePlatformRole(context.userId")) {
    const handler = ".handler(async ({ data }) => {";
    if (!block.includes(handler)) {
      throw new Error(`Could not find the expected handler in ${exportName}`);
    }
    block = block.replace(
      handler,
      `.handler(async ({ data, context }) => {\n    await requirePlatformRole(context.userId, [\n      "super_admin",\n      "admin",\n      "data_steward",\n    ]);`,
    );
  }

  source = `${source.slice(0, start)}${block}${source.slice(end)}`;
}

if (source === original) {
  console.log("Legacy import API was already protected; no change needed.");
} else {
  await writeFile(apiPath, source, "utf8");
  console.log("Protected legacy event/result imports with authenticated Athrecs staff roles.");
}
