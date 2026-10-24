import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SessionCheckError({ onRetry }: { onRetry: () => Promise<void> }) {
  const [retrying, setRetrying] = useState(false);

  async function retry() {
    setRetrying(true);
    try {
      await onRetry();
    } catch {
      // The session state retains the failure so the visitor can retry again.
    } finally {
      setRetrying(false);
    }
  }

  return (
    <section
      role="alert"
      className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-7 text-center shadow-card"
    >
      <h2 className="font-display text-2xl font-semibold text-fg">
        We couldn’t check your sign-in
      </h2>
      <p className="mt-3 text-sm text-muted">
        You may still be signed in. Please try checking again.
      </p>
      <Button type="button" className="mt-5" disabled={retrying} onClick={() => void retry()}>
        {retrying ? "Checking…" : "Try again"}
      </Button>
    </section>
  );
}
