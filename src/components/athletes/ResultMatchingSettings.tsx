import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  getMyMatchingSettings,
  saveMyMatchingSettings,
} from "@/lib/athrecs/result-matching-settings-api";
import type { MatchingSettings } from "@/lib/athrecs/result-matching-settings";

export function ResultMatchingSettings() {
  const settings = useQuery({
    queryKey: ["my-matching-settings"],
    queryFn: () => getMyMatchingSettings(),
    retry: false,
  });
  if (settings.isPending) return <p role="status">Loading private matching options…</p>;
  if (settings.isError)
    return (
      <p role="alert">
        Matching options could not be loaded.{" "}
        <button type="button" className="underline" onClick={() => void settings.refetch()}>
          Try again
        </button>
      </p>
    );
  return <MatchingSettingsForm initial={settings.data} />;
}
function MatchingSettingsForm({ initial }: { initial: MatchingSettings }) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);
  const client = useQueryClient();
  const [surnameSlots, setSurnameSlots] = useState(Math.max(3, initial.otherSurnames.length));
  const [linkSlots, setLinkSlots] = useState(Math.max(3, initial.sourceUrls.length));
  const set = <K extends keyof MatchingSettings>(key: K, next: MatchingSettings[K]) => {
    setSaved(false);
    setValue((prev) => ({ ...prev, [key]: next }));
  };
  const save = useMutation({
    mutationFn: () =>
      saveMyMatchingSettings({
        data: {
          ...value,
          otherSurnames: value.otherSurnames.filter((x) => x?.trim()),
          sourceUrls: value.sourceUrls.filter((x) => x?.trim()),
        },
      }),
    onSuccess: async () => {
      setSaved(true);
      client.setQueriesData(
        { queryKey: ["my-external-runner-matches"] },
        {
          available: false,
          consentRequired: false,
          cached: false,
          searchedNames: [],
          matches: [],
          message:
            "Matching options changed. Choose Search saved links and public results to run a new search.",
        },
      );
      await Promise.all(
        [
          "my-matching-settings",
          "my-potential-result-matches",
          "my-archive-suggestions",
          "my-external-runner-matches",
        ].map((key) => client.invalidateQueries({ queryKey: [key] })),
      );
    },
  });
  const inputClass = "mt-1 h-11 w-full rounded-lg border border-border bg-bg px-3";
  return (
    <section className="mt-6 space-y-4 rounded-xl border border-border p-4">
      <h3 className="font-semibold">Other surnames and result links</h3>
      <p className="text-sm text-muted">
        We combine these surnames with your first name. For a nickname, changed first name or
        different full racing name, use Previous or known-as names above (up to eight full names).
        Matching names alone never proves ownership.
      </p>
      <label className="block text-sm">
        Maiden surname (optional)
        <input
          className={inputClass}
          maxLength={120}
          value={value.maidenName}
          onChange={(e) => set("maidenName", e.target.value)}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: surnameSlots }, (_, i) => (
          <label className="text-sm" key={i}>
            Other surname {i + 1} (optional)
            <input
              className={inputClass}
              maxLength={120}
              value={value.otherSurnames[i] ?? ""}
              onChange={(e) => {
                const a = [...value.otherSurnames];
                a[i] = e.target.value;
                set("otherSurnames", a);
              }}
            />
          </label>
        ))}
      </div>
      {surnameSlots < 8 ? (
        <Button type="button" variant="secondary" onClick={() => setSurnameSlots((n) => n + 1)}>
          Add another surname
        </Button>
      ) : null}
      <h3 className="pt-3 font-semibold">Additional athlete profiles and results links</h3>
      <p className="text-sm text-muted">
        Add up to ten public links, including Power of 10, parkrun, ANZ rankings and official result
        pages. Recognised athlete IDs help find stored results. The optional public search checks
        saved links where accessible; it does not automatically import or verify races.
      </p>
      {Array.from({ length: linkSlots }, (_, i) => (
        <label className="block text-sm" key={i}>
          Result or athlete profile link {i + 1} (optional)
          <input
            type="url"
            className={inputClass}
            maxLength={2048}
            placeholder="https://"
            value={value.sourceUrls[i] ?? ""}
            onChange={(e) => {
              const a = [...value.sourceUrls];
              a[i] = e.target.value;
              set("sourceUrls", a);
            }}
          />
        </label>
      ))}
      {linkSlots < 10 ? (
        <Button type="button" variant="secondary" onClick={() => setLinkSlots((n) => n + 1)}>
          Add another link
        </Button>
      ) : null}
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={value.externalSearchConsent}
          onChange={(e) => set("externalSearchConsent", e.target.checked)}
        />
        <span>
          Allow public-results searches using xAI. When I choose Search saved links and public
          results, share my racing names, saved links, sporting IDs, club and general location with
          xAI to find possible results. Never send my birth date, street address, phone or email. I
          can turn this off and save to stop searches and clear cached suggestions. This is separate
          from marketing and performance insights. This adult-only search checks my saved birth
          date. Without one, I can still claim profiles, search stored results or ask staff for
          assistance. The provider must report zero data retention. Any known-race details are also
          shared. Nationality and postcode are not sent.
        </span>
      </label>
      <details className="rounded-lg border border-border p-3">
        <summary className="cursor-pointer font-medium">Optional private address and phone</summary>
        <p className="mt-3 text-sm text-muted">
          Only add these if you want AthRecs to use them for account-support contact. They are not
          needed to find results, sign in or claim a profile.
        </p>
        <label className="mt-3 block text-sm">
          Postal address (optional)
          <textarea
            autoComplete="street-address"
            className="mt-1 w-full rounded-lg border border-border bg-bg p-3"
            maxLength={500}
            value={value.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </label>
        <label className="mt-3 block text-sm">
          Phone number (optional)
          <input
            type="tel"
            autoComplete="tel"
            className={inputClass}
            maxLength={40}
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </label>
        <label className="mt-3 flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.contactConsent}
            onChange={(e) => {
              set("contactConsent", e.target.checked);
              if (!e.target.checked) {
                set("address", "");
                set("phone", "");
              }
            }}
          />
          <span>
            Use these optional contact details for account support only. Turning this off and saving
            removes them.
          </span>
        </label>
      </details>
      <p className="text-xs text-muted">
        All names, source IDs, links and contact details in this section stay private. Clear any
        optional field and save to remove it.{" "}
        <Link to="/privacy" className="text-accent underline">
          How your matching data is used
        </Link>
        .
      </p>
      <Button type="button" onClick={() => save.mutate()} disabled={save.isPending}>
        {save.isPending ? "Saving…" : "Save matching and contact options"}
      </Button>
      {saved ? (
        <p role="status">Matching options saved. Return to Potential results to search.</p>
      ) : null}
      {save.isError ? (
        <p role="alert" className="text-sm text-red-700">
          {save.error.message}
        </p>
      ) : null}
    </section>
  );
}
