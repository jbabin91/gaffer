import type { ReactNode } from 'react';

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from 'react-email';

// Email-safe hex mirrors of the app's design tokens (src/styles/globals.css).
// Email clients render neither oklch() nor CSS variables, and the Tailwind
// `config` can't read the v4 `@theme`, so the light-theme values are inlined
// here. Keep in sync with globals.css when the palette changes.
const tokens = {
  border: '#e4e4e7', // --border    (zinc-200)
  brand: '#2563eb', // --primary   (blue-600)
  brandFg: '#ffffff', // --primary-fg
  fg: '#18181b', // --fg        (zinc-900)
  mutedFg: '#71717a', // --muted-fg  (zinc-500)
  page: '#f4f4f5', // --muted     (zinc-100), the page backdrop
} as const;

// pixelBasedPreset renders Tailwind's spacing/font scales in px (email clients
// don't support rem — caniemail: css-unit-rem), but leaves maxWidth and
// borderRadius in rem. We extend the theme with px values so the utilities here
// stay email-safe — including plain-px fontSizes (the preset's bundle a
// line-height we'd rather set explicitly via leading-*).
const tailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      borderRadius: { lg: '8px' },
      colors: {
        border: tokens.border,
        brand: tokens.brand,
        'brand-fg': tokens.brandFg,
        fg: tokens.fg,
        'muted-fg': tokens.mutedFg,
        page: tokens.page,
      },
      fontSize: {
        body: '15px',
        caption: '13px',
        heading: '22px',
        wordmark: '18px',
      },
      maxWidth: { card: '480px' },
    },
  },
};

const FONT_STACK =
  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export function EmailLayout({
  children,
  footnote,
  heading,
  preview,
}: {
  children: ReactNode;
  footnote: string;
  heading: string;
  preview: string;
}) {
  return (
    <Html lang="en">
      <Tailwind config={tailwindConfig}>
        <Head />
        <Preview>{preview}</Preview>
        <Body className="bg-page py-6" style={{ fontFamily: FONT_STACK }}>
          <Container className="max-w-card mx-auto rounded-lg bg-white p-8">
            <Text className="text-wordmark m-0 mb-6 font-semibold text-fg">
              Gaffer
            </Text>
            <Heading className="text-heading m-0 mb-4 font-semibold text-fg">
              {heading}
            </Heading>
            {children}
            <Hr className="my-6 border-border" />
            <Text className="text-caption m-0 leading-5 text-muted-fg">
              {footnote}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export function EmailText({ children }: { children: ReactNode }) {
  return (
    <Text className="text-body m-0 mb-4 leading-6 text-fg">{children}</Text>
  );
}

export function EmailButton({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <Section className="mb-6">
      <Button
        className="bg-brand text-brand-fg text-body rounded-lg px-5 py-3 font-semibold"
        href={href}
      >
        {children}
      </Button>
    </Section>
  );
}

export function EmailFallbackLink({ url }: { url: string }) {
  return (
    <Text className="text-caption m-0 leading-5 text-muted-fg">
      Or copy and paste this link into your browser:{' '}
      <Link className="text-brand underline" href={url}>
        {url}
      </Link>
    </Text>
  );
}
