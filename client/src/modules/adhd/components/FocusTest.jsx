import { useState, useEffect, useCallback, useRef } from 'react';

const FocusTest = ({ onComplete }) => {
  const [currentNumber, setCurrentNumber] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isStarted, setIsStarted] = useState(false);
  
  const testDataRef = useRef({
    reactionTimes: [],
    commissionErrors: 0,
    correctHits: 0,
    totalSevens: 0,
    stimulusStartTime: null,
  });
  const completedRef = useRef(false);
  const hideTimeoutRef = useRef(null);
  const timeLeftRef = useRef(45);

  const generateRandomNumber = useCallback(() => {
    return Math.floor(Math.random() * 9) + 1; // 1-9
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.code === 'Space' && isVisible && isStarted) {
      e.preventDefault();
      const reactionTime = Date.now() - testDataRef.current.stimulusStartTime;
      
      if (currentNumber === 7) {
        // Correct hit
        testDataRef.current.correctHits++;
        testDataRef.current.reactionTimes.push(reactionTime);
      } else {
        // Commission error (pressed on non-7)
        testDataRef.current.commissionErrors++;
      }
    }
  }, [isVisible, currentNumber, isStarted]);

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
    onComplete({
      reactionTimes: testDataRef.current.reactionTimes,
      commissionErrors: testDataRef.current.commissionErrors,
      correctHits: testDataRef.current.correctHits,
      totalSevens: testDataRef.current.totalSevens,
    });
  }, [isStarted, timeLeft, onComplete]);

  useEffect(() => {
    if (!isStarted) return;

    const stimulusInterval = setInterval(() => {
      if (timeLeftRef.current <= 0) {
        return;
      }
      // Show number for 800ms
      const num = generateRandomNumber();
      setCurrentNumber(num);
      setIsVisible(true);
      testDataRef.current.stimulusStartTime = Date.now();
      
      if (num === 7) {
        testDataRef.current.totalSevens++;
      }

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        // Hide for 1200ms
        setIsVisible(false);
        setCurrentNumber(null);
      }, 800);
    }, 2000);

    return () => {
      clearInterval(stimulusInterval);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isStarted, generateRandomNumber]);

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
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mauve to-pink mb-6">Phase 1: The Focus Test</h2>
          <div className="text-text space-y-6 mb-8">
            <p className="text-lg">
              This test measures your <span className="text-peach font-bold drop-shadow-sm">sustained attention</span> and 
              <span className="text-peach font-bold drop-shadow-sm"> impulse control</span>.
            </p>
            <div className="glass rounded-2xl p-6 space-y-4 shadow-inner border border-white/5">
              <h3 className="text-xl font-bold text-lavender flex items-center gap-2">
                <span>📋</span> Instructions:
              </h3>
              <ul className="space-y-3 text-subtext1">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mauve shrink-0"></span>
                  <span>Numbers will flash on the screen every 2 seconds</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mauve shrink-0"></span>
                  <span>Press <kbd className="px-2 py-0.5 glass-card rounded border border-white/20 font-mono text-text">SPACE</kbd> <span className="underline decoration-red decoration-2 underline-offset-2">ONLY</span> when you see the number <span className="text-peach text-xl font-bold">7</span></span>
                </li>
                <li className="flex items-start gap-3">
                   <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red shrink-0"></span>
                  <span className="text-red/90 font-medium">Do NOT press for any other number</span>
                </li>
                <li className="flex items-start gap-3">
                   <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mauve shrink-0"></span>
                  <span>React as quickly as possible</span>
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
            Start Focus Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-8">
      <div className="mb-8">
        <div className="glass px-6 py-3 rounded-full border border-peach/30 shadow-[0_0_15px_rgba(250,179,135,0.2)]">
          <span className="text-peach font-mono text-2xl font-bold tracking-wider">{timeLeft}s</span>
        </div>
      </div>
      
      <div className="glass-panel rounded-3xl w-full max-w-md aspect-square flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-mauve/5 to-blue/5 opacity-50"></div>
        {isVisible && currentNumber && (
          <span className={`text-[10rem] font-bold transition-all duration-100 ${
            currentNumber === 7 
              ? 'text-transparent bg-clip-text bg-gradient-to-b from-peach to-red scale-110 drop-shadow-[0_0_30px_rgba(250,179,135,0.4)]' 
              : 'text-mauve drop-shadow-[0_0_10px_rgba(203,166,247,0.3)]'
          }`}>
            {currentNumber}
          </span>
        )}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-subtext1 text-lg font-medium glass inline-block px-6 py-3 rounded-xl border border-white/5">
          Press <kbd className="px-3 py-1 bg-white/10 rounded-lg font-mono border border-white/10 text-text shadow-sm">SPACE</kbd> only on <span className="text-peach font-bold text-xl">7</span>
        </p>
      </div>
    </div>
  );
};

export default FocusTest;
