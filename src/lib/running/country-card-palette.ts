import type { MarathonCountry } from "@/data/road-marathons/types";

// Pastel flag colours keep country cards distinct without competing with the text.
export const runningCountryPalettes = {
  uk: {
    background: "linear-gradient(135deg, #dfeafa 0%, #fff9f8 50%, #f6dce1 100%)",
    border: "#cfccdf",
    accent: "#334e7d",
  },
  australia: {
    background: "linear-gradient(150deg, #dce7f6 0%, #e7effb 48%, #fff9f8 72%, #f3dfe5 100%)",
    border: "#c4d3e8",
    accent: "#334e7d",
  },
  "new-zealand": {
    background: "linear-gradient(135deg, #e1e8f7 0%, #f4f7fd 55%, #f3dce2 100%)",
    border: "#ccd1e5",
    accent: "#5b415f",
  },
  usa: {
    background: "linear-gradient(135deg, #f8dfe4 0%, #fffbfb 45%, #e0eafb 100%)",
    border: "#ddcbd7",
    accent: "#8c3745",
  },
  canada: {
    background: "linear-gradient(90deg, #f5d9df 0%, #fff8f8 38%, #fff8f8 62%, #f5d9df 100%)",
    border: "#e8bdc7",
    accent: "#933c4b",
  },
  ireland: {
    background: "linear-gradient(110deg, #dbeee0 0%, #fcfdf7 48%, #f9e1c9 100%)",
    border: "#c9d9bb",
    accent: "#285c49",
  },
  spain: {
    background: "linear-gradient(135deg, #f8dfe4 0%, #fff1c4 50%, #f6dce1 100%)",
    border: "#e8cfb8",
    accent: "#853e32",
  },
  portugal: {
    background: "linear-gradient(135deg, #dceee0 0%, #fff4cf 48%, #f6dce1 100%)",
    border: "#cddbbd",
    accent: "#315d45",
  },
  germany: {
    background: "linear-gradient(135deg, #e4e7eb 0%, #f6dce1 50%, #fff0be 100%)",
    border: "#ddd0c4",
    accent: "#63413a",
  },
  denmark: {
    background: "linear-gradient(135deg, #f7dce2 0%, #fffafa 50%, #f4dce1 100%)",
    border: "#e7c3cc",
    accent: "#8d3c4b",
  },
  czechia: {
    background: "linear-gradient(135deg, #dce7fa 0%, #fffafa 48%, #f6dce1 100%)",
    border: "#ccd4e3",
    accent: "#3c527b",
  },
  "south-africa": {
    background:
      "linear-gradient(135deg, #dee3e7 0%, #f6e7b7 18%, #deede1 38%, #fcfbf6 54%, #f2dddd 76%, #dce6f5 100%)",
    border: "#c8d6b9",
    accent: "#275548",
  },
} satisfies Record<MarathonCountry, { background: string; border: string; accent: string }>;

export function countryCardStyle(country: MarathonCountry) {
  const palette = runningCountryPalettes[country];
  return { background: palette.background, borderColor: palette.border, color: palette.accent };
}

// Shared, non-country cards use a quiet pastel background from the same visual family.
export const neutralPastelCardStyle = {
  background: "linear-gradient(135deg, #eaf0fa 0%, #fcfcf8 55%, #f3edf7 100%)",
  borderColor: "#d5dce9",
  color: "#334e7d",
};

export const pastelCardClassName =
  "flex flex-col rounded-xl border p-5 no-underline transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-600 sm:p-6";
