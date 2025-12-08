import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type SpaceContextValue = {
  activeSpaceId: number | null;
  setActiveSpaceId: (id: number | null) => void;
};

const SpaceContext = createContext<SpaceContextValue | undefined>(undefined);

type SpaceProviderProps = {
  children: React.ReactNode;
};

const STORAGE_KEY = 'graphics_active_space_id';

export function SpaceProvider({ children }: SpaceProviderProps): JSX.Element {
  const [activeSpaceId, setActiveSpaceIdState] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed > 0) {
        setActiveSpaceIdState(parsed);
      }
    } catch {
      // Ignore storage errors and fall back to null.
    }
  }, []);

  const setActiveSpaceId = (id: number | null): void => {
    setActiveSpaceIdState(id);
    if (typeof window === 'undefined') return;
    try {
      if (id && Number.isFinite(id) && id > 0) {
        window.localStorage.setItem(STORAGE_KEY, String(id));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors; state remains in memory.
    }
  };

  const value = useMemo(
    () => ({
      activeSpaceId,
      setActiveSpaceId,
    }),
    [activeSpaceId],
  );

  return (
    <SpaceContext.Provider value={value}>{children}</SpaceContext.Provider>
  );
}

export function useSpaceContext(): SpaceContextValue {
  const ctx = useContext(SpaceContext);
  if (!ctx) {
    throw new Error('useSpaceContext must be used within a SpaceProvider');
  }
  return ctx;
}

