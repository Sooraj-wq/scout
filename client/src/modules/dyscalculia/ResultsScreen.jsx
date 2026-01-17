// ResultsScreen component - AI analysis display
import { useGameStore } from './state/gameState';
import { useState, useEffect } from 'react';
import { getAIAnalysis } from './utils/eventLogger';
import { useLanguage } from '../../context/LanguageContext';

export const ResultsScreen = ({ onReset }) => {
  const { reset, sessionId, observationAttempts } = useGameStore();
  const { t } = useLanguage();
  const [showJson, setShowJson] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    if (!sessionId || observationAttempts.length === 0) {
      setAnalysisError('No assessment data available');
      return;
    }

    const fetchAIAnalysis = async () => {
      setIsLoadingAnalysis(true);
      setAnalysisError(null);
      setAnalysisData(null);
      
      try {
        const analysis = await getAIAnalysis(sessionId);
        setAnalysisData({ api_analysis: analysis });
        setAnalysisError(null);
      } catch (error) {
        console.error('Failed to get AI analysis data:', error);
        setAnalysisError(error.message);
        setAnalysisData(null);
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    fetchAIAnalysis();
  }, [sessionId, observationAttempts]);

  const handleReset = () => {
    reset();
    onReset && onReset();
  };

  const GET_SCORE_LABEL = (s) => {
    if (s >= 80) return t('dcDevWell');
    if (s >= 60) return t('dcGrowing');
    if (s >= 40) return t('dcNeedsSupport');
    return t('dcBenefits');
  };

  // Show loading state while waiting for AI analysis
  if (isLoadingAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] px-8 py-12">
        <div className="bg-mantle rounded-3xl p-12 max-w-2xl text-center shadow-material-lg border border-surface0">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 border-4 border-green border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-3xl font-bold text-green mb-4">{t('dcAnalyzing')}</h2>
            <p className="text-text text-lg">
              {t('dcProcessing')}
            </p>
          </div>
          <div className="flex flex-col gap-3 text-left bg-surface0 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-green">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              <span>{t('dcCalculating')}</span>
            </div>
            <div className="flex items-center gap-3 text-peach">
              <svg className="w-6 h-6 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
              </svg>
              <span>{t('dcGenerating')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if AI analysis failed
  if (analysisError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] px-8 py-12">
        <div className="bg-mantle rounded-3xl p-8 max-w-2xl shadow-material-lg border border-surface0">
          <h2 className="text-3xl font-bold text-red mb-4 text-center">{t('dcFailed')}</h2>
          <p className="text-lg text-subtext0 text-center mb-6">
            {t('dcUnable')}
          </p>

          <div className="bg-surface0 rounded-2xl p-6 mb-6">
            <p className="text-base text-red text-center mb-4">
              {analysisError}
            </p>
            <p className="text-sm text-subtext0 text-center">
              {t('dcCheckKey')}
            </p>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-green hover:bg-teal text-base font-bold py-4 px-8 rounded-full transition-all duration-200 shadow-material hover:shadow-material-lg transform hover:scale-105"
          >
            {t('dcTryAgain')}
          </button>
        </div>
      </div>
    );
  }

  // Don't show results until AI analysis is complete
  if (!analysisData) {
    return null;
  }

  const aiAnalysis = analysisData.api_analysis;

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-8 py-12">
      <div className="bg-mantle rounded-3xl p-8 max-w-4xl w-full shadow-material-lg border border-surface0">
        <h2 className="text-4xl font-bold text-green mb-8 text-center">{t('dcComplete')}</h2>
        
        {/* Score Display */}
        <div className="bg-surface0 rounded-2xl p-8 mb-6 border border-surface1">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div 
              className={`w-32 h-32 rounded-full flex items-center justify-center flex-col ${
                aiAnalysis.score >= 80 ? 'bg-green' : aiAnalysis.score >= 60 ? 'bg-yellow' : 'bg-red'
              }`}
            >
              <span className="text-4xl font-bold text-base">
                {aiAnalysis.score}
              </span>
              <span className="text-xs text-base">
                {t('dcOutOf')}
              </span>
            </div>
          </div>

          <div 
            className={`text-center p-4 rounded-2xl mb-6 border-2 ${
              aiAnalysis.score >= 80 
                ? 'bg-green/20 border-green' 
                : aiAnalysis.score >= 60 
                ? 'bg-yellow/20 border-yellow' 
                : 'bg-red/20 border-red'
            }`}
          >
            <span 
              className={`text-lg font-semibold ${
                aiAnalysis.score >= 80 ? 'text-green' : aiAnalysis.score >= 60 ? 'text-yellow' : 'text-red'
              }`}
            >
              {GET_SCORE_LABEL(aiAnalysis.score)}
            </span>
          </div>

          <div className="text-base leading-relaxed text-text whitespace-pre-wrap mb-4">
            {aiAnalysis.interpretation}
          </div>

          {/*
          <div className="text-sm text-subtext0 italic text-center">
            Pattern: {aiAnalysis.pattern} (Confidence: {Math.round(aiAnalysis.confidence * 100)}%)
          </div> */}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6 flex-wrap justify-center">
          <button
            onClick={handleReset}
            className="bg-green hover:bg-teal text-base font-bold py-3 px-8 rounded-full transition-all duration-200 shadow-material hover:shadow-material-lg transform hover:scale-105"
          >
            {t('dcPlayAgain')}
          </button>
        </div>

        {/* AI Analysis Details */}
        {showJson && (
          <div className="bg-surface0 rounded-2xl p-6 mb-6 border border-surface1">
            <h3 className="text-xl font-semibold text-text mb-4">
              {t('dcAIDetails')}
            </h3>
            <div className="flex flex-col gap-3">
              {Object.entries(analysisData).map(([key, data]) => (
                <details 
                  key={key}
                  className="bg-base rounded-xl p-3 cursor-pointer"
                >
                  <summary 
                    className={`font-medium text-sm cursor-pointer ${
                      key === 'error' ? 'text-red' : 'text-green'
                    }`}
                  >
                    {key === 'error' ? t('dcAPIError') : key.replace(/_/g, ' ').toUpperCase()}
                  </summary>
                  <pre 
                    className={`text-xs font-mono mt-3 overflow-auto ${
                      key === 'error' ? 'text-red' : 'text-yellow'
                    }`}
                  >
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-surface0 border border-yellow rounded-2xl p-4">
          <p className="text-yellow text-sm">
            <strong>⚠️ Important:</strong> This is a playful screening tool, not a medical assessment. 
            If you have concerns, please consult a qualified professional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
