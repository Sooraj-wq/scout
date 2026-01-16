import { useState, useCallback } from 'react';
import { useGameStore } from './state/gameState';
import { logPhaseChange, logSessionEnd } from './utils/eventLogger';
import { analyzePatterns, calculateOverallScore } from './utils/patternDetector';
import { generateExplanation } from './utils/explanationGenerator';
import {
  WarmupFreePlay,
  WarmupComparison,
  QuantityTask,
  ComparisonTask,
  SymbolTask,
  OrderTask
} from './tasks';
import ResultsScreen from './ResultsScreen';

const taskSequence = [
  { type: 'warmup', component: WarmupFreePlay },
  { type: 'warmup', component: WarmupComparison },
  { type: 'quantity', component: QuantityTask },
  { type: 'comparison', component: ComparisonTask },
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

const CalmLayout = ({ children }) => (
  <div style={{
    width: '100%',
    height: '100%',
    minHeight: '600px',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, var(--catppuccin-mantle) 0%, var(--catppuccin-base) 100%)',
    borderRadius: '28px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
  }}>
    {children}
  </div>
);

const ProgressBar = ({ progress }) => (
  <div style={{
    width: '100%',
    height: '6px',
    background: 'var(--catppuccin-surface1)',
    borderRadius: '3px',
    overflow: 'hidden'
  }}>
    <div style={{
      width: `${progress * 100}%`,
      height: '100%',
      background: 'var(--catppuccin-blue)',
      borderRadius: '3px',
      transition: 'width 0.5s ease'
    }} />
  </div>
);

export const DyscalculiaModule = () => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [showResults, setShowResults] = useState(false);
  
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
    try {
      // Send data to backend for analysis and explanation generation
      const analysisResponse = await fetch(`/api/dyscalculia/sessions/${sessionId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!analysisResponse.ok) throw new Error('Analysis failed');

      const analysisData = await analysisResponse.json();

      const explanationResponse = await fetch(`/api/dyscalculia/sessions/${sessionId}/explanation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!explanationResponse.ok) throw new Error('Explanation generation failed');

      const explanationData = await explanationResponse.json();

      const score = calculateOverallScore(observationAttempts); // Keep local score calculation for UI

      setShowResults(true);
      completeSession(score, explanationData.explanation);

      logSessionEnd({
        score,
        analysis: analysisData.pattern,
        attempts: observationAttempts.length,
        stressIndicators: stressIndicators.length
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback to local analysis if backend fails
      const analysis = analyzePatterns(observationAttempts);
      const score = calculateOverallScore(observationAttempts);
      const explanation = generateExplanation(analysis);

      setShowResults(true);
      completeSession(score, explanation);
    }
  }, [observationAttempts, exposures, stressIndicators, sessionId, completeSession]);

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
  const progress = (currentTaskIndex + 1) / taskSequence.length;

  if (showResults || isComplete) {
    return (
      <CalmLayout>
        <ResultsScreen onReset={resetModule} />
      </CalmLayout>
    );
  }

  return (
    <CalmLayout>
      <ProgressBar progress={Math.min(progress, 1)} />
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        overflow: 'auto'
      }}>
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
    </CalmLayout>
  );
};

export default DyscalculiaModule;
