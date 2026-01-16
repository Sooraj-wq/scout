import { useLanguage } from '../../context/LanguageContext';

export default function Dyspraxia() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-base">
      <div className="bg-mantle border-b border-surface0">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <h2 className="text-xl font-bold text-text">{t('dyspraxiaTitle')}</h2>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-text mb-4">{t('dyspraxiaDesc')}</h3>
          <p className="text-subtext0">Dyspraxia assessment module coming soon...</p>
        </div>
      </div>
    </div>
  );
}