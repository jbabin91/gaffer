import type { ComponentProps } from 'react';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export { useTheme } from 'next-themes';

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      disableTransitionOnChange
      enableSystem
      attribute="class"
      defaultTheme="system"
      storageKey="gaffer-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
