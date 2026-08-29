export function slugifyShareName(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "athlete";
}

export function isValidShareSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length >= 8 && value.length <= 80;
}

function suffixForUser(userId: string): string {
  let hash = 2166136261;
  const input = `athrecs-share:${userId}`;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function buildShareSlug(displayName: string, userId: string): string {
  const slug = `${slugifyShareName(displayName)}-${suffixForUser(userId)}`;
  return isValidShareSlug(slug) ? slug : `athlete-${suffixForUser(userId)}`;
}

export function sharedProfilePath(slug: string): string {
  return `/athletes/${slug}`;
}

export function sharedProfileUrl(slug: string, origin = "https://www.athrecs.com"): string {
  const base = origin.replace(/\/$/, "");
  return `${base}${sharedProfilePath(slug)}`;
}

export const PRIVATE_SHARE_FIELDS = [
  "email",
  "verifiedEmail",
  "dateOfBirth",
  "postcode",
  "previousNames",
  "parkrunId",
  "athleticsUrn",
  "profilePhotoUrl",
  "preferences",
  "fullName",
] as const;
