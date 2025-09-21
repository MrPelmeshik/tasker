import React from 'react';
import { getStoredUserName, setStoredUserName, clearStoredUser } from '../services/storage/user';

type AuthContextValue = {
  userName: string | null;
  isAuth: boolean;
  login: (name: string) => void;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserName] = React.useState<string | null>(() => getStoredUserName());

  const login = React.useCallback((name: string) => {
    setStoredUserName(name);
    setUserName(name);
  }, []);

  const logout = React.useCallback(() => {
    clearStoredUser();
    setUserName(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(() => ({
    userName,
    isAuth: Boolean(userName),
    login,
    logout,
  }), [userName, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


