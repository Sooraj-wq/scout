import { create } from 'zustand';
import { logTaskAttempt } from '../utils/eventLogger';

const createSessionId = () => {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const getDefaultState = () => ({
  sessionId: createSessionId(),
  phase: 'warmup',
  currentTaskIndex: 0,
  tasksCompleted: 0,
  totalTasks: 0,
  difficulty: 1,
  ageGroup: 'unknown',
  comfortLevel: null,
  preferredRepresentation: null,
  stressIndicators: [],
  interactionAbility: null,
  events: [],
  taskHistory: [],
  isComplete: false,
  showResults: false,
  score: null,
  explanation: null,
  exposures: [],
  observationAttempts: [],
});

export const useGameStore = create((set, get) => ({
  ...getDefaultState(),

  setAgeGroup: (ageGroup) => set({ ageGroup }),

  setComfortLevel: (comfortLevel) => set({ comfortLevel }),

  setPreferredRepresentation: (preferredRepresentation) => 
    set({ preferredRepresentation }),

  addStressIndicator: (indicator) => 
    set((state) => ({ 
      stressIndicators: [...state.stressIndicators, { 
        indicator, 
        timestamp: Date.now() 
      }] 
    })),

  setInteractionAbility: (interactionAbility) => 
    set({ interactionAbility }),

  advancePhase: () => {
    const state = get();
    if (state.phase === 'warmup') {
      set({ 
        phase: 'observation',
        currentTaskIndex: 0,
        difficulty: 1
      });
    }
  },

  completeWarmup: (warmupData) => {
    set({
      phase: 'observation',
      currentTaskIndex: 0,
      difficulty: 1,
      comfortLevel: warmupData.comfortLevel,
      preferredRepresentation: warmupData.preferredRepresentation,
      interactionAbility: warmupData.interactionAbility,
      stressIndicators: warmupData.stressIndicators || []
    });
  },

  incrementTask: () => {
    const state = get();
    set({ 
      currentTaskIndex: state.currentTaskIndex + 1,
      tasksCompleted: state.tasksCompleted + 1
    });
  },

  setDifficulty: (difficulty) => set({ difficulty }),

  increaseDifficulty: () => {
    const state = get();
    set({ difficulty: Math.min(state.difficulty + 1, 10) });
  },

  decreaseDifficulty: () => {
    const state = get();
    set({ difficulty: Math.max(state.difficulty - 1, 1) });
  },

  addEvent: (event) => {
    const state = get();
    set({
      events: [...state.events, {
        ...event,
        timestamp: Date.now(),
        sessionId: state.sessionId
      }]
    });
  },

  addTaskAttempt: (attempt) => {
    const state = get();
    const currentSessionId = state.sessionId;
    console.log('addTaskAttempt called, sessionId:', currentSessionId);
    console.log('Full state:', { phase: state.phase, difficulty: state.difficulty });
    
    const taskAttempt = {
      task_type: attempt.taskType,
      correct: attempt.correct,
      selected_answer: attempt.selectedAnswer,
      correct_answer: attempt.correctAnswer,
      latency: attempt.latency,
      attempts: attempt.attempts,
      timestamp: Date.now(),
      difficulty: state.difficulty
      // sessionId is now handled by URL path, not body
    };

    // Send to backend with sessionId in URL
    const attemptWithSession = { ...taskAttempt, sessionId: currentSessionId };
    console.log('Calling logTaskAttempt with:', attemptWithSession);
    logTaskAttempt(attemptWithSession);

    set({
      taskHistory: [...state.taskHistory, taskAttempt],
      observationAttempts: state.phase === 'observation'
        ? [...state.observationAttempts, taskAttempt]
        : state.observationAttempts
    });
  },

  recordExposure: (exposure) => {
    const state = get();
    set({
      exposures: [...state.exposures, {
        ...exposure,
        timestamp: Date.now()
      }]
    });
  },

  completeSession: (score, explanation) => {
    set({
      isComplete: true,
      showResults: true,
      score,
      explanation
    });
  },

  reset: () => set(getDefaultState()),

  getProgress: () => {
    const state = get();
    if (state.phase === 'warmup') {
      return Math.min(state.tasksCompleted / 5, 1);
    }
    return Math.min(0.5 + (state.tasksCompleted / 20), 1);
  },

  getFlashCountingPerformance: () => {
    const state = get();
    const flashAttempts = state.taskHistory.filter(
      attempt => attempt.task_type === 'flash_counting'
    );
    
    if (flashAttempts.length === 0) return null;
    
    const correctCount = flashAttempts.filter(attempt => attempt.correct).length;
    const percentage = (correctCount / flashAttempts.length) * 100;
    
    return percentage;
  }
}));
