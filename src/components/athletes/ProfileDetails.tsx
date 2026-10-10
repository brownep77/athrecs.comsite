import type { PublicProfileDetails } from "@/lib/athrecs/profile-details";
import type { SourceNationality } from "@/lib/athrecs/source-nationality";
import { CountryFlag } from "./CountryFlag";
import { isWmmSource } from "@/lib/athrecs/profile-source-presentation";

export function ProfileDetails({
  details,
  nationality,
  nationalitySource,
  coaches = [],
}: {
  details: PublicProfileDetails;
  nationality?: string;
  nationalitySource?: SourceNationality | null;
  coaches?: { sport: string; name: string }[];
}) {
  const rows = [
    ["Country of birth", details.birthCountry],
    ["Birthday", details.birthday],
    ["Running age category", details.runningAgeCategory],
    ["Previous club", details.previousClub],
    ["Coach", details.coach],
    ...coaches
      .filter((coach) => coach.name && coach.name !== details.coach)
      .map((coach) => [`${coach.sport} coach`, coach.name]),
    ["Manager", details.manager],
    ["Contact", details.acceptContact ? "Open to contact" : "Not accepting contact"],
  ].filter((row) => row[1]);
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-2 text-sm sm:flex sm:flex-wrap sm:gap-x-6">
      {nationality || details.nationality ? (
        <div className="min-w-0 sm:flex sm:items-center sm:gap-1.5">
          <dt className="text-xs text-subtle">Nationality</dt>
          <dd>
            <CountryFlag country={nationality || details.nationality} showName />
            {nationalitySource &&
            !isWmmSource(nationalitySource.provider, [nationalitySource.sourceUrl]) ? (
              <a
                href={nationalitySource.sourceUrl}
                className="ml-1.5 text-xs text-accent underline"
              >
                As listed by {nationalitySource.provider}
              </a>
            ) : null}
          </dd>
        </div>
      ) : null}
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0 sm:flex sm:flex-wrap sm:items-baseline sm:gap-1.5">
          <dt className="text-xs text-subtle">{label}</dt>
          <dd className="break-words font-medium text-fg">
            {label === "Country of birth" ? (
              <CountryFlag country={value} showName />
            ) : label === "Coach" && details.coachProfileSlug ? (
              <a
                href={`/athletes/${encodeURIComponent(details.coachProfileSlug)}`}
                className="text-accent underline underline-offset-2 hover:no-underline"
              >
                {value}
              </a>
            ) : (
              value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
