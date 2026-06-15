// Keeps nodemailer out of the client bundle.
import '@tanstack/react-start/server-only';

import { createTransport, type Transporter } from 'nodemailer';

import { env } from '#/configs/env';
import { logger } from '#/lib/logger';

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

/**
 * Sends a transactional email via the env-selected transport. With no SMTP
 * transport configured (dev), it logs the message and `url` instead of sending.
 *
 * @throws if production has no transport configured, or if an SMTP transport is
 * set without EMAIL_FROM.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const plan = planEmailTransport({
    cfEmailToken: env.CF_EMAIL_TOKEN,
    emailFrom: env.EMAIL_FROM,
    isProd: import.meta.env.PROD,
    smtpUrl: env.SMTP_URL,
  });

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
