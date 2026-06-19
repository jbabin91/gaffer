import {
  EmailButton,
  EmailFallbackLink,
  EmailLayout,
  EmailText,
} from '#/lib/email/components';

type ChangeEmailProps = { name?: string; newEmail: string; url: string };

export function ChangeEmailConfirmation({
  name,
  newEmail,
  url,
}: ChangeEmailProps) {
  return (
    <EmailLayout
      footnote="If you didn't request this, ignore this message and your email stays the same."
      heading="Confirm your new email"
      preview="Confirm the change to your account email address"
    >
      <EmailText>{name ? `Hi ${name},` : 'Hi,'}</EmailText>
      <EmailText>
        Confirm changing your account email to {newEmail}. This link went to
        your current address so only you can authorize the change.
      </EmailText>
      <EmailText>
        After you confirm, we'll email {newEmail} a final link to finish the
        change.
      </EmailText>
      <EmailButton href={url}>Confirm email change</EmailButton>
      <EmailFallbackLink url={url} />
    </EmailLayout>
  );
}

ChangeEmailConfirmation.PreviewProps = {
  name: 'Sam',
  newEmail: 'new@example.com',
  url: 'https://app.example.com/verify-email?token=preview-token',
} satisfies ChangeEmailProps;

export default ChangeEmailConfirmation;
