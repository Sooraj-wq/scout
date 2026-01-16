import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();

  const cycleTheme = () => {
    const themeOrder = [themes.LIGHT, themes.DARK, themes.SYSTEM];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case themes.LIGHT:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case themes.DARK:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      case themes.SYSTEM:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case themes.LIGHT:
        return 'Light';
      case themes.DARK:
        return 'Dark';
      case themes.SYSTEM:
        return 'System';
      default:
        return '';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="glass-card px-4 py-1.5 rounded-full text-xs font-medium text-subtext1 flex items-center gap-2 hover:text-text transition-colors"
      aria-label={`Current theme: ${getLabel()}. Click to change.`}
      title={`Theme: ${getLabel()}`}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </button>
  );
}