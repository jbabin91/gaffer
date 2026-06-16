import type { ReactNode } from 'react';

import { Toast } from '#/components/ui/toast';
import { ThemeProvider } from '#/integrations/next-themes/theme-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toast />
    </ThemeProvider>
  );
}
