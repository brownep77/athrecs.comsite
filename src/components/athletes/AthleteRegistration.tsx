import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  saveMyAthleteRegistration,
  type AthleteAccountData,
} from "@/lib/athrecs/athlete-account-api";

export function AthleteRegistration({
  account,
  onSaved,
}: {
  account: AthleteAccountData;
  onSaved: (account: AthleteAccountData) => void;
}) {
  // Do not guess how a provider's full name should be split across cultures.
  const [details, setDetails] = useState({
    firstName: "",
    surname: "",
    singleName: false,
    dateOfBirth: account.dateOfBirth,
    nationality: account.nationality,
    country: account.country,
    postcode: account.postcode,
    region: account.region,
    clubOrTeam: account.clubOrTeam,
    privacyAcknowledged: false,
  });
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: () => saveMyAthleteRegistration({ data: details }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["my-athlete-account"], updated);
      void queryClient.invalidateQueries({ queryKey: ["my-potential-result-matches"] });
      void queryClient.invalidateQueries({ queryKey: ["my-archive-suggestions"] });
      onSaved(updated);
    },
  });
  const field = (
    key:
      | "firstName"
      | "surname"
      | "dateOfBirth"
      | "nationality"
      | "country"
      | "postcode"
      | "region"
      | "clubOrTeam",
    label: string,
    required: boolean,
    autoComplete?: string,
    maxLength = 100,
  ) => (
    <label className="block min-w-0 space-y-2 text-sm font-medium">
      <span>
        {label}
        {required ? " *" : " (optional)"}
      </span>
      <input
        required={required}
        type={key === "dateOfBirth" ? "date" : "text"}
        autoComplete={autoComplete}
        maxLength={maxLength}
        max={key === "dateOfBirth" ? new Date().toISOString().slice(0, 10) : undefined}
        value={details[key]}
        onChange={(event) => setDetails({ ...details, [key]: event.target.value })}
        className="h-11 w-full min-w-0 rounded-lg border border-border bg-bg px-3 text-fg"
      />
    </label>
  );
  return (
    <form
      className="max-w-2xl space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <h3 className="text-lg font-semibold">Find your results</h3>
      <p className="text-sm text-muted">
        Tell us the name you race under and a few matching details. We’ll search existing AthRecs
        results next. You choose which are yours.
      </p>
      {account.fullName ? (
        <p className="text-sm">Account name: {account.fullName}. Confirm your racing name below.</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("firstName", "First name(s)", true, "given-name", 120)}
        {field("surname", "Surname / family name", !details.singleName, "family-name", 120)}
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={details.singleName}
          onChange={(event) => setDetails({ ...details, singleName: event.target.checked })}
        />
        I use a single name (no surname)
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("dateOfBirth", "Date of birth", true, "bday")}
        {field("nationality", "Nationality", true)}
        {field("country", "Country of residence", true, "country-name")}
        {field("postcode", "Postcode / ZIP code", false, "postal-code", 30)}
        {field("region", "Broader area / region", false, "address-level1", 120)}
        {field("clubOrTeam", "Running club / sporting affiliation", false, "organization", 160)}
      </div>
      <p className="text-xs text-muted">
        Use any country or nationality, including dual nationality or Stateless. No postal code?
        Give a broader area if helpful. Club membership is optional.
      </p>
      <p className="text-sm text-muted">
        Your date of birth and detailed location stay private. These details do not publish a
        profile, claim results or verify your identity. You can add previous names and sporting
        profile links afterwards.
      </p>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          required
          checked={details.privacyAcknowledged}
          onChange={(event) =>
            setDetails({ ...details, privacyAcknowledged: event.target.checked })
          }
        />
        <span>
          I acknowledge the{" "}
          <Link to="/privacy" className="underline">
            privacy notice
          </Link>{" "}
          and the use of these details to find possible results.
        </span>
      </label>
      {save.isError ? (
        <p role="alert" className="text-sm text-red-700">
          {save.error.message}
        </p>
      ) : null}
      <Button type="submit" disabled={save.isPending}>
        {save.isPending ? "Finding your results…" : "Save details and find my results"}
      </Button>
      <p className="text-sm">
        <Link to="/athlete-results" className="underline">
          Add a missing race performance (optional)
        </Link>
        . Submissions require source information and review; they are not automatically verified.
      </p>
    </form>
  );
}
