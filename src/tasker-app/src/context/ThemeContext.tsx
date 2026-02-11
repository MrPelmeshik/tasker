import React from 'react';

/** Возможные значения темы */
type Theme = 'dark' | 'light';

/** Значение контекста темы */
type ThemeContextValue = {
  /** Текущая тема */
  theme: Theme;
  /** Переключить тему на противоположную */
  toggleTheme: () => void;
};

const STORAGE_KEY = 'tasker-theme';

/** Получить сохранённую тему из localStorage */
function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage может быть недоступен
  }
  return 'dark';
}

/** Сохранить тему в localStorage */
function setStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage может быть недоступен
  }
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

/**
 * Провайдер темы.
 * Устанавливает атрибут data-theme на html-элементе и
 * сохраняет выбор в localStorage.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState<Theme>(getStoredTheme);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setStoredTheme(theme);
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/** Хук для доступа к теме */
export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
