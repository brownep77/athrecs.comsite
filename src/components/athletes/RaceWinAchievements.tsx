import { Trophy } from "lucide-react";
import type { RaceWinAchievement } from "@/lib/athrecs/race-win-achievements";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { ProfileEventLink } from "./ProfileEventLink";
import { distanceColourClass } from "@/lib/athrecs/profile-colours";

export function RaceWinAchievements({
  wins,
  showEvidence = false,
}: {
  wins: RaceWinAchievement[];
  showEvidence?: boolean;
}) {
  if (!wins.length) return null;
  return (
    <div className="space-y-2" aria-label="Race wins by distance">
      <h3 className="text-sm font-semibold">Race wins by distance</h3>
      <div className="grid items-start gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {wins.map((win) => (
          <details
            key={win.id}
            data-achievement="race-win"
            data-win-kind={win.kind}
            className={`rounded-lg border p-3 ${distanceColourClass(win.distance)}`}
          >
            <summary className="flex cursor-pointer list-none items-start gap-2">
              <Trophy
                className="mt-0.5 size-5 shrink-0 rounded bg-amber-100 p-0.5 text-amber-800"
                aria-hidden="true"
              />
              <span>
                <strong className="block text-sm">{win.distance} winner</strong>
                <span className="block text-xs">
                  {win.sport} · {win.label}
                </span>
                <span className="mt-1 block text-xs font-semibold">
                  {win.results.length} {win.results.length === 1 ? "win" : "wins"} · View races
                </span>
              </span>
            </summary>
            <ul className="mt-3 space-y-3 border-t border-current/20 pt-3 text-xs">
              {win.results.map((evidence, index) => (
                <li key={`${evidence.date}:${evidence.event}:${index}`} className="space-y-1">
                  <p className="font-semibold">
                    {evidence.result ? (
                      <ProfileEventLink
                        result={evidence.result}
                        className="underline underline-offset-2"
                      >
                        {evidence.event}
                      </ProfileEventLink>
                    ) : (
                      <a
                        href={evidence.sourceUrls[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                      >
                        {evidence.event}
                      </a>
                    )}
                  </p>
                  <p>
                    {formatRaceDateShort(evidence.date)}
                    {evidence.performance || evidence.result?.finishTimeSeconds
                      ? ` · ${evidence.performance ?? formatDuration(evidence.result!.finishTimeSeconds)}`
                      : ""}
                  </p>
                  <p>1st in {win.label.toLowerCase()}</p>
                  {showEvidence &&
                    evidence.sourceUrls.map((url, sourceIndex) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mr-3 inline-block underline underline-offset-2"
                      >
                        Source{evidence.sourceUrls.length > 1 ? ` ${sourceIndex + 1}` : ""} ↗
                      </a>
                    ))}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
