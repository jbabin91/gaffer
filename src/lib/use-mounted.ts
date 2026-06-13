import { useEffect, useState } from 'react';

/** True once the component has mounted in the browser. Gates client-only
 * (local-first DB, localStorage) UI so SSR and first hydration agree. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
