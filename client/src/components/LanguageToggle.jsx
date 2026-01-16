import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-lg bg-surface0 hover:bg-surface1 transition-colors border border-surface2 group relative"
      aria-label="Toggle Language"
    >
      <div className="w-6 h-6 flex items-center justify-center font-bold text-sm text-text">
        {language === 'en' ? 'EN' : 'ML'}
      </div>
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface2 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-text">
        {language === 'en' ? 'Switch to Malayalam' : 'Switch to English'}
      </span>
    </button>
  );
}