import { describeClientDevice } from "./client-data";

export const diagnosticKinds = [
  "page_error",
  "script_error",
  "unhandled_rejection",
  "network_error",
  "data_error",
  "data_query_error",
  "data_mutation_error",
] as const;
export type DiagnosticKind = (typeof diagnosticKinds)[number];
export const browserErrorCodes = [
  "Error",
  "TypeError",
  "ReferenceError",
  "SyntaxError",
  "RangeError",
  "ChunkLoadError",
  "NetworkError",
  "UnknownError",
] as const;
export function browserErrorCode(error: unknown): (typeof browserErrorCodes)[number] {
  // RPC errors and errors from another browser realm need not pass instanceof.
  // Copy only an allowlisted name, never arbitrary messages or stack traces.
  try {
    const name = error && typeof error === "object" ? (error as { name?: unknown }).name : null;
    return browserErrorCodes.find((code) => code === name) ?? "UnknownError";
  } catch {
    // A thrown accessor/proxy must not make diagnostic reporting throw too.
    return "UnknownError";
  }
}

/** Route families only: never retain athlete names, email, tokens, query or hash. */
export function diagnosticRoute(path: string): string {
  const clean = path.split(/[?#]/, 1)[0];
  if (clean === "/") return "/";
  const parts = clean.split("/").filter(Boolean);
  const allowed = new Set([
    "account",
    "athlete-account",
    "my-athlete-profile",
    "my-race-calendar",
    "athletes",
    "athlete-results",
    "claim",
    "claim-results",
    "review-results",
    "claim-profile",
    "running",
    "triathlon",
    "duathlon",
    "cycling",
    "swimming",
    "clubs",
    "races",
    "results",
    "admin",
    "privacy",
    "sign-in",
    "sign-up",
    "reset-password",
    "verify-email",
    "auth",
    "en",
    "fr",
    "es",
    "de",
    "it",
    "pt",
    "ar",
    "zh",
  ]);
  const first = parts[0];
  return allowed.has(first) ? `/${first}${parts.length > 1 ? "/:page" : ""}` : "/:page";
}

export function diagnosticDevice(ua: string | null) {
  const device = describeClientDevice(ua);
  const patterns: Record<string, RegExp> = {
    Edge: /Edg(?:e|A|iOS)?\/(\d+(?:\.\d+){0,3})/,
    Opera: /(?:OPR|Opera)\/(\d+(?:\.\d+){0,3})/,
    "Samsung Internet": /SamsungBrowser\/(\d+(?:\.\d+){0,3})/,
    Firefox: /(?:Firefox|FxiOS)\/(\d+(?:\.\d+){0,3})/,
    Chrome: /(?:Chrome|CriOS)\/(\d+(?:\.\d+){0,3})/,
    Safari: /Version\/(\d+(?:\.\d+){0,3})/,
  };
  const match = (ua ?? "").slice(0, 1024).match(patterns[device.browser] ?? /(?!) /);
  return { ...device, browserVersion: match?.[1] ?? null };
}

export type AccessFilters = {
  q: string;
  page: number;
  days: number;
  outcome: "all" | "success" | "failed" | "error" | "info";
  device: string;
  browser: string;
  view: "events" | "sessions";
};
export type AccessEvent = ReturnType<typeof diagnosticDevice> & {
  id: string;
  at: string;
  name: string;
  email: string | null;
  identity: "account" | "entered" | "anonymous";
  kind: string;
  outcome: string;
  errorCode: string | null;
  requestId: string | null;
  host: string | null;
  route: string | null;
  method: string | null;
  location: string;
  durationMs: number | null;
  httpStatus: number | null;
  releaseId: string | null;
  deviceNumber: string | null;
  recovered: boolean;
  source: string;
  online: boolean | null;
  viewport: string | null;
  expiresAt: string | null;
};
