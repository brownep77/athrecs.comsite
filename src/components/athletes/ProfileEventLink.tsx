import type { CSSProperties, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { isPublicProfileSource } from "@/lib/athrecs/public-profile-sources";

export function ProfileEventLink({
  result,
  children,
  className,
  style,
}: {
  result: { sport: string; eventSlug: string; sourceUrls?: string[]; history?: { key: string } };
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  if (result.history)
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  const running = ["Running", "Parkrun"].includes(result.sport);
  if (result.sport === "Athletics" || running)
    return (
      <Link
        to="/races/$slug"
        params={{ slug: result.eventSlug }}
        className={className}
        style={style}
      >
        {children}
      </Link>
    );
  const publicSource = result.sourceUrls?.find((url) => isPublicProfileSource(url));
  if (publicSource)
    return (
      <a
        href={publicSource}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
      >
        {children}
      </a>
    );
  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
}
