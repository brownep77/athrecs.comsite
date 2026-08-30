/** Parse catalogue or database profile roles into a display list. Never throws. */
export function parseProfileRoles(seedRoles: unknown, raw: unknown): string[] {
  const fromList = (value: unknown): string[] | null => {
    if (!Array.isArray(value)) return null;
    const roles = value.map((role) => String(role).trim()).filter(Boolean);
    return roles;
  };

  const seeded = fromList(seedRoles);
  if (seeded && seeded.length > 0) return seeded;

  const fromRawList = fromList(raw);
  if (fromRawList) return fromRawList;

  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);
  }

  return seeded ?? [];
}
