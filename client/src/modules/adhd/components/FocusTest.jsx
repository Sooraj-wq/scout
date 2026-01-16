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
        <div className="bg-mantle rounded-3xl p-8 max-w-2xl shadow-material-lg border border-surface0">
          <h2 className="text-3xl font-bold text-mauve mb-6">Phase 1: The Focus Test</h2>
          <div className="text-text space-y-4 mb-8">
            <p className="text-lg">
              This test measures your <span className="text-peach font-semibold">sustained attention</span> and 
              <span className="text-peach font-semibold"> impulse control</span>.
            </p>
            <div className="bg-surface0 rounded-2xl p-6 space-y-3">
              <h3 className="text-xl font-semibold text-lavender">Instructions:</h3>
              <ul className="list-disc list-inside space-y-2 text-subtext1">
                <li>Numbers will flash on the screen every 2 seconds</li>
                <li>Press <kbd className="px-3 py-1 bg-mauve text-base rounded-lg font-mono">SPACE</kbd> ONLY when you see the number <span className="text-peach text-xl font-bold">7</span></li>
                <li>Do NOT press for any other number</li>
                <li>React as quickly as possible</li>
              </ul>
            </div>
            <p className="text-subtext0 text-sm">Duration: 45 seconds</p>
          </div>
          <button
            onClick={startTest}
            className="w-full bg-mauve hover:bg-[#d4b4ff] text-base font-bold py-4 px-8 rounded-full transition-all duration-200 shadow-material hover:shadow-material-lg transform hover:scale-105"
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
        <div className="bg-surface0 rounded-full px-6 py-3 border border-surface1">
          <span className="text-peach font-mono text-xl font-bold">{timeLeft}s</span>
        </div>
      </div>
      
      <div className="bg-mantle rounded-3xl w-full max-w-md aspect-square flex items-center justify-center shadow-material-lg border border-surface0">
        {isVisible && currentNumber && (
          <span className="text-9xl font-bold text-mauve animate-pulse">
            {currentNumber}
          </span>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-subtext1 text-sm">
          Press <kbd className="px-3 py-1 bg-surface0 rounded-lg font-mono">SPACE</kbd> only on <span className="text-peach font-bold">7</span>
        </p>
      </div>
    </div>
  );
};

export default FocusTest;
