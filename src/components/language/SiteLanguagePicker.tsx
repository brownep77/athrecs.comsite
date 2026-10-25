import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ExternalLink, Search, X } from "lucide-react";
import {
  TRANSLATION_LANGUAGES,
  matchingTranslationLanguages,
  publicTranslationUrl,
  translatedPageUrl,
} from "@/lib/athrecs/site-translation";

export function SiteLanguagePicker({ pathname }: { pathname: string }) {
  const picker = useRef<HTMLDetailsElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchId = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const languages = matchingTranslationLanguages(search);

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
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
        if (!event.currentTarget.open) setSearch("");
      }}
    >
      <summary
        title="Language / Translate this page"
        className="flex h-11 cursor-pointer list-none items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-2 text-fg shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden"
      >
        <span className="text-lg leading-none" aria-hidden="true">
          🇬🇧
        </span>
        <span className="text-xs font-semibold" aria-hidden="true">
          EN
        </span>
        <span className="sr-only">English / Choose translation language</span>
        <ChevronDown className="size-3 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="absolute right-0 top-full z-50 mt-2 flex max-h-[calc(100dvh-8rem)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface p-3 shadow-xl lg:max-h-[calc(100dvh-6rem)]">
        <div className="shrink-0 px-2">
          <p className="text-sm font-semibold text-fg">Choose a language</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Translations open in a new tab using Google Translate. English opens the original page.
          </p>
          <label htmlFor={searchId} className="sr-only">
            Search languages
          </label>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-bg px-3 focus-within:ring-2 focus-within:ring-accent">
            <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
            <input
              ref={searchInput}
              id={searchId}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search languages…"
              autoComplete="off"
              spellCheck={false}
              className="h-11 min-w-0 flex-1 bg-transparent text-base text-fg outline-none sm:text-sm [&::-webkit-search-cancel-button]:hidden"
            />
            {search ? (
              <button
                type="button"
                aria-label="Clear language search"
                onClick={() => {
                  setSearch("");
                  searchInput.current?.focus();
                }}
                className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-muted" role="status" aria-live="polite">
            {languages.length} of {TRANSLATION_LANGUAGES.length} languages
          </p>
        </div>
        <ul
          className="mt-2 grid shrink-0 gap-1"
          aria-label="Page translation languages"
        >
          {languages.map(({ code, flag, label, englishLabel }) => (
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
                <span className="shrink-0 text-lg leading-none" aria-hidden="true">
                  {flag}
                </span>
                <span className="w-6 shrink-0 text-xs font-semibold text-muted" aria-hidden="true">
                  {code.split("-")[0].toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <bdi
                    lang={code === "pt" ? "pt-PT" : code}
                    dir={code === "ar" ? "rtl" : "auto"}
                    className="block break-words font-semibold"
                  >
                    {label}
                  </bdi>
                  <span className="block text-xs text-muted">
                    {code === "en" ? "Original" : englishLabel}
                  </span>
                </span>
                {code === "en" ? null : (
                  <ExternalLink className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
                )}
              </a>
            </li>
          ))}
        </ul>
        {languages.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted">
            No languages found. Try another name or code.
          </p>
        ) : null}
      </div>
    </details>
  );
}
