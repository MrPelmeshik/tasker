import React from 'react';
import { getStoredUserName, setStoredUserName, clearStoredUser } from '../services/storage/user';
import { clearStoredTokens, getStoredTokens, setStoredTokens, isAccessTokenExpiredOrMissing } from '../services/storage/token';
import { loginRequest, logoutRequest, registerRequest } from '../services/api/client';

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

  // Периодическая проверка истечения токенов
  React.useEffect(() => {
    const checkTokenExpiration = () => {
      const tokens = getStoredTokens();
      if (tokens && isAccessTokenExpiredOrMissing()) {
        // Токен истек, выходим из системы
        clearStoredTokens();
        setHasTokens(false);
        clearStoredUser();
        setUserName(null);
      } else if (!tokens && hasTokens) {
        // Токены были удалены, обновляем состояние
        setHasTokens(false);
        clearStoredUser();
        setUserName(null);
      } else if (tokens && !hasTokens) {
        // Токены появились и не истекли, обновляем состояние
        setHasTokens(true);
      }
    };

    // Проверяем сразу при монтировании
    checkTokenExpiration();

    // Проверяем каждые 30 секунд
    const interval = setInterval(checkTokenExpiration, 30000);

    return () => clearInterval(interval);
  }, [hasTokens]);

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


