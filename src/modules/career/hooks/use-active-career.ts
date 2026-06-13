import { useCallback, useEffect, useState } from 'react';

import { useCareers } from './use-careers';

const STORAGE_KEY = 'fc:activeCareerId';

// localStorage throws in Safari private mode / when storage is blocked; degrade
// to in-memory state rather than crashing the effect or click handler.
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
 * Tracks which career is active, persisted to localStorage. Falls back to the
 * most recent career when the stored one is missing (e.g. deleted).
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
