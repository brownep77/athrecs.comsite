import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { isPublicProfileSource } from "@/lib/athrecs/public-profile-sources";

export function ProfileEventLink({
  result,
  children,
  className,
}: {
  result: { sport: string; eventSlug: string; sourceUrls?: string[] };
  children: ReactNode;
  className?: string;
}) {
  const running = ["Running", "Parkrun"].includes(result.sport);
  if (result.sport === "Athletics" || running)
    return (
      <Link to="/races/$slug" params={{ slug: result.eventSlug }} className={className}>
        {children}
      </Link>
    );
  const publicSource = result.sourceUrls?.find((url) => isPublicProfileSource(url));
  if (publicSource)
    return (
      <a href={publicSource} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  return <span className={className}>{children}</span>;
}
