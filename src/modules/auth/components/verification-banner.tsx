'use client';

import { useEffect, useRef, useState } from 'react';
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
// Where the verification link returns the user; they land here already signed in.
const CALLBACK_URL = '/squad';

export function VerificationBanner() {
  const { email, isSignedIn, verified } = useEmailVerified();
  const [dismissed, setDismissed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [nowTs, setNowTs] = useState(() => Date.now());

  // Toast only when a previously-seen-unverified user becomes verified, not when
  // an already-verified session finishes loading. Focus-based session refetch
  // means verifying in another tab clears the banner on return.
  const sawUnverifiedRef = useRef(false);
  useEffect(() => {
    if (isSignedIn && !verified) {
      sawUnverifiedRef.current = true;
    } else if (verified && sawUnverifiedRef.current) {
      sawUnverifiedRef.current = false;
      toast.success("Email verified — you're all set.");
    }
  }, [isSignedIn, verified]);

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
      const { error } = await authClient.sendVerificationEmail({
        callbackURL: CALLBACK_URL,
        email,
      });
      if (error) {
        if (error.status === 429) {
          toast.error(RATE_LIMITED_MESSAGE);
        } else {
          // A non-429 rejection means the send is failing for real (5xx, mail
          // provider down); surface curated copy but log the cause.
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
