import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, Languages } from "lucide-react";
import {
  TRANSLATION_LANGUAGES,
  publicTranslationUrl,
  translatedPageUrl,
} from "@/lib/athrecs/site-translation";

export function SiteLanguagePicker({ pathname }: { pathname: string }) {
  const picker = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (picker.current) picker.current.open = false;
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (
        picker.current &&
        event.target instanceof Node &&
        !picker.current.contains(event.target)
      ) {
        picker.current.open = false;
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && picker.current) {
        event.preventDefault();
        picker.current.open = false;
        picker.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  if (!publicTranslationUrl(pathname)) return null;

  return (
    <details
      ref={picker}
      className="site-language-picker group shrink-0"
      translate="no"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary
        title="Language / Translate this page"
        className="flex size-11 cursor-pointer list-none items-center justify-center gap-0.5 rounded-xl border border-border bg-surface text-fg shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden"
      >
        <Languages className="size-5 text-accent" aria-hidden="true" />
        <span className="sr-only">Language / Translate this page</span>
        <ChevronDown className="size-3 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="absolute right-0 top-full z-50 mt-2 max-h-[calc(100dvh-12rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-border bg-surface p-3 shadow-xl sm:max-h-[calc(100dvh-8rem)] lg:max-h-[calc(100dvh-6rem)]">
        <p className="px-2 text-sm font-semibold text-fg">Choose a language</p>
        <p className="mt-1 px-2 text-xs leading-5 text-muted">
          Translations open in a new tab using Google Translate. English opens the original page.
        </p>
        <ul className="mt-2 grid gap-1" aria-label="Page translation languages">
          {TRANSLATION_LANGUAGES.map(({ code, label, englishLabel }) => (
            <li key={code}>
              <a
                href={translatedPageUrl(pathname, code) ?? undefined}
                target={code === "en" ? undefined : "_blank"}
                rel={code === "en" ? undefined : "noopener noreferrer nofollow"}
                referrerPolicy="no-referrer"
                onClick={() => {
                  if (picker.current) {
                    picker.current.open = false;
                    picker.current.querySelector("summary")?.focus();
                  }
                }}
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm text-fg no-underline hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span lang={code} className="flex-1 font-semibold">
                  {label}
                </span>
                <span className="text-xs text-muted">
                  {code === "en" ? "Original" : englishLabel}
                </span>
                {code === "en" ? null : (
                  <ExternalLink className="size-3.5 text-muted" aria-hidden="true" />
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
