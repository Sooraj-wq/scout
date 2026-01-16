import { useState, useEffect, useCallback, useRef } from 'react';

const WorkingMemoryTest = ({ onComplete }) => {
  const [currentLetter, setCurrentLetter] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isStarted, setIsStarted] = useState(false);
  
  const testDataRef = useRef({
    sequence: [],
    correctResponses: 0,
    incorrectResponses: 0,
    totalTargets: 0,
    missedTargets: 0,
    currentStimulus: null,
  });
  const hideTimeoutRef = useRef(null);
  const completedRef = useRef(false);
  const timeLeftRef = useRef(45);

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const generateRandomLetter = useCallback(() => {
    return letters[Math.floor(Math.random() * letters.length)];
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.code === 'Space' && isVisible && isStarted) {
      e.preventDefault();

      const stimulus = testDataRef.current.currentStimulus;
      if (!stimulus || stimulus.responded) return;

      if (stimulus.isTarget) {
        testDataRef.current.correctResponses++;
      } else {
        testDataRef.current.incorrectResponses++;
      }

      testDataRef.current.currentStimulus.responded = true;
    }
  }, [isVisible, isStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!isStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, onComplete]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (!isStarted || timeLeft > 0) return;
    if (completedRef.current) return;

    completedRef.current = true;

    const accuracy = testDataRef.current.totalTargets > 0 
      ? (testDataRef.current.correctResponses / testDataRef.current.totalTargets) * 100 
      : 0;

    onComplete({
      sequence: testDataRef.current.sequence,
      correctResponses: testDataRef.current.correctResponses,
      incorrectResponses: testDataRef.current.incorrectResponses,
      totalTargets: testDataRef.current.totalTargets,
      accuracy: accuracy,
    });
  }, [isStarted, timeLeft, onComplete]);

  useEffect(() => {
    if (!isStarted || timeLeft <= 0) return;

    const stimulusInterval = setInterval(() => {
      if (timeLeftRef.current <= 0) {
        return;
      }

      const sequence = testDataRef.current.sequence;
      let letter = generateRandomLetter();

      if (sequence.length >= 2 && Math.random() < 0.3) {
        letter = sequence[sequence.length - 2];
      }

      const isTarget = sequence.length >= 2 && letter === sequence[sequence.length - 2];
      if (isTarget) {
        testDataRef.current.totalTargets++;
      }

      testDataRef.current.sequence.push(letter);
      testDataRef.current.currentStimulus = { isTarget, responded: false };

      setCurrentLetter(letter);
      setIsVisible(true);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        const stimulus = testDataRef.current.currentStimulus;
        if (stimulus && stimulus.isTarget && !stimulus.responded) {
          testDataRef.current.missedTargets++;
        }
      }, 1000);
    }, 1500);

    return () => {
      clearInterval(stimulusInterval);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isStarted, generateRandomLetter]);

  const startTest = () => {
    completedRef.current = false;
    timeLeftRef.current = 45;
    setTimeLeft(45);
    setIsStarted(true);
  };

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] px-8">
        <div className="glass-panel rounded-3xl p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lavender to-blue mb-6">Phase 2: The Working Memory Test</h2>
          <div className="text-text space-y-6 mb-8">
            <p className="text-lg">
              This test measures your <span className="text-peach font-bold drop-shadow-sm">working memory capacity</span> and 
              <span className="text-peach font-bold drop-shadow-sm"> cognitive flexibility</span>.
            </p>
            <div className="glass rounded-2xl p-6 space-y-4 shadow-inner border border-white/5">
              <h3 className="text-xl font-bold text-lavender flex items-center gap-2">
                <span>📋</span> Instructions:
              </h3>
              <ul className="space-y-3 text-subtext1">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-lavender shrink-0"></span>
                  <span>Letters will appear on screen every 1.5 seconds</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-lavender shrink-0"></span>
                  <span>Press <kbd className="px-2 py-0.5 glass-card rounded border border-white/20 font-mono text-text">SPACE</kbd> if the current letter matches the letter shown <span className="text-blue text-lg font-bold">2 steps ago</span></span>
                </li>
                <li className="flex items-start gap-3 glass p-2 rounded-lg bg-blue/5 border border-blue/10">
                  <span className="text-xl">💡</span>
                  <span>Example: If you see <span className="font-mono text-lavender font-bold">A → B → A</span>, press SPACE on the second A</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-lavender shrink-0"></span>
                  <span>Stay focused and maintain the sequence in your mind</span>
                </li>
              </ul>
            </div>
            <p className="text-subtext0 text-sm font-medium flex items-center gap-2">
              <span>⏱️</span> Duration: 45 seconds
            </p>
          </div>
          <button
            onClick={startTest}
            className="w-full glass-button text-text text-base font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Memory Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-8">
      <div className="mb-8">
        <div className="glass px-6 py-3 rounded-full border border-lavender/30 shadow-[0_0_15px_rgba(180,190,254,0.2)]">
          <span className="text-lavender font-mono text-2xl font-bold tracking-wider">{timeLeft}s</span>
        </div>
      </div>
      
      <div className="glass-panel rounded-3xl w-full max-w-md aspect-square flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-lavender/5 to-blue/5 opacity-50"></div>
        {isVisible && currentLetter && (
          <span className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-lavender to-blue drop-shadow-[0_0_15px_rgba(180,190,254,0.3)] transform transition-all duration-200 scale-110">
            {currentLetter}
          </span>
        )}
      </div>
      
      <div className="mt-12 text-center space-y-4">
        <p className="text-subtext1 text-lg font-medium glass inline-block px-6 py-3 rounded-xl border border-white/5">
          Press <kbd className="px-3 py-1 bg-white/10 rounded-lg font-mono border border-white/10 text-text shadow-sm">SPACE</kbd> if letter matches <span className="text-blue font-bold text-xl">2-back</span>
        </p>
        <div className="flex gap-3 justify-center h-12 items-center">
          {testDataRef.current.sequence.slice(-3).map((letter, idx) => (
            <span key={idx} className="w-10 h-10 flex items-center justify-center glass rounded-lg font-mono text-text opacity-50 text-xl font-bold border border-white/5">
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkingMemoryTest;
