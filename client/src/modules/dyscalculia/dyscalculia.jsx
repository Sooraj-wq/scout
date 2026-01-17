import { useState, useCallback } from 'react';
import { useGameStore } from './state/gameState';
import { logPhaseChange, logSessionEnd } from './utils/eventLogger';
import { analyzePatterns, calculateOverallScore } from './utils/patternDetector';
import { generateExplanation } from './utils/explanationGenerator';
import { useLanguage } from '../../context/LanguageContext';
import {
  WarmupFreePlay,
  WarmupComparison,
  QuantityTask,
  ComparisonTask,
  SymbolTask,
  OrderTask,
  FlashCountingTask
} from './tasks';
import ResultsScreen from './ResultsScreen';

const taskSequence = [
  { type: 'warmup', component: WarmupFreePlay },
  { type: 'warmup', component: WarmupComparison },
  { type: 'quantity', component: QuantityTask },
  { type: 'comparison', component: ComparisonTask },
  { type: 'flash_counting', component: FlashCountingTask },
  { type: 'quantity', component: QuantityTask },
  { type: 'comparison', component: ComparisonTask },
  { type: 'symbol', component: SymbolTask },
  { type: 'order', component: OrderTask },
  { type: 'quantity', component: QuantityTask },
  { type: 'comparison', component: ComparisonTask },
];

const getTaskDifficulty = (taskIndex, difficulty) => {
  if (taskIndex < 2) return 1;
  if (taskIndex < 4) return Math.min(difficulty, 2);
  if (taskIndex < 6) return Math.min(difficulty, 4);
  if (taskIndex < 8) return Math.min(difficulty, 6);
  return Math.min(difficulty, 8);
};

export const DyscalculiaModule = () => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const { t } = useLanguage();
  
  const {
    phase,
    sessionId,
    completeWarmup,
    observationAttempts,
    exposures,
    stressIndicators,
    isComplete,
    completeSession,
    reset
  } = useGameStore();

  const handleWarmupComplete = useCallback((warmupData) => {
    completeWarmup(warmupData);
    logPhaseChange({ from: 'warmup', to: 'observation' });
    setCurrentTaskIndex(2);
    setDifficulty(1);
  }, [completeWarmup]);

  const analyzeAndComplete = useCallback(async () => {
    const analysis = analyzePatterns(observationAttempts);
    const score = calculateOverallScore(observationAttempts);
    const explanation = generateExplanation(analysis);

    setShowResults(true);
    completeSession(score, explanation);

    logSessionEnd({
      score,
      analysis: analysis.pattern,
      attempts: observationAttempts.length,
      stressIndicators: stressIndicators.length
    });
  }, [observationAttempts, stressIndicators, completeSession]);

  const handleTaskComplete = useCallback(({ success }) => {
    if (success) {
      if (difficulty < 8) {
        setDifficulty(prev => Math.min(prev + 0.5, 8));
      }
    } else {
      setDifficulty(prev => Math.max(prev - 0.5, 1));
    }

    const nextIndex = currentTaskIndex + 1;
    
    if (nextIndex >= taskSequence.length) {
      analyzeAndComplete();
    } else {
      setCurrentTaskIndex(nextIndex);
    }
  }, [currentTaskIndex, difficulty, analyzeAndComplete]);

  const resetModule = useCallback(() => {
    reset();
    setCurrentTaskIndex(0);
    setDifficulty(1);
    setShowResults(false);
  }, [reset]);

  const currentTask = taskSequence[currentTaskIndex];
  const TaskComponent = currentTask?.component;
  const taskDifficulty = getTaskDifficulty(currentTaskIndex, difficulty);
  const progress = Math.max((currentTaskIndex + 1) / taskSequence.length, 1 / taskSequence.length);

  if (showResults || isComplete) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="glass border-b border-black/5">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <h2 className="text-xl font-bold text-text">{t('dyscalculiaResults')}</h2>
          </div>
        </div>
        <div className="max-w-6xl mx-auto">
          <ResultsScreen onReset={resetModule} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="glass border-b border-black/5">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-text">{t('dyscalculiaHeading')}</h2>
            <span className="text-subtext1 text-sm">{t('taskProgress').replace('{current}', currentTaskIndex + 1).replace('{total}', taskSequence.length)}</span>
          </div>
          <div className="w-full bg-surface0 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green to-teal h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 1) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {phase === 'warmup' && currentTaskIndex < 2 && TaskComponent && (
          <TaskComponent 
            key={`warmup-${currentTaskIndex}`}
            onComplete={currentTaskIndex === 0 
              ? handleWarmupComplete 
              : () => {
                  handleWarmupComplete({
                    comparisonAbility: 'assessed',
                    hesitationTime: 0
                  });
                }
            }
          />
        )}
        
        {phase === 'observation' && currentTaskIndex >= 2 && TaskComponent && (
          <TaskComponent
            key={`obs-${currentTaskIndex}`}
            difficulty={Math.ceil(taskDifficulty)}
            onComplete={handleTaskComplete}
          />
        )}
      </div>
    </div>
  );
};

export default DyscalculiaModule;
