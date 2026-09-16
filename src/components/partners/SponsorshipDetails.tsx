import { ENQUIRY_KINDS, SUPPORT_TYPES, type SponsorshipEnquiry } from "@/lib/sponsorship";

export function SponsorshipDetails({ enquiry: item }: { enquiry: SponsorshipEnquiry }) {
  return (
    <div className="space-y-2 break-words text-sm">
      <p>
        {ENQUIRY_KINDS[item.kind]} · {SUPPORT_TYPES[item.support]}
      </p>
      <p>
        {item.location}
        {item.event_date ? ` · Race date: ${item.event_date}` : ""}
      </p>
      <a
        href={item.website}
        target="_blank"
        rel="noreferrer"
        className="break-all text-accent underline"
      >
        Website or public profile
      </a>
      {item.budget ? (
        <p>
          <strong>Budget / support: </strong>
          {item.budget}
        </p>
      ) : null}
      {item.reach ? (
        <p>
          <strong>Audience supplied by applicant: </strong>
          {item.reach}
        </p>
      ) : null}
      <p className="whitespace-pre-wrap">{item.message}</p>
      {item.response ? (
        <div className="rounded-lg bg-elevated p-3">
          <p className="font-semibold">Team response</p>
          <p className="mt-1 whitespace-pre-wrap">{item.response}</p>
        </div>
      ) : null}
    </div>
  );
}
