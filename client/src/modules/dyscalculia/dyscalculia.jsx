import { useState, useCallback } from 'react';
import { useGameStore } from './state/gameState';
import { logPhaseChange, logSessionEnd, checkAdaptiveTests } from './utils/eventLogger';
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

const baseTaskSequence = [
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

// Additional tasks for adaptive extension (can repeat)
const additionalTasks = [
  { type: 'symbol', component: SymbolTask },
  { type: 'quantity', component: QuantityTask },
  { type: 'comparison', component: ComparisonTask },
  { type: 'order', component: OrderTask },
  { type: 'flash_counting', component: FlashCountingTask },
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
  const [taskSequence, setTaskSequence] = useState(baseTaskSequence);
  const [maxTests, setMaxTests] = useState(11); // Start with base 11, can extend to 20
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

  const handleTaskComplete = useCallback(async ({ success }) => {
    if (success) {
      if (difficulty < 8) {
        setDifficulty(prev => Math.min(prev + 0.5, 8));
      }
    } else {
      setDifficulty(prev => Math.max(prev - 0.5, 1));
    }

    const nextIndex = currentTaskIndex + 1;
    
    // Check if we're in observation phase and past warmup tasks
    if (phase === 'observation' && currentTaskIndex >= 2) {
      // Check if additional tests are needed via DBN analysis
      const adaptiveCheck = await checkAdaptiveTests(sessionId);
      
      if (adaptiveCheck.additional_tests_needed > 0 && taskSequence.length < 20) {
        // Extend task sequence adaptively
        const testsToAdd = Math.min(
          adaptiveCheck.additional_tests_needed,
          20 - taskSequence.length
        );
        
        const newTasks = [];
        for (let i = 0; i < testsToAdd; i++) {
          // Cycle through additional tasks
          newTasks.push(additionalTasks[i % additionalTasks.length]);
        }
        
        setTaskSequence(prev => [...prev, ...newTasks]);
        setMaxTests(taskSequence.length + testsToAdd);
        
        console.log(`DBN Analysis: Extended test sequence by ${testsToAdd} tasks (probability: ${adaptiveCheck.dbn_probability?.toFixed(2)}, confidence: ${adaptiveCheck.dbn_confidence?.toFixed(2)})`);
      }
    }
    
    if (nextIndex >= taskSequence.length) {
      analyzeAndComplete();
    } else {
      setCurrentTaskIndex(nextIndex);
    }
  }, [currentTaskIndex, difficulty, analyzeAndComplete, sessionId, phase, taskSequence.length]);

  const resetModule = useCallback(() => {
    reset();
    setCurrentTaskIndex(0);
    setDifficulty(1);
    setShowResults(false);
    setTaskSequence(baseTaskSequence);
    setMaxTests(11);
  }, [reset]);

  const currentTask = taskSequence[currentTaskIndex];
  const TaskComponent = currentTask?.component;
  const taskDifficulty = getTaskDifficulty(currentTaskIndex, difficulty);
  const progress = (currentTaskIndex + 1) / taskSequence.length;

  if (showResults || isComplete) {
    return (
      <div className="min-h-screen bg-base">
        <div className="bg-mantle border-b border-surface0">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <h2 className="text-xl font-bold text-text">Dyscalculia Assessment - Results</h2>
          </div>
        </div>
        <div className="max-w-6xl mx-auto">
          <ResultsScreen onReset={resetModule} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base">
      <div className="bg-mantle border-b border-surface0">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-text">Dyscalculia Assessment</h2>
            <span className="text-subtext1 text-sm">Task {currentTaskIndex + 1} of {taskSequence.length}</span>
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
