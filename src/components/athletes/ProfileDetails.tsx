import type { PublicProfileDetails } from "@/lib/athrecs/profile-details";
import { CountryFlag } from "./CountryFlag";

export function ProfileDetails({
  details,
  nationality,
  coaches = [],
}: {
  details: PublicProfileDetails;
  nationality?: string;
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
    <dl className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-2 text-sm">
      {nationality || details.nationality ? (
        <div className="flex items-center gap-1.5">
          <dt className="text-xs text-subtle">Nationality</dt>
          <dd>
            <CountryFlag country={nationality || details.nationality} showName />
          </dd>
        </div>
      ) : null}
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-wrap items-baseline gap-1.5">
          <dt className="text-xs text-subtle">{label}</dt>
          <dd className="font-medium text-fg">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
