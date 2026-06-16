import {
  EmailButton,
  EmailFallbackLink,
  EmailLayout,
  EmailText,
} from '#/lib/email/components';

type ResetPasswordEmailProps = { name?: string; url: string };

export function ResetPasswordEmail({ name, url }: ResetPasswordEmailProps) {
  return (
    <EmailLayout
      footnote="If you didn't request a password reset, you can safely ignore this email — your password won't change."
      heading="Reset your password"
      preview="Reset your password"
    >
      <EmailText>{name ? `Hi ${name},` : 'Hi,'}</EmailText>
      <EmailText>
        We received a request to reset your password. Choose a new one with the
        button below. This link expires in one hour.
      </EmailText>
      <EmailButton href={url}>Reset password</EmailButton>
      <EmailFallbackLink url={url} />
    </EmailLayout>
  );
}

ResetPasswordEmail.PreviewProps = {
  name: 'Sam',
  url: 'https://app.example.com/reset-password/preview-token',
} satisfies ResetPasswordEmailProps;

export default ResetPasswordEmail;
