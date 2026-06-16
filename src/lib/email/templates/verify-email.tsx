import {
  EmailButton,
  EmailFallbackLink,
  EmailLayout,
  EmailText,
} from '#/lib/email/components';

type VerifyEmailProps = { name?: string; url: string };

export function VerifyEmail({ name, url }: VerifyEmailProps) {
  return (
    <EmailLayout
      footnote="You're receiving this because an account was created with this email address. If that wasn't you, you can ignore this message."
      heading="Verify your email"
      preview="Verify your email address to finish setting up your account"
    >
      <EmailText>{name ? `Hi ${name},` : 'Hi,'}</EmailText>
      <EmailText>
        Confirm this email address to finish setting up your account.
      </EmailText>
      <EmailButton href={url}>Verify email</EmailButton>
      <EmailFallbackLink url={url} />
    </EmailLayout>
  );
}

VerifyEmail.PreviewProps = {
  name: 'Sam',
  url: 'https://app.example.com/verify-email?token=preview-token',
} satisfies VerifyEmailProps;

export default VerifyEmail;
