import {
  createContext, useContext, useEffect, useState, useCallback,
} from 'react';
import type { ReactNode } from 'react';
import {
  listPrograms, createProgram as apiCreateProgram, deleteProgram as apiDeleteProgram,
} from '../api/programs';
import type { ProgramSummary } from '../api/programs';

interface ProgramContextValue {
  programs: ProgramSummary[];
  currentCode: string;
  setCurrentCode: (code: string) => void;
  refreshPrograms: () => Promise<void>;
  createProgram: (body: Parameters<typeof apiCreateProgram>[0]) => Promise<ProgramSummary>;
  deleteProgram: (code: string) => Promise<void>;
  loading: boolean;
}

const STORAGE_KEY = 'cdr_program_code';
const DEFAULT_CODE = '7480201';

const Ctx = createContext<ProgramContextValue | undefined>(undefined);

export const ProgramProvider = ({ children }: { children: ReactNode }) => {
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCode, setCurrentCodeState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_CODE
  );

  const setCurrentCode = useCallback((code: string) => {
    setCurrentCodeState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const refreshPrograms = useCallback(async () => {
    const list = await listPrograms();
    setPrograms(list);
    // If current selection no longer exists in DB, fallback to first available
    if (list.length > 0 && !list.find((p) => p.code === currentCode)) {
      setCurrentCode(list[0].code);
    }
  }, [currentCode, setCurrentCode]);

  useEffect(() => {
    refreshPrograms()
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, []); // intentionally empty — only on mount

  const createProgram = async (body: Parameters<typeof apiCreateProgram>[0]) => {
    const p = await apiCreateProgram(body);
    await refreshPrograms();
    setCurrentCode(p.code);
    return p;
  };

  const deleteProgram = async (code: string) => {
    await apiDeleteProgram(code);
    await refreshPrograms();
  };

  return (
    <Ctx.Provider value={{
      programs, currentCode, setCurrentCode, refreshPrograms,
      createProgram, deleteProgram, loading,
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useProgram = (): ProgramContextValue => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgram must be used inside <ProgramProvider>');
  return ctx;
};
