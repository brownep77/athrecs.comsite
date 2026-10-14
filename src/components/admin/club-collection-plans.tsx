import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  getClubCollections,
  saveClubCollection,
  setupClubPilot,
  checkClubCollection,
} from "@/lib/club-scanner/api";
import type { CollectionConfig, SaveCollection } from "@/lib/club-scanner/collection";

const field = "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg";
const lines = (value: string) => value.split("\n");
const when = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        timeZone: "Europe/London",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not yet";
function newConfig(): CollectionConfig {
  return {
    aliases: [],
    sports: ["Running"],
    discover: true,
    urls: [],
    researchSources: [],
    researchBrief: "",
    historyFrom: `${new Date().getUTCFullYear() - 5}-01-01`,
    intervalHours: 24,
    recentDays: 45,
    publishApproved: true,
  };
}
export function ClubCollectionPlans() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["club-collections"],
    queryFn: () => getClubCollections(),
    refetchInterval: 30000,
  });
  const [edit, setEdit] = useState<SaveCollection | null>(null),
    [message, setMessage] = useState("");
  const refresh = async () => {
    await client.invalidateQueries({ queryKey: ["club-collections"] });
    await client.invalidateQueries({ queryKey: ["club-scans"] });
  };
  const fail = (error: Error) => setMessage(error.message);
  const save = useMutation({
    mutationFn: (data: SaveCollection) =>
      saveClubCollection({
        data: {
          ...data,
          config: {
            ...data.config,
            aliases: data.config.aliases.map((v) => v.trim()).filter(Boolean),
            urls: data.config.urls.map((v) => v.trim()).filter(Boolean),
            researchSources: data.config.researchSources.map((v) => v.trim()).filter(Boolean),
          },
        },
      }),
    onSuccess: async () => {
      setEdit(null);
      setMessage("Club collection settings saved.");
      await refresh();
    },
    onError: fail,
  });
  const pilot = useMutation({
    mutationFn: () => setupClubPilot(),
    onSuccess: async (r) => {
      setMessage(`${r.added} club plans added. Existing settings were kept.`);
      await refresh();
    },
    onError: fail,
  });
  const check = useMutation({
    mutationFn: (clubId: number) => checkClubCollection({ data: { clubId } }),
    onSuccess: async () => {
      setMessage("Check requested. Any current scan will finish first.");
      await refresh();
    },
    onError: fail,
  });
  const busy = save.isPending || pilot.isPending || check.isPending;
  const change = (next: Partial<CollectionConfig>) =>
    setEdit((previous) =>
      previous ? { ...previous, config: { ...previous.config, ...next } } : null,
    );
  return (
    <section
      className="space-y-4 rounded-xl border border-border bg-surface p-5"
      aria-labelledby="club-collection-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="club-collection-title" className="text-xl font-semibold">
            Regular club checks
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            Save a collection plan for each club. The first scan checks older results; later scans
            revisit recent races. You can leave this page while work continues.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={busy} onClick={() => pilot.mutate()}>
            Set up six-club pilot
          </Button>
          <Button
            disabled={busy}
            onClick={() => setEdit({ clubId: 0, revision: 0, enabled: true, config: newConfig() })}
          >
            Add a club plan
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted">
        Automatic table reader: Total Race Timing. Other websites and PDFs use the research process.
        Source-checked results still need a recorded athlete match before publication. Counts below
        cover this scanner; separately researched results are recorded in each club’s research
        update.
      </p>
      {query.isPending && <p>Loading club plans…</p>}
      {query.error && <p role="alert">Could not load club plans: {query.error.message}</p>}
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {query.data?.plans.map((plan) => (
          <article key={plan.club_id} className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <h3 className="font-semibold">{plan.name}</h3>
              <span className="text-sm">
                {!plan.enabled
                  ? "Paused"
                  : plan.run_status === "running"
                    ? "Checking sources"
                    : plan.run_status === "paused"
                      ? "Current scan paused"
                      : plan.errors
                        ? "Some sources need attention"
                        : "Scheduled"}
              </span>
            </div>
            <p className="text-sm text-muted">
              {plan.config.sports.join(" · ")} · Every {plan.config.intervalHours} hours · Recent{" "}
              {plan.config.recentDays} days
            </p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-muted">Sources checked this scan</dt>
                <dd>
                  {plan.checked} of {plan.sources} discovered
                </dd>
              </div>
              <div>
                <dt className="text-muted">Sources still to check</dt>
                <dd>{plan.waiting}</dd>
              </div>
              <div>
                <dt className="text-muted">Results published by scanner</dt>
                <dd>{plan.published}</dd>
              </div>
              <div>
                <dt className="text-muted">Results needing review</dt>
                <dd>{plan.review}</dd>
              </div>
              <div>
                <dt className="text-muted">Duplicate results skipped</dt>
                <dd>{plan.duplicates}</dd>
              </div>
              <div>
                <dt className="text-muted">New athlete profiles</dt>
                <dd>{plan.new_profiles}</dd>
              </div>
              <div>
                <dt className="text-muted">Last scan finished</dt>
                <dd>{when(plan.last_finished_at)}</dd>
              </div>
              <div>
                <dt className="text-muted">Next check, UK time</dt>
                <dd>
                  {!plan.enabled
                    ? "Paused"
                    : plan.run_status === "running"
                      ? "After current scan, when due"
                      : when(plan.next_check_at)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Last research update</dt>
                <dd>{when(plan.research_checked_at)}</dd>
              </div>
            </dl>
            {plan.last_error && (
              <p className="text-sm" role="status">
                Needs attention: {plan.last_error}
              </p>
            )}
            {typeof plan.research_checkpoint.summary === "string" && (
              <p className="text-sm">Research: {plan.research_checkpoint.summary}</p>
            )}
            <p className="text-xs text-muted">
              Progress measures discovered sources, not every race the club’s athletes have entered.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() =>
                  setEdit({
                    clubId: plan.club_id,
                    revision: plan.revision,
                    enabled: plan.enabled,
                    config: plan.config,
                  })
                }
              >
                Edit plan
              </Button>
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() =>
                  save.mutate({
                    clubId: plan.club_id,
                    revision: plan.revision,
                    enabled: !plan.enabled,
                    config: plan.config,
                  })
                }
              >
                {plan.enabled ? "Pause checks" : "Resume checks"}
              </Button>
              <Button
                variant="secondary"
                disabled={busy || !plan.enabled}
                onClick={() => check.mutate(plan.club_id)}
              >
                Check now
              </Button>
            </div>
          </article>
        ))}
      </div>
      {!query.isPending && !query.data?.plans.length && (
        <p className="text-sm">
          No regular checks are saved yet. Set up the pilot or choose another club.
        </p>
      )}
      {edit && (
        <form
          className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(edit);
          }}
        >
          <h3 className="font-semibold md:col-span-2">Club collection settings</h3>
          <label className="grid gap-1 text-sm">
            Club
            <select
              className={field}
              required
              value={edit.clubId || ""}
              disabled={edit.revision > 0}
              onChange={(event) => {
                const club = query.data?.clubs.find((c) => c.id === Number(event.target.value));
                const existing = query.data?.plans.find((p) => p.club_id === club?.id);
                if (existing)
                  setEdit({
                    clubId: existing.club_id,
                    revision: existing.revision,
                    enabled: existing.enabled,
                    config: existing.config,
                  });
                else
                  setEdit({
                    ...edit,
                    clubId: Number(event.target.value),
                    config: {
                      ...edit.config,
                      aliases: [
                        ...new Set(
                          [club?.name ?? "", ...(club?.source_names ?? "").split("|")].filter(
                            Boolean,
                          ),
                        ),
                      ],
                    },
                  });
              }}
            >
              <option value="">Choose a club</option>
              {query.data?.clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Names used in results, one per line
            <textarea
              className={field}
              rows={3}
              value={edit.config.aliases.join("\n")}
              onChange={(event) => change({ aliases: lines(event.target.value) })}
            />
          </label>
          <fieldset className="space-y-2">
            <legend className="text-sm">Sports to research</legend>
            <div className="flex flex-wrap gap-3">
              {(["Running", "Athletics", "Triathlon", "Cycling", "Swimming"] as const).map(
                (sport) => (
                  <label key={sport} className="flex gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={edit.config.sports.includes(sport)}
                      onChange={(event) =>
                        change({
                          sports: event.target.checked
                            ? [...edit.config.sports, sport]
                            : edit.config.sports.filter((s) => s !== sport),
                        })
                      }
                    />
                    {sport}
                  </label>
                ),
              )}
            </div>
          </fieldset>
          <label className="grid gap-1 text-sm">
            Historical results from
            <input
              className={field}
              type="date"
              required
              value={edit.config.historyFrom}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => change({ historyFrom: event.target.value })}
            />
            <span className="text-xs text-muted">
              Used for the first scan. Use the one-off scan below for further historical searches.
            </span>
          </label>
          <label className="grid gap-1 text-sm">
            Hours between checks
            <input
              className={field}
              type="number"
              min={1}
              max={168}
              required
              value={edit.config.intervalHours}
              onChange={(event) => change({ intervalHours: Number(event.target.value) })}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Days of recent results to revisit
            <input
              className={field}
              type="number"
              min={7}
              max={180}
              required
              value={edit.config.recentDays}
              onChange={(event) => change({ recentDays: Number(event.target.value) })}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Specific result pages, one per line
            <textarea
              className={field}
              rows={3}
              value={edit.config.urls.join("\n")}
              onChange={(event) => change({ urls: lines(event.target.value) })}
            />
            <span className="text-xs text-muted">
              Supported tables are read automatically. Other links are held for research.
            </span>
          </label>
          <label className="grid gap-1 text-sm">
            Websites for research, one per line
            <textarea
              className={field}
              rows={3}
              value={edit.config.researchSources.join("\n")}
              onChange={(event) => change({ researchSources: lines(event.target.value) })}
            />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            What should we look for?
            <textarea
              className={field}
              rows={3}
              maxLength={3000}
              value={edit.config.researchBrief}
              onChange={(event) => change({ researchBrief: event.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={edit.config.discover}
              onChange={(event) => change({ discover: event.target.checked })}
            />
            Find races in Total Race Timing’s archive
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={edit.config.publishApproved}
              onChange={(event) => change({ publishApproved: event.target.checked })}
            />
            Publish results after their review is approved
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={edit.enabled}
              onChange={(event) => setEdit({ ...edit, enabled: event.target.checked })}
            />
            Keep checking this club
          </label>
          <div className="flex gap-2 md:col-span-2">
            <Button disabled={busy || !edit.clubId}>Save club plan</Button>
            <Button type="button" variant="secondary" onClick={() => setEdit(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
