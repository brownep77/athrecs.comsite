import { createHash } from "node:crypto";
import registryCsv from "../../../docs/source-registry/fixture-result-sources.csv?raw";
import {
  buildBulkSourceJobManifest,
  parseFixtureSourceRegistry,
  summarizeFixtureSourceRegistry,
} from "./source-registry";

let registryCache: ReturnType<typeof parseFixtureSourceRegistry> | undefined;

export function getFixtureSourceRegistry() {
  registryCache ??= parseFixtureSourceRegistry(registryCsv);
  return registryCache;
}

export function getFixtureSourceRegistryHash(): string {
  return createHash("sha256")
    .update(registryCsv.replace(/^\uFEFF/, ""))
    .digest("hex");
}

export function getBulkSourceJobManifest() {
  return buildBulkSourceJobManifest(getFixtureSourceRegistry());
}

export function getFixtureSourceRegistrySummary() {
  return {
    registryHash: getFixtureSourceRegistryHash(),
    ...summarizeFixtureSourceRegistry(getBulkSourceJobManifest()),
  };
}

export type { BulkSourceJobManifest, FixtureSource } from "./source-registry";
