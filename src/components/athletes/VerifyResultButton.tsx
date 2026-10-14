import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyResultVerificationRequests,
  requestResultVerification,
} from "@/lib/athrecs/result-verification-api";
import { evidenceUrl } from "@/lib/athrecs/result-verification";
import { Button } from "@/components/ui/button";

export function VerifyResultButton({
  resultKey,
  verified,
  expectedVersion,
}: {
  resultKey: string;
  verified: boolean;
  expectedVersion?: string;
}) {
  const client = useQueryClient();
  const [open, setOpen] = useState(false),
    [note, setNote] = useState(""),
    [url, setUrl] = useState(""),
    [message, setMessage] = useState("");
  const requests = useQuery({
    queryKey: ["my-result-verification-requests"],
    queryFn: () => getMyResultVerificationRequests(),
    enabled: !verified,
    staleTime: 15000,
    refetchInterval: 30000,
  });
  const request = requests.data?.find((r) => r.key === resultKey);
  useEffect(() => {
    if (request?.status !== "approved" || verified) return;
    for (const queryKey of [
      ["my-athlete-account"],
      ["my-athlete-bio"],
      ["athlete-workspace"],
      ["managed-performance-history"],
    ]) {
      void client.invalidateQueries({ queryKey });
    }
  }, [client, request?.status, verified]);
  const submit = useMutation({
    mutationFn: () =>
      requestResultVerification({
        data: { key: resultKey, expectedVersion, note, evidenceUrl: url.trim() },
      }),
    onSuccess: async (result) => {
      setMessage(result.message);
      setOpen(false);
      await client.invalidateQueries({ queryKey: ["my-result-verification-requests"] });
    },
    onError: (error) =>
      setMessage(
        error instanceof Error ? error.message : "The request was not saved. Please try again.",
      ),
  });
  if (verified) return null;
  return (
    <div className="max-w-sm space-y-2 text-left text-xs">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={submit.isPending || requests.isPending || request?.status === "pending"}
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          setMessage("");
        }}
      >
        {request?.status === "pending" ? "Verification requested" : "Verify result"}
      </Button>
      {request?.message ? (
        <p className="whitespace-pre-wrap break-words">{request.message}</p>
      ) : null}
      {request?.status === "needs_info" ? (
        <p>More information needed. Add it below and resubmit.</p>
      ) : request?.status === "rejected" ? (
        <p>Request declined. You can submit further evidence.</p>
      ) : null}
      {requests.isError ? (
        <p role="alert">Request status could not load. You can still submit a check.</p>
      ) : null}
      {open ? (
        <div className="space-y-3 rounded-lg border border-border bg-surface p-3">
          <p>
            Ask AthRecs staff to check this result. It stays unverified until the evidence is
            reviewed.
          </p>
          <label className="block">
            Result link (optional)
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              maxLength={2000}
              placeholder="https://…"
              className="mt-1 min-h-11 w-full rounded border p-2"
            />
          </label>
          <label className="block">
            Note or bib number (optional)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={2000}
              rows={3}
              className="mt-1 w-full rounded border p-2"
            />
          </label>
          {url.trim() && !evidenceUrl.safeParse(url.trim()).success ? (
            <p role="alert">Use a complete HTTPS result link.</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={submit.isPending || !evidenceUrl.safeParse(url.trim()).success}
              onClick={() => submit.mutate()}
            >
              {submit.isPending ? "Sending…" : "Request verification"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={submit.isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
      {message ? (
        <p role="status" className="whitespace-pre-wrap break-words">
          {message}
        </p>
      ) : null}
    </div>
  );
}
