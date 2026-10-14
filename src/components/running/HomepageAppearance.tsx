import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, Palette } from "lucide-react";
import {
  HOMEPAGE_THEME_IDS,
  HOMEPAGE_THEME_KEY,
  HOMEPAGE_THEMES,
  homepageThemeStyle,
  parseHomepageTheme,
  readHomepageTheme,
  saveHomepageTheme,
  type HomepageThemeId,
} from "@/lib/running/homepage-themes";
import "./homepage-appearance.css";

const HomepageThemeContext = createContext<HomepageThemeId>("colourful");

export function useHomepageTheme() {
  return useContext(HomepageThemeContext);
}

export function HomepageAppearance({ children }: { children: ReactNode }) {
  // The server and first client render agree; browser preferences are read after hydration.
  const [theme, setTheme] = useState<HomepageThemeId>("colourful");
  const [announcement, setAnnouncement] = useState("");
  const picker = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    try {
      setTheme(readHomepageTheme(window.localStorage));
    } catch {
      // Some browsers block access to localStorage itself. The picker still works.
    }
    const syncPreference = (event: StorageEvent) => {
      if (event.key === HOMEPAGE_THEME_KEY || event.key === null) {
        setTheme(parseHomepageTheme(event.newValue));
      }
    };
    window.addEventListener("storage", syncPreference);
    return () => window.removeEventListener("storage", syncPreference);
  }, []);

  function chooseTheme(id: HomepageThemeId) {
    setTheme(id);
    let saved = false;
    try {
      saved = saveHomepageTheme(window.localStorage, id);
    } catch {
      // A blocked preference store must not prevent a colour change for this visit.
    }
    setAnnouncement(
      `${HOMEPAGE_THEMES[id].label} selected.${saved ? " Saved on this device." : " Applied for this visit."}`,
    );
    if (picker.current) {
      picker.current.open = false;
      picker.current.querySelector("summary")?.focus();
    }
  }

  return (
    <HomepageThemeContext.Provider value={theme}>
      <div
        className="homepage-appearance rounded-2xl p-3 sm:p-5"
        data-homepage-theme={theme}
        style={homepageThemeStyle(theme)}
      >
        <details ref={picker} className="group mb-5">
          <summary className="ml-auto flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-fg shadow-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
            <Palette className="size-4 text-accent" aria-hidden="true" />
            <span>Page colours</span>
            <span className="hidden font-normal text-muted sm:inline">
              · {HOMEPAGE_THEMES[theme].label}
            </span>
            <ChevronDown className="size-4 group-open:rotate-180" aria-hidden="true" />
          </summary>
          <fieldset className="mt-3 rounded-xl border border-border bg-surface p-3 sm:p-4">
            <legend className="px-2 text-sm font-semibold text-fg">
              Choose your colour scheme
            </legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {HOMEPAGE_THEME_IDS.map((id) => {
                const option = HOMEPAGE_THEMES[id];
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={theme === id}
                    onClick={() => chooseTheme(id)}
                    className="flex min-h-14 items-center gap-3 rounded-lg border border-border px-3 py-3 text-left text-sm font-semibold text-fg hover:bg-elevated aria-pressed:border-accent aria-pressed:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <span className="flex shrink-0 -space-x-1" aria-hidden="true">
                      {option.tones.map((tone, index) => (
                        <span
                          key={index}
                          className="size-5 rounded-full border"
                          style={{ background: tone.background, borderColor: option.border }}
                        />
                      ))}
                    </span>
                    <span className="flex-1">{option.label}</span>
                    {theme === id ? (
                      <Check className="size-4 shrink-0 text-accent" aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </details>
        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
        {children}
      </div>
    </HomepageThemeContext.Provider>
  );
}
