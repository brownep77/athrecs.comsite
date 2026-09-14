export const SOCIAL_PLATFORMS = ["instagram", "x", "facebook", "linkedin"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export type ProfileConnection = { platform: SocialPlatform; url: string; sharePublicly: boolean };
export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  x: "X / Twitter",
  facebook: "Facebook",
  linkedin: "LinkedIn",
};
const HOSTS: Record<SocialPlatform, readonly string[]> = {
  instagram: ["instagram.com", "www.instagram.com"],
  x: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"],
  facebook: ["facebook.com", "www.facebook.com", "m.facebook.com"],
  linkedin: ["linkedin.com", "www.linkedin.com"],
};

export function validateProfileConnection(value: ProfileConnection): ProfileConnection {
  if (!SOCIAL_PLATFORMS.includes(value?.platform))
    throw new Error("Choose a supported social platform.");
  if (typeof value.url !== "string" || value.url.length > 2048)
    throw new Error("Enter a profile link shorter than 2,048 characters.");
  let url: URL;
  try {
    url = new URL(value.url.trim());
  } catch {
    throw new Error("Enter the full HTTPS profile link.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !HOSTS[value.platform].includes(url.hostname.toLowerCase()) ||
    url.pathname === "/"
  ) {
    throw new Error(`Enter a valid ${SOCIAL_LABELS[value.platform]} profile link.`);
  }
  if (value.platform === "linkedin" && !/^\/in\/[^/]+\/?$/.test(url.pathname)) {
    throw new Error("Enter a LinkedIn personal profile link containing /in/.");
  }
  url.hash = "";
  if (value.platform !== "facebook") url.search = "";
  return {
    platform: value.platform,
    url: url.toString(),
    sharePublicly: value.sharePublicly === true,
  };
}

export type SourceIdentity = {
  provider: "worldathletics" | "powerof10" | "parkrun" | "athleticsurn";
  externalId: string;
};

export function sourceIdentityFromUrl(value: string | null | undefined): SourceIdentity | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "worldathletics.org" && url.pathname.startsWith("/athletes/")) {
      const id = url.pathname.match(/-(\d+)\/?$/)?.[1];
      return id ? { provider: "worldathletics", externalId: id } : null;
    }
    if (host === "thepowerof10.info" && url.pathname.toLowerCase() === "/athletes/profile.aspx") {
      const id = [...url.searchParams].find(([key]) => key.toLowerCase() === "athleteid")?.[1];
      return id && /^\d+$/.test(id) ? { provider: "powerof10", externalId: id } : null;
    }
    if (host === "parkrun.org.uk" && url.pathname.startsWith("/parkrunner/")) {
      const id = url.pathname.match(/^\/parkrunner\/(\d+)\/?/)?.[1];
      return id ? { provider: "parkrun", externalId: id } : null;
    }
  } catch {
    /* A source without a recognised identifier remains a source link. */
  }
  return null;
}
