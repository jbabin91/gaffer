'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '#/components/ui/button';
import { logError } from '#/lib/logging/logger';
import { useEmailVerified } from '#/modules/auth/hooks/use-email-verified';
import { authClient } from '#/modules/auth/lib/client';
import {
  NETWORK_ERROR_MESSAGE,
  RATE_LIMITED_MESSAGE,
  VERIFICATION_SEND_FAILED_MESSAGE,
} from '#/modules/auth/messages';

const COOLDOWN_MS = 60_000;

export function VerificationBanner() {
  const { email, isSignedIn, verified } = useEmailVerified();
  const [dismissed, setDismissed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = setInterval(() => {
      setNowTs(Date.now());
      if (Date.now() >= cooldownUntil) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const remaining = Math.max(0, Math.ceil((cooldownUntil - nowTs) / 1000));

  async function requestLink() {
    if (!email || isSending || remaining > 0) return;
    setIsSending(true);
    try {
      // The server ignores this email and the callbackURL, binding the send to
      // the session user and a fixed post-verify redirect; email satisfies the
      // client type and keeps the success copy accurate.
      const { error } = await authClient.sendVerificationEmail({ email });
      if (error) {
        if (error.status === 429) {
          toast.error(RATE_LIMITED_MESSAGE);
        } else {
          logError(error, 'verification email send rejected');
          toast.error(VERIFICATION_SEND_FAILED_MESSAGE);
        }
        return;
      }
      toast.success(`Verification link sent — check ${email} (and spam).`);
      // In-memory cooldown is UX only; the server rate limit is the real cap.
      setCooldownUntil(Date.now() + COOLDOWN_MS);
    } catch (error) {
      logError(error, 'verification email request failed');
      toast.error(NETWORK_ERROR_MESSAGE);
    } finally {
      setIsSending(false);
    }
  }

  if (!isSignedIn || verified || dismissed) return null;

  return (
    <div
      className="border-b border-info-subtle-fg/15 bg-info-subtle text-info-subtle-fg"
      role="status"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 text-sm">
        <p>
          Verify your email to unlock creating careers and managing your squad.
          {email ? (
            <>
              {' '}
              We sent a link to <span className="font-medium">{email}</span>.
            </>
          ) : null}
        </p>
        <div className="flex items-center gap-1">
          <Button
            intent="outline"
            isDisabled={remaining > 0}
            isPending={isSending}
            size="sm"
            onPress={requestLink}
          >
            {remaining > 0 ? `Resend in ${remaining}s` : 'Send a new link'}
          </Button>
          <Button intent="plain" size="sm" onPress={() => setDismissed(true)}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
