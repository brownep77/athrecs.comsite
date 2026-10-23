import { useEffect } from "react";
import { reportBrowserDiagnostic } from "@/lib/browser-diagnostics";

export function BrowserDiagnostics() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportBrowserDiagnostic("script_error", event.error);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      reportBrowserDiagnostic("unhandled_rejection", event.reason);
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
