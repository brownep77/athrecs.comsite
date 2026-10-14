import { Globe2 } from "lucide-react";
import { CountryFlag } from "@/components/athletes/CountryFlag";

/** A club's operating base, never an inference about its members' nationalities. */
export function ClubIdentityFlag({ country, scope }: { country?: string | null; scope?: string }) {
  if (scope === "global" || /^(global|world|international)$/i.test(country?.trim() ?? "")) {
    return (
      <span
        role="img"
        aria-label="Global club"
        title="Global club"
        className="inline-flex shrink-0 text-muted"
      >
        <Globe2 aria-hidden="true" className="h-5 w-5" />
      </span>
    );
  }
  if (!country?.trim()) return null;
  return <CountryFlag country={country} />;
}
