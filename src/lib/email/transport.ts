import '@tanstack/react-start/server-only';

import { createTransport, type Transporter } from 'nodemailer';

import { env } from '#/configs/env/server';
import { logger } from '#/lib/logging/logger';

import { planEmailTransport } from './transport-plan';

export type EmailMessage = {
  html: string;
  subject: string;
  text?: string;
  to: string;
  /**
   * Surfaced as a standalone line by the dev log transport so the verification
   * / reset link is clickable in the terminal; real SMTP transports ignore it.
   */
  url?: string;
};

let cached: { from: string; transporter: Transporter } | undefined;

const planFromEnv = () =>
  planEmailTransport({
    cfEmailToken: env.CF_EMAIL_TOKEN,
    emailFrom: env.EMAIL_FROM,
    isProd: import.meta.env.PROD,
    smtpUrl: env.SMTP_URL,
  });

/**
 * Called at auth startup: Better Auth runs its email callbacks through a handler
 * that swallows rejections, so a per-send throw never reaches the response —
 * without this, a prod deploy missing a transport would return 200 from
 * signup/reset while sending nothing. Failing here makes that misconfiguration
 * crash on boot.
 *
 * @throws if production has no transport configured, or an SMTP transport is set
 * without EMAIL_FROM.
 */
export function assertEmailTransportConfigured(): void {
  planFromEnv();
}

/**
 * With no SMTP transport configured (dev), logs the message and `url` instead
 * of sending.
 *
 * @throws if production has no transport configured, or if an SMTP transport is
 * set without EMAIL_FROM.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const plan = planFromEnv();

  if (plan.kind === 'log') {
    logger.info(
      { subject: message.subject, to: message.to, url: message.url },
      'email not sent (dev log transport; set EMAIL_FROM + CF_EMAIL_TOKEN or SMTP_URL to send)',
    );
    return;
  }

  // Env is fixed for the process lifetime, so caching the transporter is safe.
  cached ??= { from: plan.from, transporter: createTransport(plan.connection) };

  try {
    await cached.transporter.sendMail({
      from: cached.from,
      html: message.html,
      subject: message.subject,
      text: message.text,
      to: message.to,
    });
  } catch (error) {
    logger.error(
      { err: error, subject: message.subject, to: message.to },
      'email send failed',
    );
    throw error;
  }
}
