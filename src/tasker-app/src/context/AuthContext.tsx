import React from 'react';
import { getStoredUserName, setStoredUserName, clearStoredUser } from '../services/storage/user';
import { clearStoredTokens, getStoredTokens, setStoredTokens } from '../services/storage/token';
import { loginRequest, logoutRequest } from '../services/api/client';

type AuthContextValue = {
  userName: string | null;
  isAuth: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserName] = React.useState<string | null>(() => getStoredUserName());
  const [hasTokens, setHasTokens] = React.useState<boolean>(() => Boolean(getStoredTokens()));

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

  const logout = React.useCallback(() => {
    clearStoredTokens();
    setHasTokens(false);
    clearStoredUser();
    setUserName(null);
    void logoutRequest();
  }, []);

  const value = React.useMemo<AuthContextValue>(() => ({
    userName,
    isAuth: hasTokens,
    login,
    logout,
  }), [userName, hasTokens, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


