import type { CSSProperties } from "react";

export const HOMEPAGE_THEME_KEY = "athrecs.homepage-colours.v1";
export const HOMEPAGE_THEME_IDS = [
  "colourful",
  "coastal",
  "sage",
  "navy",
  "plum",
  "midnight",
] as const;
export type HomepageThemeId = (typeof HOMEPAGE_THEME_IDS)[number];

type Tone = { background: string; accent: string; text: string };
type Theme = {
  label: string;
  page: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  brand: string;
  brandText: string;
  soft: string;
  country: string;
  tones: readonly [Tone, Tone, Tone];
};

export const HOMEPAGE_THEMES: Record<HomepageThemeId, Theme> = {
  colourful: {
    label: "Current colours",
    page: "#ffffff",
    surface: "#ffffff",
    text: "#2d3439",
    muted: "#5a6369",
    border: "#cfdee3",
    brand: "#087f8c",
    brandText: "#ffffff",
    soft: "#d9f3f7",
    country: "#ffffff",
    tones: [
      { background: "#dceaff", accent: "#2c4d76", text: "#0f172a" },
      { background: "#def2e5", accent: "#275d43", text: "#0f172a" },
      { background: "#e8def8", accent: "#5a3e7e", text: "#0f172a" },
    ],
  },
  coastal: {
    label: "Coastal Calm",
    page: "#f3f7f7",
    surface: "#ffffff",
    text: "#19343b",
    muted: "#536b72",
    border: "#d7e3e5",
    brand: "#176b70",
    brandText: "#ffffff",
    soft: "#e3eeef",
    country: "#ffffff",
    tones: [
      { background: "#dcefeb", accent: "#226a5c", text: "#193e36" },
      { background: "#e4edf7", accent: "#325e87", text: "#253d58" },
      { background: "#f4eddd", accent: "#7c6530", text: "#57492b" },
    ],
  },
  sage: {
    label: "Sage & Sand",
    page: "#f6f3ec",
    surface: "#fffdf8",
    text: "#343b31",
    muted: "#62695c",
    border: "#deded1",
    brand: "#4c6651",
    brandText: "#ffffff",
    soft: "#e7eddf",
    country: "#f0efe5",
    tones: [
      { background: "#e1e9d9", accent: "#486247", text: "#344530" },
      { background: "#f0e5ca", accent: "#7a6236", text: "#51442c" },
      { background: "#efddd1", accent: "#80553e", text: "#5e4235" },
    ],
  },
  navy: {
    label: "Navy & Copper",
    page: "#f1f4f8",
    surface: "#ffffff",
    text: "#1d2f49",
    muted: "#5c6c80",
    border: "#d8e0e9",
    brand: "#234b76",
    brandText: "#ffffff",
    soft: "#e5edf6",
    country: "#ffffff",
    tones: [
      { background: "#1d3656", accent: "#c3d8f2", text: "#ffffff" },
      { background: "#dfebf8", accent: "#2b5886", text: "#203e5c" },
      { background: "#f3e1d3", accent: "#8a5733", text: "#5f4029" },
    ],
  },
  plum: {
    label: "Plum & Blush",
    page: "#f7f4f7",
    surface: "#fffdfd",
    text: "#3f3049",
    muted: "#706075",
    border: "#e5dbe6",
    brand: "#765284",
    brandText: "#ffffff",
    soft: "#eee4f1",
    country: "#f1eaf4",
    tones: [
      { background: "#e9dff2", accent: "#715083", text: "#493456" },
      { background: "#f4e0e6", accent: "#8a4f64", text: "#603d4b" },
      { background: "#f4edde", accent: "#796432", text: "#584b31" },
    ],
  },
  midnight: {
    label: "Midnight & Mint",
    page: "#101e29",
    surface: "#152734",
    text: "#edf5f7",
    muted: "#b0c3cd",
    border: "#304653",
    brand: "#a4e6ce",
    brandText: "#101e29",
    soft: "#253d47",
    country: "#192e3b",
    tones: [
      { background: "#21483f", accent: "#aaebce", text: "#eefcf5" },
      { background: "#233d57", accent: "#b5d7f8", text: "#edf6ff" },
      { background: "#413c51", accent: "#d7c2ee", text: "#f4edfc" },
    ],
  },
};

export function parseHomepageTheme(value: unknown): HomepageThemeId {
  return typeof value === "string" && HOMEPAGE_THEME_IDS.includes(value as HomepageThemeId)
    ? (value as HomepageThemeId)
    : "colourful";
}

export function readHomepageTheme(storage?: Pick<Storage, "getItem">): HomepageThemeId {
  try {
    return parseHomepageTheme(storage?.getItem(HOMEPAGE_THEME_KEY));
  } catch {
    return "colourful";
  }
}

export function saveHomepageTheme(
  storage: Pick<Storage, "setItem"> | undefined,
  id: HomepageThemeId,
): boolean {
  try {
    if (!storage) return false;
    storage.setItem(HOMEPAGE_THEME_KEY, parseHomepageTheme(id));
    return true;
  } catch {
    return false;
  }
}

type ThemeStyle = CSSProperties & { [key: `--${string}`]: string };

export function homepageThemeStyle(id: HomepageThemeId): ThemeStyle {
  if (id === "colourful") return {};
  const theme = HOMEPAGE_THEMES[id];
  return {
    "--color-bg": theme.page,
    "--color-surface": theme.surface,
    "--color-elevated": theme.soft,
    "--color-fg": theme.text,
    "--color-muted": theme.muted,
    "--color-subtle": theme.muted,
    "--color-border": theme.border,
    "--color-border-strong": theme.brand,
    "--color-accent": theme.brand,
    "--color-accent-soft": theme.soft,
    "--color-primary": theme.brand,
    "--color-primary-fg": theme.brandText,
  };
}

export function homepageCardStyle(
  id: HomepageThemeId,
  original: CSSProperties,
  kind: "tone" | "surface" | "country" = "surface",
  toneIndex: 0 | 1 | 2 = 0,
): ThemeStyle {
  if (id === "colourful") return { ...original };
  const theme = HOMEPAGE_THEMES[id];
  const tone = kind === "tone" ? theme.tones[toneIndex] : undefined;
  return {
    ...original,
    background: tone?.background ?? (kind === "country" ? theme.country : theme.surface),
    borderColor: theme.border,
    color: tone?.accent ?? theme.brand,
    "--homepage-card-heading": tone?.text ?? theme.text,
    "--homepage-card-copy": tone?.text ?? theme.muted,
    "--homepage-icon-background": tone?.background ?? theme.surface,
  };
}
