import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/athrecs/seo";

export function ShareProfileButton({
  path,
  title,
  compact = false,
}: {
  path: string;
  title: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const url = path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const shareTitle = title.trim() || "ATHRECS athlete profile";
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${shareTitle} on ATHRECS`);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this profile link", url);
    }
  }

  async function nativeShare() {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title: shareTitle, text: `${shareTitle} on ATHRECS`, url });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copyLink();
    }
  }

  return (
    <div className={compact ? "flex flex-wrap items-center gap-2" : "space-y-3"}>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size={compact ? "sm" : "default"} onClick={() => void nativeShare()}>
          <Share2 className="size-4" aria-hidden="true" />
          Share
        </Button>
        <Button type="button" variant="secondary" size={compact ? "sm" : "default"} onClick={() => void copyLink()}>
          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
      {!compact ? (
        <div className="flex flex-wrap gap-2 text-xs">
          <a
            href={`https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 font-medium text-accent no-underline hover:underline"
          >
            Share on X
          </a>
          <a
            href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 font-medium text-accent no-underline hover:underline"
          >
            WhatsApp
          </a>
          <a
            href={`mailto:?subject=${encodedText}&body=${encodedUrl}`}
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 font-medium text-accent no-underline hover:underline"
          >
            Email
          </a>
        </div>
      ) : null}
    </div>
  );
}
