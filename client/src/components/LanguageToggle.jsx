import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-surface0 hover:bg-surface1 transition-all duration-300 border border-surface2 shadow-xl group hover:scale-110"
      aria-label="Toggle Language"
    >
      <div className="w-4 h-4 flex items-center justify-center font-bold text-lg text-text">
        {language === 'en' ? 'EN' : 'ML'}
      </div>
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-surface2 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-text shadow-lg transform translate-y-2 group-hover:translate-y-0">
        {language === 'en' ? 'Switch to Malayalam' : 'Switch to English'}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-surface2"></div>
      </span>
    </button>
  );
}
