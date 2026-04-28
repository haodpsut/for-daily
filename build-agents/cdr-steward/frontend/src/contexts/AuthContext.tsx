import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, me as apiMe } from '../api/auth';
import type { AuthUser } from '../api/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: { email: string; password: string; full_name?: string; institution_name?: string }) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = 'cdr_auth_token';
const USER_KEY = 'cdr_auth_user';

const Ctx = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const cached = localStorage.getItem(USER_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  // On mount, validate token by fetching /me
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    apiMe()
      .then((u) => {
        setUser(u);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const r = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, r.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(r.user));
    setUser(r.user);
  };

  const register = async (body: Parameters<typeof apiRegister>[0]) => {
    const r = await apiRegister(body);
    localStorage.setItem(TOKEN_KEY, r.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(r.user));
    setUser(r.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('cdr_program_code');
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
