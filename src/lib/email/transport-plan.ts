/** Nodemailer connection: a provider URL (SMTP2GO) or explicit options (Cloudflare). */
export type SmtpConnection =
  | string
  | {
      auth: { pass: string; user: string };
      host: string;
      port: number;
      secure: boolean;
    };

export type EmailTransportPlan =
  | { kind: 'log' }
  | { connection: SmtpConnection; from: string; kind: 'smtp' };

type PlanInput = {
  cfEmailToken?: string;
  emailFrom?: string;
  isProd: boolean;
  smtpUrl?: string;
};

const CLOUDFLARE_SMTP = {
  host: 'smtp.mx.cloudflare.net',
  port: 465,
  secure: true,
} as const;

/**
 * Selects the email transport from env. SMTP_URL wins over CF_EMAIL_TOKEN so a
 * Cloudflare regression can be routed around with one variable; with neither
 * set, dev logs the link and prod fails fast rather than silently dropping mail.
 *
 * @throws if an SMTP transport is configured without EMAIL_FROM, or if no
 * transport is configured in production.
 */
export function planEmailTransport(input: PlanInput): EmailTransportPlan {
  const { cfEmailToken, emailFrom, isProd, smtpUrl } = input;

  if (smtpUrl) return smtpPlan(smtpUrl, emailFrom);
  if (cfEmailToken) {
    return smtpPlan(
      { ...CLOUDFLARE_SMTP, auth: { pass: cfEmailToken, user: 'api_token' } },
      emailFrom,
    );
  }
  if (isProd) {
    throw new Error(
      'No email transport configured: set CF_EMAIL_TOKEN or SMTP_URL',
    );
  }
  return { kind: 'log' };
}

function smtpPlan(
  connection: SmtpConnection,
  emailFrom: string | undefined,
): EmailTransportPlan {
  if (!emailFrom) {
    throw new Error('EMAIL_FROM is required when an SMTP transport is set');
  }
  return { connection, from: emailFrom, kind: 'smtp' };
}
