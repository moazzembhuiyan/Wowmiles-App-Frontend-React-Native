import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { queryClient, setSessionExpiredHandler } from '@/lib/api/client';
import { fetchAuthRoute, loginWithEmail, logoutRemote, restoreUser, type AuthRoute, type AuthUser } from '@/lib/api/auth';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  /** Signs in and returns the screen the user belongs on. */
  login: (input: { email: string; password: string; rememberMe: boolean }) => Promise<AuthRoute>;
  /** Marks the user signed in after a flow that stored tokens itself (signup OTP). */
  setSignedIn: (user: AuthUser) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  const clearSession = useCallback(() => {
    queryClient.clear();
    setUser(null);
    setStatus('signedOut');
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(clearSession);
    let active = true;
    restoreUser()
      .then((restored) => {
        if (!active) return;
        setUser(restored);
        setStatus(restored ? 'signedIn' : 'signedOut');
      })
      .catch(() => {
        // A refused session is cleared by the client; an offline start is signed out and must log in again.
        if (active) setStatus('signedOut');
      });
    return () => {
      active = false;
      setSessionExpiredHandler(null);
    };
  }, [clearSession]);

  const login = useCallback<AuthContextValue['login']>(async (input) => {
    const signedIn = await loginWithEmail(input);
    let route: AuthRoute;
    try {
      route = await fetchAuthRoute();
    } catch (error) {
      await logoutRemote();
      throw error;
    }
    setUser(signedIn);
    setStatus('signedIn');
    return route;
  }, []);

  const setSignedIn = useCallback((signedIn: AuthUser) => {
    setUser(signedIn);
    setStatus('signedIn');
  }, []);

  const logout = useCallback(async () => {
    await logoutRemote();
    clearSession();
  }, [clearSession]);

  const value = useMemo(() => ({ status, user, login, setSignedIn, logout }), [status, user, login, setSignedIn, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
