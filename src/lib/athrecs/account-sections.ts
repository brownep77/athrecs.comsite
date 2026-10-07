export const ACCOUNT_SECTION_GROUPS = [
  {
    label: "Races",
    items: [
      { id: "potential", label: "Potential races" },
      { id: "races", label: "My races" },
      { id: "upcoming", label: "Upcoming races" },
      { id: "achievements", label: "Personal bests & achievements" },
      { id: "progress", label: "Progress" },
    ],
  },
  {
    label: "Profile",
    items: [
      { id: "identity", label: "Personal details" },
      { id: "location", label: "Location & clubs" },
      { id: "photo", label: "Photos" },
      { id: "biography", label: "Biography" },
      { id: "matching", label: "Names & result sources" },
      { id: "connections", label: "Linked profiles" },
    ],
  },
  {
    label: "Training & preferences",
    items: [
      { id: "sports", label: "Sports & training" },
      { id: "equipment", label: "Equipment" },
      { id: "nutrition", label: "Sports nutrition" },
      { id: "technology", label: "Technology" },
      { id: "clothing", label: "Clothing" },
      { id: "recovery", label: "Recovery" },
      { id: "buying", label: "Buying preferences" },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "privacy", label: "Privacy & consent" },
      { id: "sharing", label: "Profile sharing" },
      { id: "opportunities", label: "Partnerships" },
    ],
  },
] as const;

export type AccountSectionId = (typeof ACCOUNT_SECTION_GROUPS)[number]["items"][number]["id"];

export function validateAccountSearch(search: Record<string, unknown>): {
  section?: AccountSectionId;
} {
  const section = search.section;
  return typeof section === "string" &&
    ACCOUNT_SECTION_GROUPS.some((group) => group.items.some((item) => item.id === section))
    ? { section: section as AccountSectionId }
    : { section: undefined };
}

export function isAccountFormSection(section: AccountSectionId): boolean {
  return [
    "identity",
    "location",
    "matching",
    "sports",
    "equipment",
    "nutrition",
    "technology",
    "clothing",
    "recovery",
    "buying",
    "privacy",
  ].includes(section);
}
