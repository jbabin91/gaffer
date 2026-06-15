import { useCallback, useEffect, useState } from 'react';

import { useCareers } from './use-careers';

const STORAGE_KEY = 'fc:activeCareerId';

// localStorage throws in Safari private mode / when storage is blocked; degrade
// to in-memory state rather than crashing.
function readStored(): string | undefined {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function writeStored(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Persistence unavailable; selection still lives in component state.
  }
}

/**
 * Active career is the localStorage-stored selection, falling back to the most
 * recent career when none is stored or the stored id is gone. Storage failures
 * (Safari private mode) degrade to in-memory selection.
 */
export function useActiveCareer() {
  const careers = useCareers();
  const [activeId, setActiveId] = useState<string | undefined>();

  useEffect(() => {
    setActiveId(readStored());
  }, []);

  const list = careers.data;
  const activeCareer = list?.find((c) => c.id === activeId) ?? list?.[0];

  const select = useCallback((id: string) => {
    writeStored(id);
    setActiveId(id);
  }, []);

  return {
    activeCareer,
    activeCareerId: activeCareer?.id,
    careers: list ?? [],
    isLoading: careers.isLoading,
    selectCareer: select,
  };
}
