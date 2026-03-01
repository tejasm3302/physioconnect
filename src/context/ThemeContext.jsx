import { createContext, useContext, useState, useLayoutEffect } from 'react';
import { STORAGE_KEYS } from '../config/constants';

const ThemeContext = createContext(null);

function parseTheme(value) {
  if (value === 'dark' || value === 'light') return value;
  try {
    const parsed = JSON.parse(value);
    return parsed === 'dark' || parsed === 'light' ? parsed : null;
  } catch {
    return null;
  }
}

// Initialize theme immediately before React renders
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';

  const candidates = [
    localStorage.getItem(STORAGE_KEYS.THEME),
    localStorage.getItem('physio_theme')
  ];

  for (const raw of candidates) {
    const parsed = parseTheme(raw);
    if (parsed) {
      return parsed;
    }
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

// Apply theme to document immediately
const applyTheme = (theme) => {
  if (typeof window === 'undefined') return;
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);

  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme);
};

if (typeof window !== 'undefined') {
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useLayoutEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
      // Backward compatibility key used in earlier builds.
      localStorage.setItem('physio_theme', JSON.stringify(theme));
    } catch {}
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;