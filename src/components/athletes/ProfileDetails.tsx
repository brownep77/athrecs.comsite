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
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-2 text-sm sm:flex sm:flex-wrap sm:gap-x-6">
      {nationality || details.nationality ? (
        <div className="min-w-0 sm:flex sm:items-center sm:gap-1.5">
          <dt className="text-xs text-subtle">Nationality</dt>
          <dd>
            <CountryFlag country={nationality || details.nationality} showName />
          </dd>
        </div>
      ) : null}
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0 sm:flex sm:flex-wrap sm:items-baseline sm:gap-1.5">
          <dt className="text-xs text-subtle">{label}</dt>
          <dd className="break-words font-medium text-fg">
            {label === "Country of birth" ? <CountryFlag country={value} showName /> : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
