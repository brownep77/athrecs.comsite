import {
  browserErrorCode,
  diagnosticRoute,
  type DiagnosticKind,
} from "./athrecs/access-diagnostics";

let sent = 0;
const seen = new Map<string, string>();
export function reportBrowserDiagnostic(kind: DiagnosticKind, error: unknown): string | null {
  if (typeof window === "undefined") return null;
  const code = browserErrorCode(error),
    route = diagnosticRoute(window.location.pathname);
  const key = `${kind}:${code}:${route}`;
  if (seen.has(key)) return seen.get(key) ?? null;
  if (sent >= 5) return null;
  const reference = globalThis.crypto?.randomUUID?.();
  if (!reference) return null;
  seen.set(key, reference);
  sent++;
  void fetch("/api/diagnostics", {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      kind,
      code,
      route,
      reference,
      online: navigator.onLine,
      viewport: innerWidth < 640 ? "small" : innerWidth < 1024 ? "medium" : "large",
    }),
  }).catch(() => {});
  return reference;
}
