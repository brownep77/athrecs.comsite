type AuthEmail = {
  to: string;
  subject: string;
  heading: string;
  message: string;
  actionLabel: string;
  actionUrl: string;
};

const text = (value: string | undefined): string | undefined => {
  const result = value?.trim();
  return result || undefined;
};

/**
 * The sender is public configuration, not a secret. Resend permits any sender
 * address on a verified domain, so ATHRECS keeps a safe built-in default and
 * leaves AUTH_EMAIL_FROM as an optional override.
 */
export const DEFAULT_AUTH_EMAIL_FROM = "ATHRECS Accounts <accounts@athrecs.com>";

export function authEmailFrom(): string {
  return text(process.env.AUTH_EMAIL_FROM) ?? DEFAULT_AUTH_EMAIL_FROM;
}

/** Transactional delivery is available as soon as the Resend key is present. */
export function authEmailConfigured(): boolean {
  return Boolean(text(process.env.RESEND_API_KEY));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendAthrecsAuthEmail(email: AuthEmail): Promise<void> {
  const apiKey = text(process.env.RESEND_API_KEY);
  if (!apiKey) {
    throw new Error("ATHRECS authentication email is not configured");
  }
  const from = authEmailFrom();

  const safeHeading = escapeHtml(email.heading);
  const safeMessage = escapeHtml(email.message);
  const safeLabel = escapeHtml(email.actionLabel);
  const safeUrl = escapeHtml(email.actionUrl);
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f7f7;font-family:Arial,sans-serif;color:#17212b">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #d9e2e4;border-radius:16px;overflow:hidden">
          <tr><td style="padding:24px 28px;background:#0f172a;color:#ffffff">
            <div style="font-size:22px;font-weight:700;letter-spacing:.04em">ATHRECS.com</div>
            <div style="margin-top:4px;color:#a5f3fc;font-size:12px;text-transform:uppercase;letter-spacing:.14em">Athlete Account</div>
          </td></tr>
          <tr><td style="padding:28px">
            <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25">${safeHeading}</h1>
            <p style="margin:0 0 24px;color:#52606d;font-size:15px;line-height:1.6">${safeMessage}</p>
            <p style="margin:0 0 24px">
              <a href="${safeUrl}" style="display:inline-block;border-radius:9px;background:#0891b2;color:#ffffff;padding:12px 18px;text-decoration:none;font-weight:700">${safeLabel}</a>
            </p>
            <p style="margin:0;color:#7b8794;font-size:12px;line-height:1.5">If the button does not work, copy this address into your browser:<br><span style="word-break:break-all">${safeUrl}</span></p>
          </td></tr>
        </table>
        <p style="max-width:560px;margin:16px auto 0;color:#7b8794;font-size:12px;line-height:1.5">If you did not request this, you can safely ignore the email. ATHRECS will never ask you to send a password by email.</p>
      </td></tr>
    </table>
  </body>
</html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email.to],
      subject: email.subject,
      html,
      text: `${email.heading}\n\n${email.message}\n\n${email.actionLabel}: ${email.actionUrl}\n\nIf you did not request this, you can ignore this email.`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[auth-email] delivery failed", {
      status: response.status,
      detail: detail.slice(0, 300),
    });
    throw new Error("ATHRECS could not send the account email");
  }
}
