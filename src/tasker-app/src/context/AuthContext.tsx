import React from 'react';
import { getStoredUserName, setStoredUserName, clearStoredUser } from '../services/storage/user';
import {
  clearStoredTokens,
  getStoredTokens,
  setStoredTokens,
  isAccessTokenExpiredOrMissing,
  isTokenExpiringWithin,
  getRefreshBufferMinutes,
} from '../services/storage/token';
import { loginRequest, logoutRequest, registerRequest } from '../services/api/auth';
import { ensureAccessTokenFresh, refreshAccessToken } from '../services/api/client';
import { AUTH_TOKENS_CLEARED_EVENT, isAuthTokensClearedEvent } from '../services/api/auth-events';

type AuthContextValue = {
  userName: string | null;
  isAuth: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: { username: string; email: string; firstName: string; lastName: string; password: string; confirmPassword: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserName] = React.useState<string | null>(() => getStoredUserName());
  const [hasTokens, setHasTokens] = React.useState<boolean>(() => {
    const tokens = getStoredTokens();
    return Boolean(tokens) && !isAccessTokenExpiredOrMissing();
  });
  const hasTokensRef = React.useRef(hasTokens);
  hasTokensRef.current = hasTokens;

  const login = React.useCallback(async (username: string, password: string) => {
    const response = await loginRequest(username, password);
    if (!response.success || !response.data) {
      const msg = response.message || (response.errors && response.errors[0]) || 'Ошибка авторизации';
      throw new Error(msg);
    }
    const { accessToken, expiresIn, userInfo } = response.data;
    setStoredTokens({ accessToken, expiresInSeconds: expiresIn });
    setHasTokens(true);
    const name = userInfo?.username?.trim() || username.trim();
    setStoredUserName(name);
    setUserName(name);
  }, []);

  const register = React.useCallback(async (payload: { username: string; email: string; firstName: string; lastName: string; password: string; confirmPassword: string }) => {
    const response = await registerRequest(payload);
    if (!response.success) {
      const msg = response.message || (response.errors && response.errors[0]) || 'Ошибка регистрации';
      throw new Error(msg);
    }
    // авто-вход после регистрации
    await login(payload.username, payload.password);
  }, [login]);

  const logout = React.useCallback(() => {
    clearStoredTokens();
    setHasTokens(false);
    clearStoredUser();
    setUserName(null);
    void logoutRequest();
  }, []);

  /** Принудительная синхронизация при очистке токенов (например из apiFetch) */
  const handleTokensCleared = React.useCallback(() => {
    setHasTokens(false);
    clearStoredUser();
    setUserName(null);
  }, []);

  /** Проверка токена: refresh при истечении, proactive refresh, синхронизация состояния */
  const checkTokenExpiration = React.useCallback(async () => {
    const tokens = getStoredTokens();
    const bufferMinutes = getRefreshBufferMinutes();

    if (tokens && isAccessTokenExpiredOrMissing()) {
      const ok = await ensureAccessTokenFresh();
      if (ok) {
        setHasTokens(true);
      } else {
        handleTokensCleared();
      }
    } else if (tokens && isTokenExpiringWithin(bufferMinutes) && !isAccessTokenExpiredOrMissing()) {
      const ok = await refreshAccessToken();
      if (ok) setHasTokens(true);
    } else if (!tokens && hasTokensRef.current) {
      handleTokensCleared();
    } else if (tokens && !hasTokensRef.current && !isAccessTokenExpiredOrMissing()) {
      setHasTokens(true);
    }
  }, [handleTokensCleared]);

  React.useEffect(() => {
    const runCheck = () => checkTokenExpiration();

    runCheck();

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        runCheck();
        intervalId = setInterval(runCheck, 60000);
      } else {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    if (document.visibilityState === 'visible') {
      intervalId = setInterval(runCheck, 60000);
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (intervalId) clearInterval(intervalId);
    };
  }, [checkTokenExpiration]);

  React.useEffect(() => {
    const onTokensCleared = (e: Event) => {
      if (isAuthTokensClearedEvent(e)) handleTokensCleared();
    };
    window.addEventListener(AUTH_TOKENS_CLEARED_EVENT, onTokensCleared);
    return () => window.removeEventListener(AUTH_TOKENS_CLEARED_EVENT, onTokensCleared);
  }, [handleTokensCleared]);

  const value = React.useMemo<AuthContextValue>(() => ({
    userName,
    isAuth: hasTokens,
    login,
    register,
    logout,
  }), [userName, hasTokens, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


