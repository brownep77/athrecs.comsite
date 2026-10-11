import { resultVerification } from "@/lib/athrecs/profile-result-presentation";

export function ResultVerificationBadge({
  status,
  provider,
  conflicting = false,
}: {
  status?: string;
  provider?: string | null;
  conflicting?: boolean;
}) {
  const verification = resultVerification(status, provider, conflicting);
  return (
    <span
      title={verification.explanation}
      className={`mt-1 block text-[11px] font-medium ${verification.verified ? "text-emerald-700 dark:text-emerald-300" : "text-muted"}`}
    >
      {verification.verified ? "Verified" : "Unverified"}
    </span>
  );
}
