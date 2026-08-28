import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpenText,
  EyeOff,
  Loader2,
  PenLine,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getMyAthleteBio,
  saveMyAthleteBio,
  type AthleteBioMode,
} from "@/lib/athrecs/athlete-bio-api";

const BIO_MAX_LENGTH = 1200;

export function AthleteBioCard() {
  const queryClient = useQueryClient();
  const bio = useQuery({
    queryKey: ["my-athlete-bio"],
    queryFn: () => getMyAthleteBio(),
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  });
  const [editing, setEditing] = useState(false);
  const [mode, setMode] = useState<AthleteBioMode>("automatic");
  const [customBio, setCustomBio] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!bio.data || editing) return;
    setMode(bio.data.mode);
    setCustomBio(bio.data.customBio);
  }, [bio.data, editing]);

  const save = useMutation({
    mutationFn: () => saveMyAthleteBio({ data: { mode, customBio } }),
    onSuccess: (data) => {
      queryClient.setQueryData(["my-athlete-bio"], data);
      setMode(data.mode);
      setCustomBio(data.customBio);
      setEditing(false);
      setMessage(
        data.mode === "automatic"
          ? "Automatic bio saved. It will refresh as more results are added."
          : data.mode === "custom"
            ? "Your custom bio has been saved."
            : "The About section is hidden.",
      );
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  function cancelEditing() {
    setMode(bio.data?.mode ?? "automatic");
    setCustomBio(bio.data?.customBio ?? "");
    setEditing(false);
    setMessage(null);
  }

  if (bio.isLoading) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Preparing your profile bio…
        </p>
      </section>
    );
  }

  if (bio.isError || !bio.data) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-fg">About me</h2>
            <p className="mt-1 text-sm text-muted">Your bio could not be loaded.</p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => void bio.refetch()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        </div>
      </section>
    );
  }

  const data = bio.data;
  const customBioInvalid = mode === "custom" && customBio.trim().length < 10;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4 p-5 md:p-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent">
              <BookOpenText className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-subtle">
                Athlete story
              </p>
              <h2 className="font-display text-xl font-semibold text-fg">About me</h2>
            </div>
            <Badge variant="outline">{modeLabel(data.mode)}</Badge>
          </div>

          {data.mode === "hidden" ? (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-elevated p-4 text-sm text-muted">
              <span className="flex items-center gap-2 font-medium text-fg">
                <EyeOff className="size-4 text-accent" aria-hidden="true" />
                Bio hidden
              </span>
              <p className="mt-1">
                The About section is turned off. You can restore the automatic bio at any time.
              </p>
            </div>
          ) : (
            <p className="mt-4 max-w-4xl whitespace-pre-line text-sm leading-7 text-fg">
              {data.displayBio}
            </p>
          )}

          {data.mode === "automatic" ? (
            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              Generated only from information already in your private Athlete Account and
              {` ${data.generatedFromResultCount} linked ${data.generatedFromResultCount === 1 ? "result" : "results"}`}. It refreshes when more results are uploaded or linked.
            </p>
          ) : null}
        </div>

        {!editing ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditing(true);
              setMessage(null);
            }}
          >
            <PenLine className="size-4" aria-hidden="true" />
            {data.mode === "hidden" ? "Add bio" : "Edit bio"}
          </Button>
        ) : null}
      </div>

      {editing ? (
        <div className="space-y-5 border-t border-border bg-elevated p-5 md:p-6">
          <fieldset className="space-y-3">
            <legend className="font-semibold text-fg">Choose how your bio works</legend>
            <BioModeChoice
              checked={mode === "automatic"}
              icon={Sparkles}
              title="Automatic"
              description="Recommended. ATHRECS rewrites the factual summary whenever linked results change."
              onSelect={() => setMode("automatic")}
            />
            <BioModeChoice
              checked={mode === "custom"}
              icon={PenLine}
              title="Write my own"
              description="Use your own wording. Custom text stays unchanged when new results arrive."
              onSelect={() => setMode("custom")}
            />
            <BioModeChoice
              checked={mode === "hidden"}
              icon={EyeOff}
              title="Hide bio"
              description="Keep the About section off your private Athlete Profile."
              onSelect={() => setMode("hidden")}
            />
          </fieldset>

          {mode === "automatic" ? (
            <div className="rounded-xl border border-accent/25 bg-accent-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                Automatic preview
              </p>
              <p className="mt-2 text-sm leading-7 text-fg">{data.generatedBio}</p>
            </div>
          ) : null}

          {mode === "custom" ? (
            <label className="block space-y-2">
              <span className="font-semibold text-fg">Your bio</span>
              <textarea
                value={customBio}
                onChange={(event) => setCustomBio(event.target.value.slice(0, BIO_MAX_LENGTH))}
                rows={7}
                maxLength={BIO_MAX_LENGTH}
                placeholder="Tell your sporting story, what motivates you, and the events or goals that matter to you."
                className="w-full resize-y rounded-xl border border-border bg-bg px-4 py-3 text-sm leading-6 text-fg outline-none focus:ring-2 focus:ring-accent/30"
              />
              <span className="flex justify-between gap-3 text-xs text-muted">
                <span>At least 10 characters. This remains private with your ordinary profile.</span>
                <span className="tabular-nums">
                  {customBio.length}/{BIO_MAX_LENGTH}
                </span>
              </span>
            </label>
          ) : null}

          {message ? (
            <p className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-accent" role="status">
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" disabled={save.isPending} onClick={cancelEditing}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={save.isPending || customBioInvalid}
              onClick={() => {
                setMessage(null);
                save.mutate();
              }}
            >
              {save.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
              {save.isPending ? "Saving bio…" : "Save bio"}
            </Button>
          </div>
        </div>
      ) : message ? (
        <p className="border-t border-border bg-elevated px-5 py-3 text-sm text-accent" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}

function BioModeChoice({
  checked,
  icon: Icon,
  title,
  description,
  onSelect,
}: {
  checked: boolean;
  icon: typeof Sparkles;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
        checked ? "border-accent bg-accent-soft" : "border-border bg-surface hover:border-accent/50"
      }`}
    >
      <input
        type="radio"
        name="athlete-bio-mode"
        checked={checked}
        onChange={onSelect}
        className="mt-1 size-4"
      />
      <Icon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
      <span>
        <strong className="block text-sm text-fg">{title}</strong>
        <span className="mt-1 block text-xs leading-5 text-muted">{description}</span>
      </span>
    </label>
  );
}

function modeLabel(mode: AthleteBioMode): string {
  if (mode === "automatic") return "Automatic";
  if (mode === "custom") return "Written by me";
  return "Hidden";
}
