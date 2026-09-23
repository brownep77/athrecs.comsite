import { Trophy } from "lucide-react";
import type { RaceWinAchievement } from "@/lib/athrecs/race-win-achievements";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { ProfileEventLink } from "./ProfileEventLink";

export function RaceWinAchievements({ wins }: { wins: RaceWinAchievement[] }) {
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
            className="rounded-lg border border-amber-400 bg-amber-50 p-3 text-amber-950 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-100"
          >
            <summary className="flex cursor-pointer list-none items-start gap-2">
              <Trophy
                className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300"
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
            <ul className="mt-3 space-y-3 border-t border-amber-300 pt-3 text-xs dark:border-amber-800">
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
                  {evidence.sourceUrls.map((url, sourceIndex) => (
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
