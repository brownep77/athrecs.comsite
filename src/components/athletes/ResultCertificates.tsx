import { useId, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBearerToken } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

type Certificate = {
  id: string;
  filename: string;
  byteSize: number;
  uploadedAt: string;
  sha256: string;
};
async function certificateRequest(url: string, options: RequestInit = {}) {
  const token = getBearerToken();
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: { ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || "Certificates are temporarily unavailable. Please try again.");
  }
  return response;
}

/** Private account and authorised staff views only; never mount on a shared profile. */
export function ResultCertificates({
  resultId,
  staff = false,
}: {
  resultId: number;
  staff?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const inputId = useId();
  const client = useQueryClient();
  const endpoint = `/api/result-certificates?result=${resultId}${staff ? "&staff=1" : ""}`;
  const queryKey = ["result-certificates", resultId, staff];
  const certificates = useQuery<{ certificates: Certificate[]; limit: number }>({
    queryKey,
    queryFn: async () => (await certificateRequest(endpoint)).json(),
    enabled: open,
    staleTime: 30_000,
    retry: false,
  });
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save the change.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="max-w-md space-y-2 text-left text-xs">
      <Button
        size="sm"
        variant="secondary"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        Certificates
      </Button>
      {open ? (
        <section
          className="space-y-3 rounded-lg border border-border bg-surface p-3"
          aria-label="Race certificates"
        >
          <p>
            Private certificates for this result. Only you and authorised AthRecs staff can access
            them.
          </p>
          {!staff ? (
            <p>
              Adding a certificate does not verify the result. Use “Verify result” to request a
              check.
            </p>
          ) : null}
          {certificates.isPending ? (
            <p role="status">Loading certificates…</p>
          ) : certificates.isError ? (
            <div role="alert">
              <p>Certificates could not load.</p>
              <Button size="sm" variant="secondary" onClick={() => void certificates.refetch()}>
                Try again
              </Button>
            </div>
          ) : certificates.data?.certificates.length ? (
            <ul className="space-y-3">
              {certificates.data.certificates.map((certificate) => (
                <li key={certificate.id} className="space-y-1 break-words">
                  <p className="font-semibold">{certificate.filename}</p>
                  <p>
                    {Math.ceil(certificate.byteSize / 1024)} KB ·{" "}
                    {new Date(certificate.uploadedAt).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() =>
                        void run(async () => {
                          const response = await certificateRequest(
                            `${endpoint}&certificate=${certificate.id}`,
                          );
                          const objectUrl = URL.createObjectURL(await response.blob());
                          const anchor = document.createElement("a");
                          anchor.href = objectUrl;
                          anchor.download = certificate.filename;
                          document.body.append(anchor);
                          anchor.click();
                          anchor.remove();
                          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
                        })
                      }
                    >
                      Download
                    </Button>
                    {!staff ? (
                      removeId === certificate.id ? (
                        <>
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              void run(async () => {
                                await certificateRequest(
                                  `${endpoint}&certificate=${certificate.id}`,
                                  { method: "DELETE" },
                                );
                                setRemoveId(null);
                                await client.invalidateQueries({ queryKey });
                                setMessage("Certificate removed.");
                              })
                            }
                          >
                            Confirm removal
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => setRemoveId(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busy}
                          onClick={() => setRemoveId(certificate.id)}
                        >
                          Remove
                        </Button>
                      )
                    ) : null}
                  </div>
                  {staff ? (
                    <p className="break-all text-muted">SHA-256: {certificate.sha256}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>No certificates saved for this result yet.</p>
          )}
          {!staff ? (
            <div className="space-y-1">
              <label htmlFor={inputId} className="block font-semibold">
                Add certificate
              </label>
              <input
                id={inputId}
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                disabled={busy || (certificates.data?.certificates.length ?? 0) >= 5}
                className="block max-w-full min-h-11 text-xs"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  void run(async () => {
                    if (file.size > 2 * 1024 * 1024)
                      throw new Error("Certificates must be 2 MB or smaller.");
                    const body = new FormData();
                    body.append("certificate", file);
                    await certificateRequest(endpoint, { method: "POST", body });
                    await client.invalidateQueries({ queryKey });
                    setMessage("Certificate saved privately.");
                  });
                }}
              />
              <p>PDF, JPEG, PNG or WebP, up to 2 MB. Up to 5 per result.</p>
            </div>
          ) : null}
          {busy ? <p role="status">Working…</p> : null}
          {message ? <p role="status">{message}</p> : null}
        </section>
      ) : null}
    </div>
  );
}
