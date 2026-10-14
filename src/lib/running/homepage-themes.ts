import type { CSSProperties } from "react";

// Isolated review branch: these choices do not change the live site's preferences.
export const HOMEPAGE_THEME_KEY = "athrecs.homepage-colours.preview.v1";
export const HOMEPAGE_THEME_IDS = [
  "colourful",
  "coastal",
  "harbour-blue",
  "sage",
  "navy",
  "ocean-coral",
  "lavender-seafoam",
  "forest-apricot",
  "ink-ice",
  "plum",
  "midnight",
  "carbon-cream",
  "cobalt-chalk",
  "teal-studio",
  "sandstone",
  "espresso-oat",
  "citrus-slate",
  "terracotta-sky",
  "aubergine-gold",
  "atlantic-saffron",
  "peacock",
  "seaside-sorbet",
  "festival-pastels",
  "nordic-meadow",
  "alpine-air",
  "coral-ink",
  "primary-colours",
  "ruby-rose",
  "graphite-lime",
  "nightfall-amber",
  "aurora-after-dark",
] as const;
export type HomepageThemeId = (typeof HOMEPAGE_THEME_IDS)[number];

type Tone = { background: string; accent: string; text: string; copy?: string };
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
  countryTones?: readonly [Tone, Tone, Tone];
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
    page: "#F7F9FC",
    surface: "#FFFFFF",
    text: "#17324D",
    muted: "#4D6277",
    border: "#DCE5EC",
    brand: "#077885",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#EAF3FF",
    tones: [
      {
        background: "#EAF3FF",
        accent: "#245A8A",
        text: "#17324D",
        copy: "#4D6277",
      },
      {
        background: "#E5F4EF",
        accent: "#25634F",
        text: "#17324D",
        copy: "#4D6277",
      },
      {
        background: "#FFF0E5",
        accent: "#8A4B25",
        text: "#17324D",
        copy: "#4D6277",
      },
    ],
    countryTones: [
      {
        background: "#EAF3FF",
        accent: "#17324D",
        text: "#17324D",
        copy: "#4D6277",
      },
      {
        background: "#E5F4EF",
        accent: "#17324D",
        text: "#17324D",
        copy: "#4D6277",
      },
      {
        background: "#FFF0E5",
        accent: "#17324D",
        text: "#17324D",
        copy: "#4D6277",
      },
    ],
  },
  "harbour-blue": {
    label: "Harbour Blue",
    page: "#F5F8FD",
    surface: "#FFFFFF",
    text: "#15304F",
    muted: "#4B627B",
    border: "#D8E3F0",
    brand: "#245BC4",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#E4EFFF",
    tones: [
      {
        background: "#E4EFFF",
        accent: "#244F87",
        text: "#15304F",
        copy: "#4B627B",
      },
      {
        background: "#E9F4FA",
        accent: "#27647A",
        text: "#15304F",
        copy: "#4B627B",
      },
      {
        background: "#EEF0FA",
        accent: "#4D5282",
        text: "#15304F",
        copy: "#4B627B",
      },
    ],
    countryTones: [
      {
        background: "#E4EFFF",
        accent: "#15304F",
        text: "#15304F",
        copy: "#4B627B",
      },
      {
        background: "#E9F4FA",
        accent: "#15304F",
        text: "#15304F",
        copy: "#4B627B",
      },
      {
        background: "#EEF0FA",
        accent: "#15304F",
        text: "#15304F",
        copy: "#4B627B",
      },
    ],
  },
  sage: {
    label: "Sage & Sand",
    page: "#FAF8F3",
    surface: "#FFFEFA",
    text: "#293D35",
    muted: "#56675E",
    border: "#DDDCD0",
    brand: "#3F6753",
    brandText: "#FFFFFF",
    soft: "#FFFEFA",
    country: "#E7EEE1",
    tones: [
      {
        background: "#E7EEE1",
        accent: "#425D36",
        text: "#293D35",
        copy: "#56675E",
      },
      {
        background: "#F1E9D8",
        accent: "#766034",
        text: "#293D35",
        copy: "#56675E",
      },
      {
        background: "#ECE6DF",
        accent: "#695243",
        text: "#293D35",
        copy: "#56675E",
      },
    ],
    countryTones: [
      {
        background: "#E7EEE1",
        accent: "#293D35",
        text: "#293D35",
        copy: "#56675E",
      },
      {
        background: "#F1E9D8",
        accent: "#293D35",
        text: "#293D35",
        copy: "#56675E",
      },
      {
        background: "#ECE6DF",
        accent: "#293D35",
        text: "#293D35",
        copy: "#56675E",
      },
    ],
  },
  navy: {
    label: "Navy & Copper",
    page: "#F8F7F5",
    surface: "#FFFFFF",
    text: "#1B2D44",
    muted: "#566273",
    border: "#DDE0E5",
    brand: "#9B4D2D",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#E8EDF4",
    tones: [
      {
        background: "#E8EDF4",
        accent: "#304E74",
        text: "#1B2D44",
        copy: "#566273",
      },
      {
        background: "#F4E5DA",
        accent: "#895034",
        text: "#1B2D44",
        copy: "#566273",
      },
      {
        background: "#EEEAE2",
        accent: "#66573D",
        text: "#1B2D44",
        copy: "#566273",
      },
    ],
    countryTones: [
      {
        background: "#E8EDF4",
        accent: "#1B2D44",
        text: "#1B2D44",
        copy: "#566273",
      },
      {
        background: "#F4E5DA",
        accent: "#1B2D44",
        text: "#1B2D44",
        copy: "#566273",
      },
      {
        background: "#EEEAE2",
        accent: "#1B2D44",
        text: "#1B2D44",
        copy: "#566273",
      },
    ],
  },
  "ocean-coral": {
    label: "Ocean & Coral",
    page: "#F5FAFB",
    surface: "#FFFFFF",
    text: "#143A46",
    muted: "#496873",
    border: "#D9E8EB",
    brand: "#B8453B",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#DFF1F6",
    tones: [
      {
        background: "#DFF1F6",
        accent: "#246173",
        text: "#143A46",
        copy: "#496873",
      },
      {
        background: "#E3F3ED",
        accent: "#28674F",
        text: "#143A46",
        copy: "#496873",
      },
      {
        background: "#FFE9E3",
        accent: "#9A493E",
        text: "#143A46",
        copy: "#496873",
      },
    ],
    countryTones: [
      {
        background: "#DFF1F6",
        accent: "#143A46",
        text: "#143A46",
        copy: "#496873",
      },
      {
        background: "#E3F3ED",
        accent: "#143A46",
        text: "#143A46",
        copy: "#496873",
      },
      {
        background: "#FFE9E3",
        accent: "#143A46",
        text: "#143A46",
        copy: "#496873",
      },
    ],
  },
  "lavender-seafoam": {
    label: "Lavender & Seafoam",
    page: "#F9F8FC",
    surface: "#FFFFFF",
    text: "#35314F",
    muted: "#655F7B",
    border: "#E2DFEB",
    brand: "#655099",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#EEE8FA",
    tones: [
      {
        background: "#EEE8FA",
        accent: "#604785",
        text: "#35314F",
        copy: "#655F7B",
      },
      {
        background: "#E3F2EC",
        accent: "#306855",
        text: "#35314F",
        copy: "#655F7B",
      },
      {
        background: "#F4ECF3",
        accent: "#7A4E72",
        text: "#35314F",
        copy: "#655F7B",
      },
    ],
    countryTones: [
      {
        background: "#EEE8FA",
        accent: "#35314F",
        text: "#35314F",
        copy: "#655F7B",
      },
      {
        background: "#E3F2EC",
        accent: "#35314F",
        text: "#35314F",
        copy: "#655F7B",
      },
      {
        background: "#F4ECF3",
        accent: "#35314F",
        text: "#35314F",
        copy: "#655F7B",
      },
    ],
  },
  "forest-apricot": {
    label: "Forest & Apricot",
    page: "#F7F9F4",
    surface: "#FFFFFF",
    text: "#243C2D",
    muted: "#526957",
    border: "#DCE5D9",
    brand: "#296447",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#E1EFE3",
    tones: [
      {
        background: "#E1EFE3",
        accent: "#326141",
        text: "#243C2D",
        copy: "#526957",
      },
      {
        background: "#F1EFDA",
        accent: "#6A6330",
        text: "#243C2D",
        copy: "#526957",
      },
      {
        background: "#FFE8D3",
        accent: "#87522C",
        text: "#243C2D",
        copy: "#526957",
      },
    ],
    countryTones: [
      {
        background: "#E1EFE3",
        accent: "#243C2D",
        text: "#243C2D",
        copy: "#526957",
      },
      {
        background: "#F1EFDA",
        accent: "#243C2D",
        text: "#243C2D",
        copy: "#526957",
      },
      {
        background: "#FFE8D3",
        accent: "#243C2D",
        text: "#243C2D",
        copy: "#526957",
      },
    ],
  },
  "ink-ice": {
    label: "Ink & Ice",
    page: "#FAFBFC",
    surface: "#FFFFFF",
    text: "#202B3B",
    muted: "#566172",
    border: "#DEE3EB",
    brand: "#254FAB",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#EAF0F7",
    tones: [
      {
        background: "#EAF0F7",
        accent: "#3A5578",
        text: "#202B3B",
        copy: "#566172",
      },
      {
        background: "#F0F3F6",
        accent: "#505F71",
        text: "#202B3B",
        copy: "#566172",
      },
      {
        background: "#E8F4F6",
        accent: "#356774",
        text: "#202B3B",
        copy: "#566172",
      },
    ],
    countryTones: [
      {
        background: "#EAF0F7",
        accent: "#202B3B",
        text: "#202B3B",
        copy: "#566172",
      },
      {
        background: "#F0F3F6",
        accent: "#202B3B",
        text: "#202B3B",
        copy: "#566172",
      },
      {
        background: "#E8F4F6",
        accent: "#202B3B",
        text: "#202B3B",
        copy: "#566172",
      },
    ],
  },
  plum: {
    label: "Plum & Blush",
    page: "#FBF8FA",
    surface: "#FFFFFF",
    text: "#472C45",
    muted: "#735D70",
    border: "#E9DDE5",
    brand: "#7E436F",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#F0E4EF",
    tones: [
      {
        background: "#F0E4EF",
        accent: "#744A6F",
        text: "#472C45",
        copy: "#735D70",
      },
      {
        background: "#FBE8E6",
        accent: "#8E514F",
        text: "#472C45",
        copy: "#735D70",
      },
      {
        background: "#F3EDDF",
        accent: "#75603B",
        text: "#472C45",
        copy: "#735D70",
      },
    ],
    countryTones: [
      {
        background: "#F0E4EF",
        accent: "#472C45",
        text: "#472C45",
        copy: "#735D70",
      },
      {
        background: "#FBE8E6",
        accent: "#472C45",
        text: "#472C45",
        copy: "#735D70",
      },
      {
        background: "#F3EDDF",
        accent: "#472C45",
        text: "#472C45",
        copy: "#735D70",
      },
    ],
  },
  midnight: {
    label: "Midnight & Mint",
    page: "#111D2B",
    surface: "#182638",
    text: "#EDF5FC",
    muted: "#B6C7D7",
    border: "#35465B",
    brand: "#91E3CB",
    brandText: "#14362D",
    soft: "#182638",
    country: "#22364F",
    tones: [
      {
        background: "#22364F",
        accent: "#BDD7FA",
        text: "#EDF5FC",
        copy: "#B6C7D7",
      },
      {
        background: "#203F3C",
        accent: "#A7E6D5",
        text: "#EDF5FC",
        copy: "#B6C7D7",
      },
      {
        background: "#3E3344",
        accent: "#EBC8DB",
        text: "#EDF5FC",
        copy: "#B6C7D7",
      },
    ],
    countryTones: [
      {
        background: "#22364F",
        accent: "#EDF5FC",
        text: "#EDF5FC",
        copy: "#B6C7D7",
      },
      {
        background: "#203F3C",
        accent: "#EDF5FC",
        text: "#EDF5FC",
        copy: "#B6C7D7",
      },
      {
        background: "#3E3344",
        accent: "#EDF5FC",
        text: "#EDF5FC",
        copy: "#B6C7D7",
      },
    ],
  },
  "carbon-cream": {
    label: "Carbon & Cream",
    page: "#FAF9F6",
    surface: "#FFFFFF",
    text: "#292A28",
    muted: "#60615C",
    border: "#DDDED6",
    brand: "#30322E",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#EEEFE9",
    tones: [
      {
        background: "#EEEFE9",
        accent: "#444B3D",
        text: "#292A28",
        copy: "#60615C",
      },
      {
        background: "#EEEFE9",
        accent: "#444B3D",
        text: "#292A28",
        copy: "#60615C",
      },
      {
        background: "#EEEFE9",
        accent: "#444B3D",
        text: "#292A28",
        copy: "#60615C",
      },
    ],
    countryTones: [
      {
        background: "#EEEFE9",
        accent: "#292A28",
        text: "#292A28",
        copy: "#60615C",
      },
      {
        background: "#EEEFE9",
        accent: "#292A28",
        text: "#292A28",
        copy: "#60615C",
      },
      {
        background: "#EEEFE9",
        accent: "#292A28",
        text: "#292A28",
        copy: "#60615C",
      },
    ],
  },
  "cobalt-chalk": {
    label: "Cobalt & Chalk",
    page: "#F8FAFF",
    surface: "#FFFFFF",
    text: "#1D3154",
    muted: "#4B5D7A",
    border: "#DCE4F2",
    brand: "#214CB3",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#DFE9FF",
    tones: [
      {
        background: "#DFE9FF",
        accent: "#254C9C",
        text: "#1D3154",
        copy: "#4B5D7A",
      },
      {
        background: "#E8EFFF",
        accent: "#254C9C",
        text: "#1D3154",
        copy: "#4B5D7A",
      },
      {
        background: "#EFF3FC",
        accent: "#254C9C",
        text: "#1D3154",
        copy: "#4B5D7A",
      },
    ],
    countryTones: [
      {
        background: "#DFE9FF",
        accent: "#1D3154",
        text: "#1D3154",
        copy: "#4B5D7A",
      },
      {
        background: "#E8EFFF",
        accent: "#1D3154",
        text: "#1D3154",
        copy: "#4B5D7A",
      },
      {
        background: "#EFF3FC",
        accent: "#1D3154",
        text: "#1D3154",
        copy: "#4B5D7A",
      },
    ],
  },
  "teal-studio": {
    label: "Teal Studio",
    page: "#F5FAF9",
    surface: "#FFFFFF",
    text: "#183C39",
    muted: "#4C6662",
    border: "#D6E7E3",
    brand: "#1A6860",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#DAEEE9",
    tones: [
      {
        background: "#DAEEE9",
        accent: "#25665B",
        text: "#183C39",
        copy: "#4C6662",
      },
      {
        background: "#E3F2ED",
        accent: "#25665B",
        text: "#183C39",
        copy: "#4C6662",
      },
      {
        background: "#EDF7F2",
        accent: "#25665B",
        text: "#183C39",
        copy: "#4C6662",
      },
    ],
    countryTones: [
      {
        background: "#DAEEE9",
        accent: "#183C39",
        text: "#183C39",
        copy: "#4C6662",
      },
      {
        background: "#E3F2ED",
        accent: "#183C39",
        text: "#183C39",
        copy: "#4C6662",
      },
      {
        background: "#EDF7F2",
        accent: "#183C39",
        text: "#183C39",
        copy: "#4C6662",
      },
    ],
  },
  sandstone: {
    label: "Sandstone",
    page: "#FCF9F4",
    surface: "#FFFEFC",
    text: "#49372C",
    muted: "#71604F",
    border: "#E7DCCF",
    brand: "#915632",
    brandText: "#FFFFFF",
    soft: "#FFFEFC",
    country: "#F3E5D5",
    tones: [
      {
        background: "#F3E5D5",
        accent: "#80532F",
        text: "#49372C",
        copy: "#71604F",
      },
      {
        background: "#F3E5D5",
        accent: "#80532F",
        text: "#49372C",
        copy: "#71604F",
      },
      {
        background: "#F3E5D5",
        accent: "#80532F",
        text: "#49372C",
        copy: "#71604F",
      },
    ],
    countryTones: [
      {
        background: "#F3E5D5",
        accent: "#49372C",
        text: "#49372C",
        copy: "#71604F",
      },
      {
        background: "#F3E5D5",
        accent: "#49372C",
        text: "#49372C",
        copy: "#71604F",
      },
      {
        background: "#F3E5D5",
        accent: "#49372C",
        text: "#49372C",
        copy: "#71604F",
      },
    ],
  },
  "espresso-oat": {
    label: "Espresso & Oat",
    page: "#F8F5F0",
    surface: "#FFFCF8",
    text: "#3D302A",
    muted: "#6C5E54",
    border: "#E3DAD0",
    brand: "#594037",
    brandText: "#FFFFFF",
    soft: "#FFFCF8",
    country: "#EEE4D6",
    tones: [
      {
        background: "#EEE4D6",
        accent: "#6E5438",
        text: "#3D302A",
        copy: "#6C5E54",
      },
      {
        background: "#E8E3DC",
        accent: "#62564B",
        text: "#3D302A",
        copy: "#6C5E54",
      },
      {
        background: "#F2E8DE",
        accent: "#7A5239",
        text: "#3D302A",
        copy: "#6C5E54",
      },
    ],
    countryTones: [
      {
        background: "#EEE4D6",
        accent: "#3D302A",
        text: "#3D302A",
        copy: "#6C5E54",
      },
      {
        background: "#E8E3DC",
        accent: "#3D302A",
        text: "#3D302A",
        copy: "#6C5E54",
      },
      {
        background: "#F2E8DE",
        accent: "#3D302A",
        text: "#3D302A",
        copy: "#6C5E54",
      },
    ],
  },
  "citrus-slate": {
    label: "Citrus & Slate",
    page: "#FAFAF5",
    surface: "#FFFFFF",
    text: "#303B3B",
    muted: "#58635D",
    border: "#E1E4D9",
    brand: "#4C632F",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#F3F1C9",
    tones: [
      {
        background: "#F3F1C9",
        accent: "#6B621F",
        text: "#303B3B",
        copy: "#58635D",
      },
      {
        background: "#E5EBDC",
        accent: "#4C6338",
        text: "#303B3B",
        copy: "#58635D",
      },
      {
        background: "#EBEEF0",
        accent: "#4B5A66",
        text: "#303B3B",
        copy: "#58635D",
      },
    ],
    countryTones: [
      {
        background: "#F3F1C9",
        accent: "#303B3B",
        text: "#303B3B",
        copy: "#58635D",
      },
      {
        background: "#E5EBDC",
        accent: "#303B3B",
        text: "#303B3B",
        copy: "#58635D",
      },
      {
        background: "#EBEEF0",
        accent: "#303B3B",
        text: "#303B3B",
        copy: "#58635D",
      },
    ],
  },
  "terracotta-sky": {
    label: "Terracotta & Sky",
    page: "#FBF8F5",
    surface: "#FFFFFF",
    text: "#3B3E46",
    muted: "#62636A",
    border: "#E7DED8",
    brand: "#A04D35",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#F8E2D9",
    tones: [
      {
        background: "#F8E2D9",
        accent: "#91482F",
        text: "#3B3E46",
        copy: "#62636A",
      },
      {
        background: "#E0EFF7",
        accent: "#35657D",
        text: "#3B3E46",
        copy: "#62636A",
      },
      {
        background: "#F0EADC",
        accent: "#75603B",
        text: "#3B3E46",
        copy: "#62636A",
      },
    ],
    countryTones: [
      {
        background: "#F8E2D9",
        accent: "#3B3E46",
        text: "#3B3E46",
        copy: "#62636A",
      },
      {
        background: "#E0EFF7",
        accent: "#3B3E46",
        text: "#3B3E46",
        copy: "#62636A",
      },
      {
        background: "#F0EADC",
        accent: "#3B3E46",
        text: "#3B3E46",
        copy: "#62636A",
      },
    ],
  },
  "aubergine-gold": {
    label: "Aubergine & Gold",
    page: "#FCF9F5",
    surface: "#FFFFFF",
    text: "#462A48",
    muted: "#6B586C",
    border: "#E8DDE4",
    brand: "#623266",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#EEE0F0",
    tones: [
      {
        background: "#EEE0F0",
        accent: "#713F76",
        text: "#462A48",
        copy: "#6B586C",
      },
      {
        background: "#F8EBC7",
        accent: "#7B5D1C",
        text: "#462A48",
        copy: "#6B586C",
      },
      {
        background: "#F3E6E2",
        accent: "#805346",
        text: "#462A48",
        copy: "#6B586C",
      },
    ],
    countryTones: [
      {
        background: "#EEE0F0",
        accent: "#462A48",
        text: "#462A48",
        copy: "#6B586C",
      },
      {
        background: "#F8EBC7",
        accent: "#462A48",
        text: "#462A48",
        copy: "#6B586C",
      },
      {
        background: "#F3E6E2",
        accent: "#462A48",
        text: "#462A48",
        copy: "#6B586C",
      },
    ],
  },
  "atlantic-saffron": {
    label: "Atlantic & Saffron",
    page: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#18354D",
    muted: "#4A6072",
    border: "#DCE5EB",
    brand: "#205E80",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#DDECF7",
    tones: [
      {
        background: "#DDECF7",
        accent: "#2C5C80",
        text: "#18354D",
        copy: "#4A6072",
      },
      {
        background: "#FBE8B5",
        accent: "#7D5B12",
        text: "#18354D",
        copy: "#4A6072",
      },
      {
        background: "#DEEEE9",
        accent: "#306457",
        text: "#18354D",
        copy: "#4A6072",
      },
    ],
    countryTones: [
      {
        background: "#DDECF7",
        accent: "#18354D",
        text: "#18354D",
        copy: "#4A6072",
      },
      {
        background: "#FBE8B5",
        accent: "#18354D",
        text: "#18354D",
        copy: "#4A6072",
      },
      {
        background: "#DEEEE9",
        accent: "#18354D",
        text: "#18354D",
        copy: "#4A6072",
      },
    ],
  },
  peacock: {
    label: "Peacock",
    page: "#F7FAFC",
    surface: "#FFFFFF",
    text: "#253B4D",
    muted: "#536376",
    border: "#DCE4ED",
    brand: "#2B607C",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#E1F2EA",
    tones: [
      {
        background: "#DCEEF2",
        accent: "#2A6570",
        text: "#253B4D",
        copy: "#536376",
      },
      {
        background: "#E3E5F7",
        accent: "#4A548F",
        text: "#253B4D",
        copy: "#536376",
      },
      {
        background: "#EAE0F3",
        accent: "#714C8A",
        text: "#253B4D",
        copy: "#536376",
      },
    ],
    countryTones: [
      {
        background: "#E1F2EA",
        accent: "#253B4D",
        text: "#253B4D",
        copy: "#536376",
      },
      {
        background: "#F6E2EE",
        accent: "#253B4D",
        text: "#253B4D",
        copy: "#536376",
      },
      {
        background: "#E4ECF9",
        accent: "#253B4D",
        text: "#253B4D",
        copy: "#536376",
      },
    ],
  },
  "seaside-sorbet": {
    label: "Seaside Sorbet",
    page: "#FFFBF8",
    surface: "#FFFFFF",
    text: "#33464E",
    muted: "#596970",
    border: "#E7E5E0",
    brand: "#326F77",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#DFF1F7",
    tones: [
      {
        background: "#FFE4DD",
        accent: "#954A3E",
        text: "#33464E",
        copy: "#596970",
      },
      {
        background: "#FFF1C6",
        accent: "#7C6219",
        text: "#33464E",
        copy: "#596970",
      },
      {
        background: "#DEF2E7",
        accent: "#33694C",
        text: "#33464E",
        copy: "#596970",
      },
    ],
    countryTones: [
      {
        background: "#DFF1F7",
        accent: "#33464E",
        text: "#33464E",
        copy: "#596970",
      },
      {
        background: "#EDE4FA",
        accent: "#33464E",
        text: "#33464E",
        copy: "#596970",
      },
      {
        background: "#F9E3EF",
        accent: "#33464E",
        text: "#33464E",
        copy: "#596970",
      },
    ],
  },
  "festival-pastels": {
    label: "Festival Pastels",
    page: "#FBFAFE",
    surface: "#FFFFFF",
    text: "#35374F",
    muted: "#5C6075",
    border: "#E5E0EF",
    brand: "#6545A2",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#E8DDF9",
    tones: [
      {
        background: "#FADDEA",
        accent: "#913F66",
        text: "#35374F",
        copy: "#5C6075",
      },
      {
        background: "#E4F0CD",
        accent: "#50632C",
        text: "#35374F",
        copy: "#5C6075",
      },
      {
        background: "#DDEBFF",
        accent: "#345F9B",
        text: "#35374F",
        copy: "#5C6075",
      },
    ],
    countryTones: [
      {
        background: "#E8DDF9",
        accent: "#35374F",
        text: "#35374F",
        copy: "#5C6075",
      },
      {
        background: "#FFE5CB",
        accent: "#35374F",
        text: "#35374F",
        copy: "#5C6075",
      },
      {
        background: "#D9F1EB",
        accent: "#35374F",
        text: "#35374F",
        copy: "#5C6075",
      },
    ],
  },
  "nordic-meadow": {
    label: "Nordic Meadow",
    page: "#F8F9F5",
    surface: "#FFFFFF",
    text: "#354039",
    muted: "#5C685E",
    border: "#DFE5DB",
    brand: "#4C6853",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#EFE1DF",
    tones: [
      {
        background: "#E0E9EA",
        accent: "#446265",
        text: "#354039",
        copy: "#5C685E",
      },
      {
        background: "#E5EBD8",
        accent: "#58643A",
        text: "#354039",
        copy: "#5C685E",
      },
      {
        background: "#F0EADB",
        accent: "#76623D",
        text: "#354039",
        copy: "#5C685E",
      },
    ],
    countryTones: [
      {
        background: "#EFE1DF",
        accent: "#354039",
        text: "#354039",
        copy: "#5C685E",
      },
      {
        background: "#E3E7E4",
        accent: "#354039",
        text: "#354039",
        copy: "#5C685E",
      },
      {
        background: "#E8E3ED",
        accent: "#354039",
        text: "#354039",
        copy: "#5C685E",
      },
    ],
  },
  "alpine-air": {
    label: "Alpine Air",
    page: "#F6FBFE",
    surface: "#FFFFFF",
    text: "#254458",
    muted: "#506B7D",
    border: "#DCEAF1",
    brand: "#2E6A91",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#E0F2FC",
    tones: [
      {
        background: "#E0F2FC",
        accent: "#356987",
        text: "#254458",
        copy: "#506B7D",
      },
      {
        background: "#E0F5F1",
        accent: "#306F65",
        text: "#254458",
        copy: "#506B7D",
      },
      {
        background: "#E8EDFD",
        accent: "#4E6197",
        text: "#254458",
        copy: "#506B7D",
      },
    ],
    countryTones: [
      {
        background: "#E0F2FC",
        accent: "#254458",
        text: "#254458",
        copy: "#506B7D",
      },
      {
        background: "#E0F5F1",
        accent: "#254458",
        text: "#254458",
        copy: "#506B7D",
      },
      {
        background: "#E8EDFD",
        accent: "#254458",
        text: "#254458",
        copy: "#506B7D",
      },
    ],
  },
  "coral-ink": {
    label: "Coral & Ink",
    page: "#FFFAF8",
    surface: "#FFFFFF",
    text: "#263746",
    muted: "#5C6269",
    border: "#E8E0DD",
    brand: "#A83C38",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#FFDDD7",
    tones: [
      {
        background: "#FFDDD7",
        accent: "#974039",
        text: "#263746",
        copy: "#5C6269",
      },
      {
        background: "#F5EAE7",
        accent: "#89544C",
        text: "#263746",
        copy: "#5C6269",
      },
      {
        background: "#E6EBEF",
        accent: "#455E73",
        text: "#263746",
        copy: "#5C6269",
      },
    ],
    countryTones: [
      {
        background: "#FFDDD7",
        accent: "#263746",
        text: "#263746",
        copy: "#5C6269",
      },
      {
        background: "#F5EAE7",
        accent: "#263746",
        text: "#263746",
        copy: "#5C6269",
      },
      {
        background: "#E6EBEF",
        accent: "#263746",
        text: "#263746",
        copy: "#5C6269",
      },
    ],
  },
  "primary-colours": {
    label: "Primary Colours",
    page: "#F8F9FC",
    surface: "#FFFFFF",
    text: "#19304B",
    muted: "#526174",
    border: "#DDE3ED",
    brand: "#244BA8",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#E5EDFF",
    tones: [
      {
        background: "#244BA8",
        accent: "#FFFFFF",
        text: "#FFFFFF",
        copy: "#EAF0FF",
      },
      {
        background: "#A82E39",
        accent: "#FFFFFF",
        text: "#FFFFFF",
        copy: "#FFF0F1",
      },
      {
        background: "#F4CE66",
        accent: "#604718",
        text: "#343015",
        copy: "#5B4B24",
      },
    ],
    countryTones: [
      {
        background: "#E5EDFF",
        accent: "#19304B",
        text: "#19304B",
        copy: "#526174",
      },
      {
        background: "#F9E3E6",
        accent: "#19304B",
        text: "#19304B",
        copy: "#526174",
      },
      {
        background: "#FFF0C9",
        accent: "#19304B",
        text: "#19304B",
        copy: "#526174",
      },
    ],
  },
  "ruby-rose": {
    label: "Ruby & Rose",
    page: "#FDF8F9",
    surface: "#FFFFFF",
    text: "#502C36",
    muted: "#755660",
    border: "#EEDCE2",
    brand: "#9C3551",
    brandText: "#FFFFFF",
    soft: "#FFFFFF",
    country: "#F8DFE6",
    tones: [
      {
        background: "#F8DFE6",
        accent: "#8C3D56",
        text: "#502C36",
        copy: "#755660",
      },
      {
        background: "#F2E4E9",
        accent: "#7D4D65",
        text: "#502C36",
        copy: "#755660",
      },
      {
        background: "#FBE9E8",
        accent: "#914C4C",
        text: "#502C36",
        copy: "#755660",
      },
    ],
    countryTones: [
      {
        background: "#F8DFE6",
        accent: "#502C36",
        text: "#502C36",
        copy: "#755660",
      },
      {
        background: "#F2E4E9",
        accent: "#502C36",
        text: "#502C36",
        copy: "#755660",
      },
      {
        background: "#FBE9E8",
        accent: "#502C36",
        text: "#502C36",
        copy: "#755660",
      },
    ],
  },
  "graphite-lime": {
    label: "Graphite & Lime",
    page: "#1B211F",
    surface: "#242C28",
    text: "#F1F5E9",
    muted: "#B9C7B8",
    border: "#3E4A40",
    brand: "#D4EA78",
    brandText: "#2C3818",
    soft: "#242C28",
    country: "#303C30",
    tones: [
      {
        background: "#303C30",
        accent: "#D6E99D",
        text: "#F1F5E9",
        copy: "#B9C7B8",
      },
      {
        background: "#303C30",
        accent: "#D6E99D",
        text: "#F1F5E9",
        copy: "#B9C7B8",
      },
      {
        background: "#303C30",
        accent: "#D6E99D",
        text: "#F1F5E9",
        copy: "#B9C7B8",
      },
    ],
    countryTones: [
      {
        background: "#303C30",
        accent: "#F1F5E9",
        text: "#F1F5E9",
        copy: "#B9C7B8",
      },
      {
        background: "#303C30",
        accent: "#F1F5E9",
        text: "#F1F5E9",
        copy: "#B9C7B8",
      },
      {
        background: "#303C30",
        accent: "#F1F5E9",
        text: "#F1F5E9",
        copy: "#B9C7B8",
      },
    ],
  },
  "nightfall-amber": {
    label: "Nightfall & Amber",
    page: "#24201C",
    surface: "#2E2822",
    text: "#FBF1E3",
    muted: "#D1BDAB",
    border: "#514438",
    brand: "#F0C278",
    brandText: "#493213",
    soft: "#2E2822",
    country: "#403327",
    tones: [
      {
        background: "#403327",
        accent: "#F5D19A",
        text: "#FBF1E3",
        copy: "#D1BDAB",
      },
      {
        background: "#3C3429",
        accent: "#EED8AB",
        text: "#FBF1E3",
        copy: "#D1BDAB",
      },
      {
        background: "#40302C",
        accent: "#F2BDA7",
        text: "#FBF1E3",
        copy: "#D1BDAB",
      },
    ],
    countryTones: [
      {
        background: "#403327",
        accent: "#FBF1E3",
        text: "#FBF1E3",
        copy: "#D1BDAB",
      },
      {
        background: "#3C3429",
        accent: "#FBF1E3",
        text: "#FBF1E3",
        copy: "#D1BDAB",
      },
      {
        background: "#40302C",
        accent: "#FBF1E3",
        text: "#FBF1E3",
        copy: "#D1BDAB",
      },
    ],
  },
  "aurora-after-dark": {
    label: "Aurora After Dark",
    page: "#151D2D",
    surface: "#1D273B",
    text: "#F0F3FD",
    muted: "#BBC6E0",
    border: "#384861",
    brand: "#B9ADF7",
    brandText: "#302750",
    soft: "#1D273B",
    country: "#433044",
    tones: [
      {
        background: "#293954",
        accent: "#BAD8FF",
        text: "#F0F3FD",
        copy: "#BBC6E0",
      },
      {
        background: "#23413F",
        accent: "#A6E7D6",
        text: "#F0F3FD",
        copy: "#BBC6E0",
      },
      {
        background: "#3A3054",
        accent: "#D6C3FF",
        text: "#F0F3FD",
        copy: "#BBC6E0",
      },
    ],
    countryTones: [
      {
        background: "#433044",
        accent: "#F0F3FD",
        text: "#F0F3FD",
        copy: "#BBC6E0",
      },
      {
        background: "#424032",
        accent: "#F0F3FD",
        text: "#F0F3FD",
        copy: "#BBC6E0",
      },
      {
        background: "#283E51",
        accent: "#F0F3FD",
        text: "#F0F3FD",
        copy: "#BBC6E0",
      },
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
  countryId?: string,
): ThemeStyle {
  if (id === "colourful") return { ...original };
  const theme = HOMEPAGE_THEMES[id];
  const countryToneIndex: Record<string, 0 | 1 | 2> = {
    uk: 0,
    australia: 0,
    "new-zealand": 1,
    usa: 2,
    canada: 0,
    ireland: 1,
    "south-africa": 2,
  };
  const tone =
    kind === "tone"
      ? theme.tones[toneIndex]
      : kind === "country"
        ? theme.countryTones?.[countryToneIndex[countryId ?? ""] ?? toneIndex]
        : undefined;
  return {
    ...original,
    background: tone?.background ?? (kind === "country" ? theme.country : theme.surface),
    borderColor: theme.border,
    color: tone?.accent ?? theme.brand,
    "--homepage-card-heading": tone?.text ?? theme.text,
    "--homepage-card-copy": tone?.copy ?? tone?.text ?? theme.muted,
    "--homepage-icon-background": tone?.background ?? theme.surface,
  };
}
