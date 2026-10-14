import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, Palette } from "lucide-react";
import {
  HOMEPAGE_THEME_IDS,
  HOMEPAGE_THEME_KEY,
  HOMEPAGE_THEMES,
  homepageThemeStyle,
  homepageThemeIsDark,
  parseHomepageTheme,
  readHomepageTheme,
  saveHomepageTheme,
  type HomepageThemeId,
} from "@/lib/running/homepage-themes";
import "./homepage-appearance.css";

const HomepageThemeContext = createContext<{
  theme: HomepageThemeId;
  chooseTheme: (id: HomepageThemeId) => void;
} | null>(null);

export function useHomepageTheme() {
  return useContext(HomepageThemeContext)?.theme ?? "colourful";
}

export function HomepageAppearanceProvider({ children }: { children: ReactNode }) {
  // The server and first client render agree; browser preferences are read after hydration.
  const [theme, setTheme] = useState<HomepageThemeId>("coastal");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    try {
      if (window.localStorage.getItem(HOMEPAGE_THEME_KEY) !== null) {
        setTheme(readHomepageTheme(window.localStorage));
      }
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

  useEffect(() => {
    // Body backgrounds, native controls and portalled dialogs share the public theme.
    // Restore the prior document values when leaving the public shell.
    const element = document.documentElement;
    const previousTheme = element.getAttribute("data-site-theme");
    const variables = Object.entries(homepageThemeStyle(theme));
    const previousVariables = variables.map(([name]) => ({
      name,
      value: element.style.getPropertyValue(name),
      priority: element.style.getPropertyPriority(name),
    }));
    element.setAttribute("data-site-theme", theme);
    variables.forEach(([name, value]) => element.style.setProperty(name, String(value)));
    return () => {
      if (previousTheme === null) element.removeAttribute("data-site-theme");
      else element.setAttribute("data-site-theme", previousTheme);
      previousVariables.forEach(({ name, value, priority }) => {
        if (value) element.style.setProperty(name, value, priority);
        else element.style.removeProperty(name);
      });
    };
  }, [theme]);

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
  }

  return (
    <HomepageThemeContext.Provider value={{ theme, chooseTheme }}>
      <div
        className="site-appearance min-h-dvh bg-bg text-fg"
        data-site-theme={theme}
        data-colour-mode={homepageThemeIsDark(theme) ? "dark" : "light"}
        style={homepageThemeStyle(theme)}
      >
        {children}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </HomepageThemeContext.Provider>
  );
}

export function HomepageAppearance({ children }: { children: ReactNode }) {
  const theme = useHomepageTheme();
  return (
    <div
      className="homepage-appearance rounded-2xl p-3 sm:p-5"
      data-homepage-theme={theme}
      style={homepageThemeStyle(theme)}
    >
      {children}
    </div>
  );
}

export function HomepageColourPicker() {
  const appearance = useContext(HomepageThemeContext);
  const picker = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        picker.current &&
        event.target instanceof Node &&
        !picker.current.contains(event.target)
      ) {
        picker.current.open = false;
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && picker.current) {
        event.preventDefault();
        picker.current.open = false;
        picker.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (!appearance) return null;
  const { theme, chooseTheme } = appearance;

  function selectTheme(id: HomepageThemeId) {
    chooseTheme(id);
    if (picker.current) {
      picker.current.open = false;
      picker.current.querySelector("summary")?.focus();
    }
  }

  return (
    <details
      ref={picker}
      className="homepage-colour-picker group shrink-0"
      style={homepageThemeStyle(theme)}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary
        title={`Site colours: ${HOMEPAGE_THEMES[theme].label}`}
        className="flex size-11 cursor-pointer list-none items-center justify-center gap-0.5 rounded-xl border border-border bg-surface text-fg shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden"
      >
        <Palette className="size-5 text-accent" aria-hidden="true" />
        <span className="sr-only">Site colours</span>
        <ChevronDown className="size-3 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <fieldset className="absolute right-0 top-full z-50 mt-2 max-h-[calc(100dvh-12rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-border bg-surface p-3 shadow-xl sm:max-h-[calc(100dvh-8rem)] lg:max-h-[calc(100dvh-6rem)]">
        <legend className="px-2 text-sm font-semibold text-fg">Preview 30 colour schemes</legend>
        <p className="mb-3 px-2 text-xs leading-5 text-muted">
          Colours apply across the site, including menus. Current colours shows the original.
        </p>
        <div className="grid gap-2">
          {HOMEPAGE_THEME_IDS.map((id) => {
            const option = HOMEPAGE_THEMES[id];
            return (
              <button
                key={id}
                type="button"
                aria-pressed={theme === id}
                onClick={() => selectTheme(id)}
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
  );
}
