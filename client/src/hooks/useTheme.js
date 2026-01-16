import { useEffect, useState } from 'react';

const THEME_KEY = 'scout-theme';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || THEMES.SYSTEM;
  } catch {
    return THEMES.SYSTEM;
  }
}

function getResolvedTheme(theme) {
  if (theme === THEMES.SYSTEM) {
    return getSystemTheme();
  }
  return theme;
}

export function useTheme() {
  const [theme, setThemeState] = useState(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => getResolvedTheme(getStoredTheme()));

  useEffect(() => {
    const root = document.documentElement;
    const resolved = getResolvedTheme(theme);
    
    // Apply theme class
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    
    // Store preference
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  // Separate effect to update resolved theme
  useEffect(() => {
    const updateResolvedTheme = () => {
      const resolved = getResolvedTheme(theme);
      setResolvedTheme(resolved);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolved);
    };
    
    // Initial update
    updateResolvedTheme();
    
    // Listen for system theme changes when in system mode
    if (theme !== THEMES.SYSTEM) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateResolvedTheme);
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
    themes: THEMES
  };
}