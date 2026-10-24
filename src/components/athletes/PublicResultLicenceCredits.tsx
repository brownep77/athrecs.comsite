import {
  publicResultLicenceCredit,
  publicResultLicenceCreditIds,
  type PublicResultLicenceCreditId,
} from "@/lib/athrecs/public-result-licence";

export function PublicResultLicenceCredits({
  credits,
}: {
  credits?: readonly PublicResultLicenceCreditId[];
}) {
  const ids = publicResultLicenceCreditIds(credits);
  if (!ids.length) return null;
  return (
    <aside
      aria-label="Data licence credits"
      className="space-y-1 text-xs leading-relaxed text-muted"
    >
      {ids.map((id) => {
        const credit = publicResultLicenceCredit(id);
        return (
          <p key={id}>
            Data credit: {credit.creator},{" "}
            <a href={credit.publicationUrl} className="text-accent underline underline-offset-2">
              {credit.title}
            </a>
            {" ("}
            <a href={credit.licenceUrl} className="text-accent underline underline-offset-2">
              {credit.licence}
            </a>
            ). {credit.changes}
          </p>
        );
      })}
    </aside>
  );
}
